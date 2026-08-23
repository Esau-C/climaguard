using Microsoft.AspNetCore.Authorization;
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SensorsController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public SensorsController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        // obtener todos los sensores
        [HttpGet]
        [Authorize(Roles = "ADMIN,OPERADOR")]
        public async Task<ActionResult<IEnumerable<Sensor>>> GetSensores()
        {
            var sensores = await _context.Sensores
                .OrderByDescending(s => s.FechaRegistro)
                .ToListAsync();

            return Ok(sensores);
        }

        // obtener sensor por id
        [HttpGet("{id}")]
        [Authorize(Roles = "ADMIN,OPERADOR")]
        public async Task<ActionResult<Sensor>> GetSensor(int id)
        {
            var sensor = await _context.Sensores
                .FirstOrDefaultAsync(
                    s => s.IdSensor == id
                );

            if (sensor == null)
            {
                return NotFound(
                    "El sensor no existe."
                );
            }

            return Ok(sensor);
        }

        // crear sensor
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Sensor>> CrearSensor(
            Sensor sensor)
        {
            if (string.IsNullOrWhiteSpace(sensor.Nombre))
            {
                return BadRequest(
                    "El nombre del sensor es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(sensor.Tipo))
            {
                return BadRequest(
                    "El tipo del sensor es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(sensor.Ubicacion))
            {
                return BadRequest(
                    "La ubicacion del sensor es obligatoria."
                );
            }

            sensor.IdSensor = 0;

            sensor.Nombre = sensor.Nombre.Trim();
            sensor.Tipo = sensor.Tipo.Trim();
            sensor.Ubicacion = sensor.Ubicacion.Trim();

            sensor.FechaRegistro = DateTime.UtcNow;
            sensor.Activo = true;

            _context.Sensores.Add(sensor);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetSensor),
                new
                {
                    id = sensor.IdSensor
                },
                sensor
            );
        }

        // actualizar sensor
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ActualizarSensor(
            int id,
            Sensor datos)
        {
            var sensor = await _context.Sensores
                .FindAsync(id);

            if (sensor == null)
            {
                return NotFound(
                    "El sensor no existe."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Nombre))
            {
                return BadRequest(
                    "El nombre del sensor es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Tipo))
            {
                return BadRequest(
                    "El tipo del sensor es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Ubicacion))
            {
                return BadRequest(
                    "La ubicacion del sensor es obligatoria."
                );
            }

            sensor.Nombre =
                datos.Nombre.Trim();

            sensor.Tipo =
                datos.Tipo.Trim();

            sensor.Ubicacion =
                datos.Ubicacion.Trim();

            sensor.Latitud =
                datos.Latitud;

            sensor.Longitud =
                datos.Longitud;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Sensor actualizado correctamente.",

                sensor
            });
        }

        // cambiar estado activo/inactivo
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CambiarEstado(
            int id,
            [FromQuery] bool activo)
        {
            var sensor = await _context.Sensores
                .FindAsync(id);

            if (sensor == null)
            {
                return NotFound(
                    "El sensor no existe."
                );
            }

            sensor.Activo = activo;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = activo
                    ? "Sensor activado correctamente."
                    : "Sensor desactivado correctamente.",

                idSensor =
                    sensor.IdSensor,

                activo =
                    sensor.Activo
            });
        }

        // eliminar sensor
        // se mantiene solo para administracion,
        // pero no se recomienda usar si tiene lecturas
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> EliminarSensor(
            int id)
        {
            var sensor = await _context.Sensores
                .FindAsync(id);

            if (sensor == null)
            {
                return NotFound(
                    "El sensor no existe."
                );
            }

            var tieneLecturas =
                await _context.Lecturas
                    .AnyAsync(
                        l => l.IdSensor == id
                    );

            var tieneAlertas =
                await _context.Alertas
                    .AnyAsync(
                        a => a.IdSensor == id
                    );

            if (tieneLecturas || tieneAlertas)
            {
                return BadRequest(
                    "No se puede eliminar el sensor porque tiene lecturas o alertas relacionadas. Puede desactivarlo."
                );
            }

            _context.Sensores.Remove(sensor);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Sensor eliminado correctamente."
            });
        }
    }
}