using Microsoft.AspNetCore.Authorization;
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Controllers
{
    [Authorize(Roles = "ADMIN,OPERADOR")]
    [ApiController]
    [Route("api/[controller]")]
    public class AlertasController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public AlertasController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        // obtener todas las alertas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alerta>>> GetAlertas()
        {
            var alertas = await _context.Alertas
                .Include(a => a.Sensor)
                .Include(a => a.Lectura)
                .OrderByDescending(a => a.FechaGeneracion)
                .ToListAsync();

            return Ok(alertas);
        }

        // obtener una alerta por id
        [HttpGet("{id}")]
        public async Task<ActionResult<Alerta>> GetAlerta(int id)
        {
            var alerta = await _context.Alertas
                .Include(a => a.Sensor)
                .Include(a => a.Lectura)
                .FirstOrDefaultAsync(
                    a => a.IdAlerta == id
                );

            if (alerta == null)
            {
                return NotFound(
                    "La alerta no existe."
                );
            }

            return Ok(alerta);
        }

        // crear alerta manualmente
        [HttpPost]
        public async Task<ActionResult<Alerta>> CrearAlerta(
            Alerta alerta)
        {
            var sensorExiste = await _context.Sensores
                .AnyAsync(
                    s => s.IdSensor == alerta.IdSensor
                );

            if (!sensorExiste)
            {
                return BadRequest(
                    "El sensor especificado no existe."
                );
            }

            var lecturaExiste = await _context.Lecturas
                .AnyAsync(
                    l => l.IdLectura == alerta.IdLectura
                );

            if (!lecturaExiste)
            {
                return BadRequest(
                    "La lectura especificada no existe."
                );
            }

            alerta.FechaGeneracion = DateTime.UtcNow;
            alerta.Estado = "ACTIVA";

            _context.Alertas.Add(alerta);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetAlerta),
                new
                {
                    id = alerta.IdAlerta
                },
                alerta
            );
        }

        // actualizar estado de una alerta
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> ActualizarEstado(
            int id,
            [FromQuery] string estado)
        {
            if (string.IsNullOrWhiteSpace(estado))
            {
                return BadRequest(
                    "Debe especificar un estado."
                );
            }

            estado = estado
                .Trim()
                .ToUpper();

            var estadosPermitidos = new[]
            {
                "ACTIVA",
                "ATENDIDA"
            };

            if (!estadosPermitidos.Contains(estado))
            {
                return BadRequest(
                    "El estado debe ser ACTIVA o ATENDIDA."
                );
            }

            var alerta = await _context.Alertas
                .FindAsync(id);

            if (alerta == null)
            {
                return NotFound(
                    "La alerta no existe."
                );
            }

            alerta.Estado = estado;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Estado de la alerta actualizado correctamente.",

                idAlerta =
                    alerta.IdAlerta,

                estado =
                    alerta.Estado
            });
        }

        // eliminar alerta
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarAlerta(
            int id)
        {
            var alerta = await _context.Alertas
                .FindAsync(id);

            if (alerta == null)
            {
                return NotFound(
                    "La alerta no existe."
                );
            }

            _context.Alertas.Remove(alerta);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Alerta eliminada correctamente.",

                idAlerta =
                    id
            });
        }
    }
}