
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Channels;

namespace ClimaGuard.API.Services
{
    public class SimuladorClimaticoService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SimuladorClimaticoService> _logger;
        private readonly IConfiguration _configuration;

        private readonly Channel<bool> _solicitudesReinicio =
            Channel.CreateBounded<bool>(
                new BoundedChannelOptions(1)
                {
                    FullMode = BoundedChannelFullMode.DropWrite,
                    SingleReader = true,
                    SingleWriter = false
                });

        private bool _habilitado;
        private int _intervaloSegundos;

        public SimuladorClimaticoService(
            IServiceScopeFactory scopeFactory,
            ILogger<SimuladorClimaticoService> logger,
            IConfiguration configuration)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _configuration = configuration;
        }

        // solicitar reinicio del ciclo de monitoreo
        public bool SolicitarReinicio()
        {
            if (!_habilitado)
            {
                return false;
            }

            return _solicitudesReinicio.Writer.TryWrite(true);
        }

       
        protected override async Task ExecuteAsync(
            CancellationToken stoppingToken)
        {
            _habilitado = _configuration.GetValue<bool>(
                "SimuladorClimatico:Habilitado", false);

            if (!_habilitado)
            {
                _logger.LogInformation(
                    "Simulador climatico desactivado.");

                return;
            }

            _intervaloSegundos = Math.Max(
                10,
                _configuration.GetValue<int>(
                    "SimuladorClimatico:IntervaloSegundos", 60));

            _logger.LogInformation(
                "Simulador climatico iniciado. Intervalo: {Intervalo} segundos.",
                _intervaloSegundos);

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    using var esperaCancelacion =
                        CancellationTokenSource.CreateLinkedTokenSource(
                            stoppingToken);

                    var tokenEspera = esperaCancelacion.Token;

                    var esperaIntervalo = Task.Delay(
                        TimeSpan.FromSeconds(_intervaloSegundos),
                        tokenEspera);

                    var esperaReinicio =
                        _solicitudesReinicio.Reader.ReadAsync(
                            tokenEspera).AsTask();

                    var tareaCompletada = await Task.WhenAny(
                        esperaIntervalo,
                        esperaReinicio);

                    // cancelar y esperar la tarea que no se utilizara
                    await esperaCancelacion.CancelAsync();

                    if (tareaCompletada == esperaReinicio)
                    {
                        await esperaReinicio;

                        while (_solicitudesReinicio.Reader.TryRead(out _))
                        {
                            // descartar solicitudes adicionales
                        }

                        _logger.LogInformation(
                            "Reinicio del monitoreo solicitado.");
                    }
                    else
                    {
                        await esperaIntervalo;
                    }

                    // generar una nueva ronda de lecturas
                    await GenerarLecturas(stoppingToken);

                    _logger.LogInformation(
                        "Ciclo de monitoreo completado.");
                }
            }
            catch (OperationCanceledException)
                when (stoppingToken.IsCancellationRequested)
            {
                // cierre normal del servicio
            }
        }


        private async Task GenerarLecturas(
            CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();

            var contexto = scope.ServiceProvider
                .GetRequiredService<ClimaGuardDbContext>();

            var analisisRiesgo = scope.ServiceProvider
                .GetRequiredService<AnalisisRiesgoService>();

            var sensores = await contexto.Sensores
                .AsNoTracking()
                .Where(s => s.Activo)
                .ToListAsync(cancellationToken);

            foreach (var sensor in sensores)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var lectura = CrearLecturaSimulada(sensor);

                if (lectura == null)
                {
                    _logger.LogWarning(
                        "Tipo de sensor no reconocido: {Tipo}, ID: {IdSensor}.",
                        sensor.Tipo,
                        sensor.IdSensor);

                    continue;
                }

                contexto.Lecturas.Add(lectura);

                await contexto.SaveChangesAsync(cancellationToken);

                await analisisRiesgo.AnalizarLectura(lectura);

                _logger.LogInformation(
                    "Lectura simulada registrada. Sensor: {IdSensor}, Lectura: {IdLectura}.",
                    sensor.IdSensor,
                    lectura.IdLectura);
            }
        }

        private static Lectura? CrearLecturaSimulada(Sensor sensor)
        {
            var tipo = sensor.Tipo.Trim().ToLowerInvariant();

            var lectura = new Lectura
            {
                IdSensor = sensor.IdSensor,
                FechaLectura = DateTime.UtcNow
            };

            switch (tipo)
            {
                case "temperatura":
                    lectura.Temperatura = GenerarValor(15, 40);
                    break;

                case "viento":
                case "velocidad del viento":
                    lectura.VelocidadViento = GenerarValor(0, 100);
                    break;

                case "nivel de humedad":
                case "humedad":
                    lectura.Humedad = GenerarValor(20, 100);
                    break;

                case "nivel de agua":
                case "nivel del agua":
                    lectura.NivelAgua = GenerarValor(0, 10);
                    break;

                case "lluvia":
                case "nivel de lluvia":
                    lectura.NivelLluvia = GenerarValor(0, 100);
                    break;

                default:
                    return null;
            }

            return lectura;
        }

        private static decimal GenerarValor(
            int minimo,
            int maximo)
        {
            return Math.Round(
                minimo + (decimal)Random.Shared.NextDouble()
                    * (maximo - minimo),
                2);
        }
    }
}
