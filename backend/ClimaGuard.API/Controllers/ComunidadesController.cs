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
    public class ComunidadesController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public ComunidadesController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        // obtener todas las comunidades
        [HttpGet]
        [Authorize(Roles = "ADMIN,OPERADOR")]
        public async Task<ActionResult<IEnumerable<Comunidad>>> GetComunidades()
        {
            var comunidades = await _context.Comunidades
                .OrderBy(c => c.Nombre)
                .ToListAsync();

            return Ok(comunidades);
        }

        // obtener comunidad por id
        [HttpGet("{id}")]
        [Authorize(Roles = "ADMIN,OPERADOR")]
        public async Task<ActionResult<Comunidad>> GetComunidad(int id)
        {
            var comunidad = await _context.Comunidades
                .FirstOrDefaultAsync(c => c.IdComunidad == id);

            if (comunidad == null)
            {
                return NotFound(
                    "La comunidad no existe."
                );
            }

            return Ok(comunidad);
        }

        // crear comunidad
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Comunidad>> CrearComunidad(
            Comunidad comunidad)
        {
            if (string.IsNullOrWhiteSpace(comunidad.Nombre))
            {
                return BadRequest(
                    "El nombre de la comunidad es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(comunidad.Municipio))
            {
                return BadRequest(
                    "El municipio es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(comunidad.Departamento))
            {
                return BadRequest(
                    "El departamento es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(comunidad.Pais))
            {
                return BadRequest(
                    "El pais es obligatorio."
                );
            }

            comunidad.IdComunidad = 0;

            comunidad.Nombre =
                comunidad.Nombre.Trim();

            comunidad.Municipio =
                comunidad.Municipio.Trim();

            comunidad.Departamento =
                comunidad.Departamento.Trim();

            comunidad.Pais =
                comunidad.Pais.Trim();

            if (comunidad.Descripcion != null)
            {
                comunidad.Descripcion =
                    comunidad.Descripcion.Trim();
            }

            comunidad.Activa = true;
            comunidad.FechaRegistro = DateTime.UtcNow;

            _context.Comunidades.Add(comunidad);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetComunidad),
                new
                {
                    id = comunidad.IdComunidad
                },
                comunidad
            );
        }

        // actualizar comunidad
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ActualizarComunidad(
            int id,
            Comunidad datos)
        {
            var comunidad = await _context.Comunidades
                .FindAsync(id);

            if (comunidad == null)
            {
                return NotFound(
                    "La comunidad no existe."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Nombre))
            {
                return BadRequest(
                    "El nombre de la comunidad es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Municipio))
            {
                return BadRequest(
                    "El municipio es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Departamento))
            {
                return BadRequest(
                    "El departamento es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(datos.Pais))
            {
                return BadRequest(
                    "El pais es obligatorio."
                );
            }

            comunidad.Nombre =
                datos.Nombre.Trim();

            comunidad.Municipio =
                datos.Municipio.Trim();

            comunidad.Departamento =
                datos.Departamento.Trim();

            comunidad.Pais =
                datos.Pais.Trim();

            comunidad.Latitud =
                datos.Latitud;

            comunidad.Longitud =
                datos.Longitud;

            comunidad.Descripcion =
                datos.Descripcion?.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Comunidad actualizada correctamente.",

                comunidad
            });
        }

        // cambiar estado activo/inactivo
        [HttpPut("{id}/estado")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CambiarEstado(
            int id,
            [FromQuery] bool activa)
        {
            var comunidad = await _context.Comunidades
                .FindAsync(id);

            if (comunidad == null)
            {
                return NotFound(
                    "La comunidad no existe."
                );
            }

            comunidad.Activa = activa;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = activa
                    ? "Comunidad activada correctamente."
                    : "Comunidad desactivada correctamente.",

                idComunidad =
                    comunidad.IdComunidad,

                activa =
                    comunidad.Activa
            });
        }

        // eliminar comunidad
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> EliminarComunidad(int id)
        {
            var comunidad = await _context.Comunidades
                .FindAsync(id);

            if (comunidad == null)
            {
                return NotFound(
                    "La comunidad no existe."
                );
            }

            var tieneSensores = await _context.Sensores
                .AnyAsync(s => s.IdComunidad == id);

            if (tieneSensores)
            {
                return BadRequest(
                    "No se puede eliminar la comunidad porque tiene sensores asociados. Puede desactivarla."
                );
            }

            _context.Comunidades.Remove(comunidad);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Comunidad eliminada correctamente."
            });
        }
    }
}