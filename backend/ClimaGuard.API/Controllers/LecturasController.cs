using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using ClimaGuard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "ADMIN,OPERADOR")]
    public class LecturasController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;
        private readonly AnalisisRiesgoService _analisisRiesgoService;

        public LecturasController(
            ClimaGuardDbContext context,
            AnalisisRiesgoService analisisRiesgoService)
        {
            _context = context;
            _analisisRiesgoService = analisisRiesgoService;
        }

        // GET: api/lecturas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lectura>>> GetLecturas()
        {
            return await _context.Lecturas
                .Include(l => l.Sensor)
                    .ThenInclude(s => s!.Comunidad)
                .OrderByDescending(l => l.FechaLectura)
                .ToListAsync();
        }

        // GET: api/lecturas/1
        [HttpGet("{id}")]
        public async Task<ActionResult<Lectura>> GetLectura(long id)
        {
            var lectura = await _context.Lecturas
                .Include(l => l.Sensor)
                    .ThenInclude(s => s!.Comunidad)
                .FirstOrDefaultAsync(
                    l => l.IdLectura == id
                );

            if (lectura == null)
            {
                return NotFound(
                    "Lectura no encontrada."
                );
            }

            return lectura;
        }

        // GET: api/lecturas/sensor/2
        [HttpGet("sensor/{idSensor}")]
        public async Task<ActionResult<IEnumerable<Lectura>>> GetLecturasPorSensor(
            int idSensor)
        {
            var sensorExiste = await _context.Sensores
                .AnyAsync(
                    s => s.IdSensor == idSensor
                );

            if (!sensorExiste)
            {
                return NotFound(
                    "El sensor no existe."
                );
            }

            return await _context.Lecturas
                .Include(l => l.Sensor)
                    .ThenInclude(s => s!.Comunidad)
                .Where(
                    l => l.IdSensor == idSensor
                )
                .OrderByDescending(
                    l => l.FechaLectura
                )
                .ToListAsync();
        }

        // POST: api/lecturas
        [HttpPost]
        public async Task<IActionResult> CrearLectura(
            Lectura lectura)
        {
            var sensor = await _context.Sensores
                .FirstOrDefaultAsync(
                    s => s.IdSensor ==
                         lectura.IdSensor
                );

            if (sensor == null)
            {
                return BadRequest(
                    "El sensor indicado no existe."
                );
            }

            if (!sensor.Activo)
            {
                return BadRequest(
                    "El sensor se encuentra inactivo."
                );
            }

            // estos valores se generan en el servidor
            lectura.IdLectura = 0;
            lectura.FechaLectura =
                DateTime.UtcNow;

            // evita que entity framework
            // intente insertar el sensor
            lectura.Sensor = null;

            _context.Lecturas.Add(
                lectura
            );

            await _context
                .SaveChangesAsync();

            // analizar automaticamente
            // todos los posibles riesgos
            var alertas =
                await _analisisRiesgoService
                    .AnalizarLectura(
                        lectura
                    );

            return CreatedAtAction(
                nameof(GetLectura),
                new
                {
                    id = lectura.IdLectura
                },
                new
                {
                    mensaje =
                        alertas.Count == 0
                            ? "Lectura registrada sin riesgo detectado."
                            : $"Lectura registrada y {alertas.Count} alerta(s) generada(s).",

                    lectura = new
                    {
                        lectura.IdLectura,
                        lectura.IdSensor,
                        lectura.Temperatura,
                        lectura.Humedad,
                        lectura.VelocidadViento,
                        lectura.NivelLluvia,
                        lectura.NivelAgua,
                        lectura.FechaLectura
                    },

                    alertas =
                        alertas.Select(
                            a => new
                            {
                                a.IdAlerta,
                                a.IdSensor,
                                a.IdLectura,
                                a.TipoFenomeno,
                                a.Nivel,
                                a.Titulo,
                                a.Mensaje,
                                a.Estado,
                                a.FechaGeneracion
                            }
                        )
                }
            );
        }

        // DELETE: api/lecturas/1
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> EliminarLectura(
            long id)
        {
            var lectura =
                await _context.Lecturas
                    .FindAsync(id);

            if (lectura == null)
            {
                return NotFound(
                    "Lectura no encontrada."
                );
            }

            _context.Lecturas.Remove(
                lectura
            );

            await _context
                .SaveChangesAsync();

            return NoContent();
        }
    }
}