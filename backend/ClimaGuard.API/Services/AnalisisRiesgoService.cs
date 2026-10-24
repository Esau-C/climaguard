
using ClimaGuard.API.Data;
using ClimaGuard.API.Hubs;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Services
{
    public class AnalisisRiesgoService
    {
        private readonly ClimaGuardDbContext _context;
        private readonly IHubContext<AlertHub> _hubContext;

        public AnalisisRiesgoService(
            ClimaGuardDbContext context,
            IHubContext<AlertHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<List<Alerta>> AnalizarLectura(Lectura lectura)
        {
            var alertas = new List<Alerta>();

            // consultar las reglas activas desde la base de datos
            var reglas = await _context.ReglasAlerta
                .AsNoTracking()
                .Where(r => r.Activa)
                .ToListAsync();

            // evaluar todas las reglas y agrupar por fenomeno
            var reglasCumplidas = reglas
                .Where(r => CumpleRegla(r, lectura))
                .GroupBy(r => r.TipoFenomeno.Trim().ToUpperInvariant());

            foreach (var grupo in reglasCumplidas)
            {
                // seleccionar solo la regla de mayor prioridad
                var reglaMayor = grupo
                    .OrderByDescending(r => PrioridadNivel(r.Nivel))
                    .ThenBy(r => r.IdReglaAlerta)
                    .First();

                alertas.Add(CrearAlerta(
                    lectura,
                    NombreFenomeno(reglaMayor.TipoFenomeno),
                    reglaMayor.Nivel.Trim().ToUpperInvariant(),
                    reglaMayor.Titulo,
                    reglaMayor.Mensaje
                ));
            }

            // guardar las alertas generadas
            if (alertas.Count > 0)
            {
                _context.Alertas.AddRange(alertas);
                await _context.SaveChangesAsync();

                // notificar al frontend mediante signalr
                foreach (var alerta in alertas)
                {
                    await _hubContext.Clients.All.SendAsync(
                        "NuevaAlerta",
                        new
                        {
                            alerta.IdAlerta,
                            alerta.IdSensor,
                            alerta.IdLectura,
                            alerta.TipoFenomeno,
                            alerta.Nivel,
                            alerta.Titulo,
                            alerta.Mensaje,
                            alerta.Estado,
                            alerta.FechaGeneracion
                        }
                    );
                }
            }

            return alertas;
        }

        private bool CumpleRegla(ReglaAlerta regla, Lectura lectura)
        {
            var valorPrincipal = ObtenerValor(
                lectura,
                regla.Variable
            );

            if (!valorPrincipal.HasValue)
            {
                return false;
            }

            var cumplePrincipal = Comparar(
                valorPrincipal.Value,
                regla.Operador,
                regla.Umbral
            );

            if (!cumplePrincipal)
            {
                return false;
            }

            // si no existe condicion secundaria, basta la principal
            if (string.IsNullOrWhiteSpace(regla.VariableSecundaria))
            {
                return true;
            }

            // una condicion secundaria incompleta no debe activarse
            if (string.IsNullOrWhiteSpace(regla.OperadorSecundario) ||
                !regla.UmbralSecundario.HasValue)
            {
                return false;
            }

            var valorSecundario = ObtenerValor(
                lectura,
                regla.VariableSecundaria
            );

            if (!valorSecundario.HasValue)
            {
                return false;
            }

            // ambas condiciones deben cumplirse
            return Comparar(
                valorSecundario.Value,
                regla.OperadorSecundario,
                regla.UmbralSecundario.Value
            );
        }

        private decimal? ObtenerValor(
            Lectura lectura,
            string variable)
        {
            return variable.Trim().ToLowerInvariant() switch
            {
                "temperatura" => lectura.Temperatura,
                "humedad" => lectura.Humedad,
                "velocidadviento" => lectura.VelocidadViento,
                "nivellluvia" => lectura.NivelLluvia,
                "nivelagua" => lectura.NivelAgua,
                _ => null
            };
        }

        private bool Comparar(
            decimal valor,
            string operador,
            decimal umbral)
        {
            return operador.Trim() switch
            {
                ">" => valor > umbral,
                ">=" => valor >= umbral,
                "<" => valor < umbral,
                "<=" => valor <= umbral,
                "==" => valor == umbral,
                "=" => valor == umbral,
                "!=" => valor != umbral,
                _ => false
            };
        }

        private int PrioridadNivel(string nivel)
        {
            return nivel.Trim().ToUpperInvariant() switch
            {
                "ROJO" => 3,
                "NARANJA" => 2,
                "AMARILLO" => 1,
                _ => 0
            };
        }

        private string NombreFenomeno(string tipoFenomeno)
        {
            return tipoFenomeno.Trim().ToUpperInvariant() switch
            {
                "INUNDACION" => "Inundacion",
                "TORMENTA" => "Tormenta",
                "INCENDIO" => "Incendio forestal",
                _ => tipoFenomeno.Trim()
            };
        }

        private Alerta CrearAlerta(
            Lectura lectura,
            string tipoFenomeno,
            string nivel,
            string titulo,
            string mensaje)
        {
            return new Alerta
            {
                IdSensor = lectura.IdSensor,
                IdLectura = lectura.IdLectura,
                TipoFenomeno = tipoFenomeno,
                Nivel = nivel,
                Titulo = titulo,
                Mensaje = mensaje,
                FechaGeneracion = DateTime.UtcNow,
                Estado = "ACTIVA"
            };
        }
    }
}
