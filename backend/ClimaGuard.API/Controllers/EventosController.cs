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
    public class EventosController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public EventosController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Evento>>> GetEventos()
        {
            return await _context.Eventos
                .Include(e => e.Alerta)
                    .ThenInclude(a => a!.Lectura)
                .Include(e => e.Sensor)
                .OrderByDescending(e => e.FechaInicio)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Evento>> GetEvento(int id)
        {
            var evento = await _context.Eventos
                .Include(e => e.Alerta)
                    .ThenInclude(a => a!.Lectura)
                .Include(e => e.Sensor)
                .FirstOrDefaultAsync(e => e.IdEvento == id);

            if (evento == null)
            {
                return NotFound();
            }

            return evento;
        }

        [HttpPost]
        public async Task<ActionResult<Evento>> CrearEvento(Evento evento)
        {
            var alertaExiste = await _context.Alertas
                .AnyAsync(a => a.IdAlerta == evento.IdAlerta);

            if (!alertaExiste)
            {
                return BadRequest("La alerta especificada no existe.");
            }

            var sensorExiste = await _context.Sensores
                .AnyAsync(s => s.IdSensor == evento.IdSensor);

            if (!sensorExiste)
            {
                return BadRequest("El sensor especificado no existe.");
            }

            evento.FechaInicio = DateTime.UtcNow;
            evento.Estado = "ACTIVO";

            _context.Eventos.Add(evento);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetEvento),
                new { id = evento.IdEvento },
                evento
            );
        }

        [HttpPut("{id}/cerrar")]
        public async Task<IActionResult> CerrarEvento(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);

            if (evento == null)
            {
                return NotFound();
            }

            evento.Estado = "CERRADO";
            evento.FechaFin = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarEvento(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);

            if (evento == null)
            {
                return NotFound();
            }

            _context.Eventos.Remove(evento);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}