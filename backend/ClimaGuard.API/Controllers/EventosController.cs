
using Microsoft.AspNetCore.Authorization;
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using ClimaGuard.API.Services;
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
        private readonly BitacoraService _bitacoraService;

        public EventosController(
            ClimaGuardDbContext context,
            BitacoraService bitacoraService)
        {
            _context = context;
            _bitacoraService = bitacoraService;
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
                return NotFound("El evento no existe.");
            }

            return Ok(evento);
        }

        [HttpPost]
        public async Task<ActionResult<Evento>> CrearEvento(Evento evento)
        {
            if (string.IsNullOrWhiteSpace(evento.TipoFenomeno))
            {
                return BadRequest("El tipo de fenomeno es obligatorio.");
            }

            if (string.IsNullOrWhiteSpace(evento.Nivel))
            {
                return BadRequest("El nivel del evento es obligatorio.");
            }

            var alerta = await _context.Alertas
                .Include(a => a.Lectura)
                .FirstOrDefaultAsync(a => a.IdAlerta == evento.IdAlerta);

            if (alerta == null)
            {
                return BadRequest("La alerta especificada no existe.");
            }

            var sensorExiste = await _context.Sensores
                .AnyAsync(s => s.IdSensor == evento.IdSensor);

            if (!sensorExiste)
            {
                return BadRequest("El sensor especificado no existe.");
            }

            if (alerta.Lectura == null)
            {
                return BadRequest("La alerta no tiene una lectura asociada.");
            }

            if (alerta.Lectura.IdSensor != evento.IdSensor)
            {
                return BadRequest(
                    "El sensor no corresponde a la alerta indicada."
                );
            }

            var eventoDuplicado = await _context.Eventos
                .AnyAsync(e => e.IdAlerta == evento.IdAlerta);

            if (eventoDuplicado)
            {
                return Conflict(
                    "Ya existe un evento registrado para esta alerta."
                );
            }

            evento.IdEvento = 0;
            evento.TipoFenomeno = evento.TipoFenomeno.Trim();
            evento.Nivel = evento.Nivel.Trim().ToUpperInvariant();
            evento.FechaInicio = DateTime.UtcNow;
            evento.FechaFin = null;
            evento.Estado = "ACTIVO";
            evento.Alerta = null;
            evento.Sensor = null;

            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            _context.Eventos.Add(evento);
            await _context.SaveChangesAsync();

            _bitacoraService.Registrar(
                "CREAR",
                "EVENTO",
                evento.IdEvento.ToString(),
                $"Se creo el evento climatico {evento.IdEvento}"
            );

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

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
                return NotFound("El evento no existe.");
            }

            if (evento.Estado == "CERRADO")
            {
                return Conflict("El evento ya se encuentra cerrado.");
            }

            evento.Estado = "CERRADO";
            evento.FechaFin = DateTime.UtcNow;

            _bitacoraService.Registrar(
                "CERRAR",
                "EVENTO",
                evento.IdEvento.ToString(),
                $"Se cerro el evento climatico {evento.IdEvento}"
            );

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "ADMIN")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarEvento(int id)
        {
            var evento = await _context.Eventos.FindAsync(id);

            if (evento == null)
            {
                return NotFound("El evento no existe.");
            }

            if (evento.Estado == "ACTIVO")
            {
                return Conflict(
                    "No se puede eliminar un evento activo. Debe cerrarlo primero."
                );
            }

            _context.Eventos.Remove(evento);

            _bitacoraService.Registrar(
                "ELIMINAR",
                "EVENTO",
                evento.IdEvento.ToString(),
                $"Se elimino el evento climatico {evento.IdEvento}"
            );

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
