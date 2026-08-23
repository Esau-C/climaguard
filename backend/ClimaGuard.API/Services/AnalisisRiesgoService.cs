using ClimaGuard.API.Data;
using ClimaGuard.API.Hubs;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.SignalR;

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

        public async Task<List<Alerta>> AnalizarLectura(
            Lectura lectura)
        {
            var alertas =
                new List<Alerta>();


            // =====================================================
            // INUNDACION
            // =====================================================

            if (
                lectura.NivelAgua >= 3.0m
            )
            {
                alertas.Add(
                    CrearAlerta(
                        lectura,
                        "Inundacion",
                        "ROJO",
                        "Riesgo alto de inundacion",
                        "El nivel de agua ha alcanzado un nivel critico."
                    )
                );
            }
            else if (
                lectura.NivelAgua >= 2.0m
            )
            {
                alertas.Add(
                    CrearAlerta(
                        lectura,
                        "Inundacion",
                        "NARANJA",
                        "Riesgo de inundacion",
                        "El nivel de agua se encuentra elevado."
                    )
                );
            }
            else if (
                lectura.NivelAgua >= 1.5m
            )
            {
                alertas.Add(
                    CrearAlerta(
                        lectura,
                        "Inundacion",
                        "AMARILLO",
                        "Nivel de agua en aumento",
                        "Se recomienda monitorear el nivel de agua."
                    )
                );
            }


            // =====================================================
            // TORMENTA
            // =====================================================

            var mensajesTormenta =
                new List<string>();

            string? nivelTormenta =
                null;


            // nivel de lluvia
            if (
                lectura.NivelLluvia >= 80.0m
            )
            {
                nivelTormenta =
                    NivelMayor(
                        nivelTormenta,
                        "ROJO"
                    );

                mensajesTormenta.Add(
                    "Se detecto una cantidad critica de lluvia."
                );
            }
            else if (
                lectura.NivelLluvia >= 50.0m
            )
            {
                nivelTormenta =
                    NivelMayor(
                        nivelTormenta,
                        "NARANJA"
                    );

                mensajesTormenta.Add(
                    "Se detecto un nivel elevado de lluvia."
                );
            }
            else if (
                lectura.NivelLluvia >= 30.0m
            )
            {
                nivelTormenta =
                    NivelMayor(
                        nivelTormenta,
                        "AMARILLO"
                    );

                mensajesTormenta.Add(
                    "Se recomienda monitorear las condiciones de lluvia."
                );
            }


            // velocidad del viento
            if (
                lectura.VelocidadViento >= 80.0m
            )
            {
                nivelTormenta =
                    NivelMayor(
                        nivelTormenta,
                        "ROJO"
                    );

                mensajesTormenta.Add(
                    "Se detectaron velocidades de viento criticas."
                );
            }
            else if (
                lectura.VelocidadViento >= 60.0m
            )
            {
                nivelTormenta =
                    NivelMayor(
                        nivelTormenta,
                        "NARANJA"
                    );

                mensajesTormenta.Add(
                    "Se detectaron velocidades de viento elevadas."
                );
            }
            else if (
                lectura.VelocidadViento >= 40.0m
            )
            {
                nivelTormenta =
                    NivelMayor(
                        nivelTormenta,
                        "AMARILLO"
                    );

                mensajesTormenta.Add(
                    "Se recomienda monitorear la velocidad del viento."
                );
            }


            if (
                nivelTormenta != null
            )
            {
                alertas.Add(
                    CrearAlerta(
                        lectura,
                        "Tormenta",
                        nivelTormenta,
                        ObtenerTituloTormenta(
                            nivelTormenta
                        ),
                        string.Join(
                            " ",
                            mensajesTormenta
                        )
                    )
                );
            }


            // =====================================================
            // INCENDIO FORESTAL
            // ahora usa temperatura + humedad
            // =====================================================

            var temperatura =
                lectura.Temperatura;

            var humedad =
                lectura.Humedad;


            if (
                temperatura.HasValue &&
                humedad.HasValue
            )
            {
                // rojo
                if (
                    temperatura.Value >= 45.0m &&
                    humedad.Value <= 30.0m
                )
                {
                    alertas.Add(
                        CrearAlerta(
                            lectura,
                            "Incendio forestal",
                            "ROJO",
                            "Riesgo critico de incendio forestal",
                            "Se detecto temperatura extremadamente alta y humedad muy baja."
                        )
                    );
                }

                // naranja
                else if (
                    temperatura.Value >= 40.0m &&
                    humedad.Value <= 45.0m
                )
                {
                    alertas.Add(
                        CrearAlerta(
                            lectura,
                            "Incendio forestal",
                            "NARANJA",
                            "Riesgo elevado de incendio forestal",
                            "Se detecto temperatura alta y humedad baja."
                        )
                    );
                }

                // amarillo
                else if (
                    temperatura.Value >= 35.0m &&
                    humedad.Value <= 60.0m
                )
                {
                    alertas.Add(
                        CrearAlerta(
                            lectura,
                            "Incendio forestal",
                            "AMARILLO",
                            "Condiciones favorables para incendio",
                            "La temperatura se encuentra elevada y la humedad ha disminuido."
                        )
                    );
                }
            }


            // =====================================================
            // GUARDAR Y EMITIR ALERTAS
            // =====================================================

            if (
                alertas.Count > 0
            )
            {
                _context.Alertas.AddRange(
                    alertas
                );

                await _context
                    .SaveChangesAsync();


                foreach (
                    var alerta in alertas
                )
                {
                    await _hubContext
                        .Clients
                        .All
                        .SendAsync(
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


        // =====================================================
        // CREAR ALERTA
        // =====================================================

        private Alerta CrearAlerta(
            Lectura lectura,
            string tipoFenomeno,
            string nivel,
            string titulo,
            string mensaje)
        {
            return new Alerta
            {
                IdSensor =
                    lectura.IdSensor,

                IdLectura =
                    lectura.IdLectura,

                TipoFenomeno =
                    tipoFenomeno,

                Nivel =
                    nivel,

                Titulo =
                    titulo,

                Mensaje =
                    mensaje,

                FechaGeneracion =
                    DateTime.UtcNow,

                Estado =
                    "ACTIVA"
            };
        }


        // =====================================================
        // NIVEL MAYOR
        // =====================================================

        private string NivelMayor(
            string? nivelActual,
            string nuevoNivel)
        {
            if (
                nivelActual == null
            )
            {
                return nuevoNivel;
            }


            var prioridad =
                new Dictionary<string, int>
                {
                    {
                        "AMARILLO",
                        1
                    },
                    {
                        "NARANJA",
                        2
                    },
                    {
                        "ROJO",
                        3
                    }
                };


            return
                prioridad[nuevoNivel] >
                prioridad[nivelActual]

                    ? nuevoNivel

                    : nivelActual;
        }


        // =====================================================
        // TITULO TORMENTA
        // =====================================================

        private string ObtenerTituloTormenta(
            string nivel)
        {
            return nivel switch
            {
                "ROJO" =>
                    "Tormenta severa",

                "NARANJA" =>
                    "Condiciones de tormenta",

                "AMARILLO" =>
                    "Condiciones meteorologicas en aumento",

                _ =>
                    "Tormenta"
            };
        }
    }
}