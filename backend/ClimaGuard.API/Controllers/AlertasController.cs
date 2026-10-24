
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
    public class AlertasController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;
        private readonly BitacoraService _bitacoraService;

        public AlertasController(
            ClimaGuardDbContext context,
            BitacoraService bitacoraService)
        {
            _context = context;
            _bitacoraService = bitacoraService;
        }

        // obtener todas las alertas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alerta>>> GetAlertas()
        {
            var alertas = await _context.Alertas
                .Include(a => a.Sensor)
                    .ThenInclude(s => s!.Comunidad)
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
                    .ThenInclude(s => s!.Comunidad)
                .Include(a => a.Lectura)
                .FirstOrDefaultAsync(a => a.IdAlerta == id);

            if (alerta == null)
            {
                return NotFound("La alerta no existe.");
            }

            return Ok(alerta);
        }

        // crear alerta manualmente
        [HttpPost]
        public async Task<ActionResult<Alerta>> CrearAlerta(
            Alerta alerta)
        {
            var sensorExiste = await _context.Sensores
                .AnyAsync(s => s.IdSensor == alerta.IdSensor);

            if (!sensorExiste)
            {
                return BadRequest(
                    "El sensor especificado no existe.");
            }

            var lecturaExiste = await _context.Lecturas
                .AnyAsync(l => l.IdLectura == alerta.IdLectura);

            if (!lecturaExiste)
            {
                return BadRequest(
                    "La lectura especificada no existe.");
            }

            // verificar que la lectura pertenezca al sensor
            var lecturaCorresponde = await _context.Lecturas
                .AnyAsync(l =>
                    l.IdLectura == alerta.IdLectura &&
                    l.IdSensor == alerta.IdSensor);

            if (!lecturaCorresponde)
            {
                return BadRequest(
                    "La lectura no corresponde al sensor indicado.");
            }

            alerta.IdAlerta = 0;
            alerta.FechaGeneracion = DateTime.UtcNow;
            alerta.Estado = "ACTIVA";
            alerta.Sensor = null;
            alerta.Lectura = null;

            // guardar alerta y auditoria en una transaccion
            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            _context.Alertas.Add(alerta);
            await _context.SaveChangesAsync();

            _bitacoraService.Registrar(
                "CREAR",
                "ALERTA",
                alerta.IdAlerta.ToString(),
                $"Se creo manualmente la alerta {alerta.IdAlerta} " +
                $"para el sensor {alerta.IdSensor}"
            );

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            return CreatedAtAction(
                nameof(GetAlerta),
                new { id = alerta.IdAlerta },
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
                    "Debe especificar un estado.");
            }

            estado = estado.Trim().ToUpperInvariant();

            var estadosPermitidos = new[]
            {
                "ACTIVA",
                "ATENDIDA"
            };

            if (!estadosPermitidos.Contains(estado))
            {
                return BadRequest(
                    "El estado debe ser ACTIVA o ATENDIDA.");
            }

            var alerta = await _context.Alertas.FindAsync(id);

            if (alerta == null)
            {
                return NotFound("La alerta no existe.");
            }

            var estadoAnterior = alerta.Estado;

            if (estadoAnterior == estado)
            {
                return Ok(new
                {
                    mensaje = "La alerta ya tiene el estado indicado.",
                    idAlerta = alerta.IdAlerta,
                    estado = alerta.Estado
                });
            }

            // guardar cambio de estado y auditoria juntos
            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            alerta.Estado = estado;

            var accion = estado == "ATENDIDA"
                ? "ATENDER"
                : "REACTIVAR";

            _bitacoraService.Registrar(
                accion,
                "ALERTA",
                alerta.IdAlerta.ToString(),
                $"Se cambio el estado de la alerta " +
                $"{alerta.IdAlerta} de {estadoAnterior} a {estado}"
            );

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            return Ok(new
            {
                mensaje =
                    "Estado de la alerta actualizado correctamente.",
                idAlerta = alerta.IdAlerta,
                estado = alerta.Estado
            });
        }

        // eliminar alerta
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarAlerta(int id)
        {
            var alerta = await _context.Alertas.FindAsync(id);

            if (alerta == null)
            {
                return NotFound("La alerta no existe.");
            }

            // guardar informacion antes de eliminar
            var idAlerta = alerta.IdAlerta;
            var idSensor = alerta.IdSensor;
            var titulo = alerta.Titulo;

            // eliminar alerta y registrar auditoria en una transaccion
            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            _context.Alertas.Remove(alerta);

            _bitacoraService.Registrar(
                "ELIMINAR",
                "ALERTA",
                idAlerta.ToString(),
                $"Se elimino la alerta {idAlerta} ({titulo}) " +
                $"del sensor {idSensor}"
            );

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            return Ok(new
            {
                mensaje = "Alerta eliminada correctamente.",
                idAlerta = idAlerta
            });
        }



    }
}
