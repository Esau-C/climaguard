
using Microsoft.AspNetCore.Authorization;
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using ClimaGuard.API.Services;
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
        private readonly BitacoraService _bitacoraService;

        public SensorsController(
            ClimaGuardDbContext context,
            BitacoraService bitacoraService)
        {
            _context = context;
            _bitacoraService = bitacoraService;
        }

        // obtener todos los sensores
        [HttpGet]
        [Authorize(Roles = "ADMIN,OPERADOR")]
        public async Task<ActionResult<IEnumerable<Sensor>>> GetSensores()
        {
            var sensores = await _context.Sensores
                .Include(s => s.Comunidad)
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
                .Include(s => s.Comunidad)
                .FirstOrDefaultAsync(s => s.IdSensor == id);

            if (sensor == null)
            {
                return NotFound("El sensor no existe.");
            }

            return Ok(sensor);
        }

        // crear sensor
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Sensor>> CrearSensor(Sensor sensor)
        {
            if (string.IsNullOrWhiteSpace(sensor.Nombre))
                return BadRequest("El nombre del sensor es obligatorio.");

            if (string.IsNullOrWhiteSpace(sensor.Codigo))
                return BadRequest("El codigo del sensor es obligatorio.");

            if (string.IsNullOrWhiteSpace(sensor.Tipo))
                return BadRequest("El tipo del sensor es obligatorio.");

            if (string.IsNullOrWhiteSpace(sensor.Ubicacion))
                return BadRequest("La ubicacion del sensor es obligatoria.");

            if (string.IsNullOrWhiteSpace(sensor.UnidadMedida))
                return BadRequest("La unidad de medida es obligatoria.");

            // validar coordenadas geograficas
            if (sensor.Latitud < -90 || sensor.Latitud > 90)
                return BadRequest("La latitud debe estar entre -90 y 90.");

            if (sensor.Longitud < -180 || sensor.Longitud > 180)
                return BadRequest("La longitud debe estar entre -180 y 180.");

            sensor.Nombre = sensor.Nombre.Trim();
            sensor.Codigo = sensor.Codigo.Trim().ToUpperInvariant();
            sensor.Tipo = sensor.Tipo.Trim();
            sensor.Ubicacion = sensor.Ubicacion.Trim();
            sensor.UnidadMedida = sensor.UnidadMedida.Trim();

            if (!string.IsNullOrWhiteSpace(sensor.Descripcion))
            {
                sensor.Descripcion = sensor.Descripcion.Trim();
            }

            // validar codigo unico
            var codigoExiste = await _context.Sensores
                .AnyAsync(s => s.Codigo == sensor.Codigo);

            if (codigoExiste)
            {
                return BadRequest("Ya existe un sensor con ese codigo.");
            }

            // validar comunidad
            if (sensor.IdComunidad.HasValue)
            {
                var comunidad = await _context.Comunidades
                    .FirstOrDefaultAsync(c =>
                        c.IdComunidad == sensor.IdComunidad.Value);

                if (comunidad == null)
                {
                    return BadRequest(
                        "La comunidad especificada no existe.");
                }

                if (!comunidad.Activa)
                {
                    return BadRequest(
                        "La comunidad especificada se encuentra inactiva.");
                }
            }

            sensor.IdSensor = 0;
            sensor.FechaRegistro = DateTime.UtcNow;
            sensor.Activo = true;
            sensor.Comunidad = null;

            // guardar sensor y auditoria en una transaccion
            await using var transaccion =
                await _context.Database.BeginTransactionAsync();

            _context.Sensores.Add(sensor);
            await _context.SaveChangesAsync();

            _bitacoraService.Registrar(
                "CREAR",
                "SENSOR",
                sensor.IdSensor.ToString(),
                $"Se creo el sensor {sensor.Nombre} ({sensor.Codigo})"
            );

            await _context.SaveChangesAsync();
            await transaccion.CommitAsync();

            var sensorCreado = await _context.Sensores
                .Include(s => s.Comunidad)
                .FirstAsync(s => s.IdSensor == sensor.IdSensor);

            return CreatedAtAction(
                nameof(GetSensor),
                new { id = sensorCreado.IdSensor },
                sensorCreado
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
                .Include(s => s.Comunidad)
                .FirstOrDefaultAsync(s => s.IdSensor == id);

            if (sensor == null)
                return NotFound("El sensor no existe.");

            if (string.IsNullOrWhiteSpace(datos.Nombre))
                return BadRequest("El nombre del sensor es obligatorio.");

            if (string.IsNullOrWhiteSpace(datos.Codigo))
                return BadRequest("El codigo del sensor es obligatorio.");

            if (string.IsNullOrWhiteSpace(datos.Tipo))
                return BadRequest("El tipo del sensor es obligatorio.");

            if (string.IsNullOrWhiteSpace(datos.Ubicacion))
                return BadRequest("La ubicacion del sensor es obligatoria.");

            if (string.IsNullOrWhiteSpace(datos.UnidadMedida))
                return BadRequest("La unidad de medida es obligatoria.");

            // validar coordenadas geograficas
            if (datos.Latitud < -90 || datos.Latitud > 90)
                return BadRequest("La latitud debe estar entre -90 y 90.");

            if (datos.Longitud < -180 || datos.Longitud > 180)
                return BadRequest("La longitud debe estar entre -180 y 180.");

            var codigo = datos.Codigo.Trim().ToUpperInvariant();

            // validar codigo duplicado
            var codigoExiste = await _context.Sensores
                .AnyAsync(s =>
                    s.Codigo == codigo &&
                    s.IdSensor != id);

            if (codigoExiste)
            {
                return BadRequest(
                    "Ya existe otro sensor con ese codigo.");
            }

            // validar comunidad
            if (datos.IdComunidad.HasValue)
            {
                var comunidad = await _context.Comunidades
                    .FirstOrDefaultAsync(c =>
                        c.IdComunidad == datos.IdComunidad.Value);

                if (comunidad == null)
                {
                    return BadRequest(
                        "La comunidad especificada no existe.");
                }

                if (!comunidad.Activa)
                {
                    return BadRequest(
                        "La comunidad especificada se encuentra inactiva.");
                }
            }

            sensor.Nombre = datos.Nombre.Trim();
            sensor.Codigo = codigo;
            sensor.Tipo = datos.Tipo.Trim();
            sensor.IdComunidad = datos.IdComunidad;
            sensor.Ubicacion = datos.Ubicacion.Trim();
            sensor.UnidadMedida = datos.UnidadMedida.Trim();
            sensor.Latitud = datos.Latitud;
            sensor.Longitud = datos.Longitud;
            sensor.FechaInstalacion = datos.FechaInstalacion;

            sensor.Descripcion =
                string.IsNullOrWhiteSpace(datos.Descripcion)
                    ? null
                    : datos.Descripcion.Trim();

            // registrar auditoria antes de guardar
            _bitacoraService.Registrar(
                "ACTUALIZAR",
                "SENSOR",
                sensor.IdSensor.ToString(),
                $"Se actualizo el sensor {sensor.Nombre} ({sensor.Codigo})"
            );

            await _context.SaveChangesAsync();

            var sensorActualizado = await _context.Sensores
                .Include(s => s.Comunidad)
                .FirstAsync(s => s.IdSensor == id);

            return Ok(new
            {
                mensaje = "Sensor actualizado correctamente.",
                sensor = sensorActualizado
            });
        }

        // activar o desactivar sensor
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CambiarEstado(
            int id,
            [FromQuery] bool activo)
        {
            var sensor = await _context.Sensores.FindAsync(id);

            if (sensor == null)
            {
                return NotFound("El sensor no existe.");
            }

            sensor.Activo = activo;

            _bitacoraService.Registrar(
                activo ? "ACTIVAR" : "DESACTIVAR",
                "SENSOR",
                sensor.IdSensor.ToString(),
                activo
                    ? $"Se activo el sensor {sensor.Nombre}"
                    : $"Se desactivo el sensor {sensor.Nombre}"
            );

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = activo
                    ? "Sensor activado correctamente."
                    : "Sensor desactivado correctamente.",
                idSensor = sensor.IdSensor,
                activo = sensor.Activo
            });
        }

        // eliminar sensor
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> EliminarSensor(int id)
        {
            var sensor = await _context.Sensores.FindAsync(id);

            if (sensor == null)
            {
                return NotFound("El sensor no existe.");
            }

            var tieneLecturas = await _context.Lecturas
                .AnyAsync(l => l.IdSensor == id);

            var tieneAlertas = await _context.Alertas
                .AnyAsync(a => a.IdSensor == id);

            if (tieneLecturas || tieneAlertas)
            {
                return BadRequest(
                    "No se puede eliminar el sensor porque tiene lecturas o alertas relacionadas. Puede desactivarlo."
                );
            }

            _context.Sensores.Remove(sensor);

            _bitacoraService.Registrar(
                "ELIMINAR",
                "SENSOR",
                sensor.IdSensor.ToString(),
                $"Se elimino el sensor {sensor.Nombre} ({sensor.Codigo})"
            );

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = "Sensor eliminado correctamente."
            });
        }
    }
}
