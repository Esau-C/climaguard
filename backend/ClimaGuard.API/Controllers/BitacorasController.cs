using Microsoft.AspNetCore.Authorization;
using ClimaGuard.API.Data;
using ClimaGuard.API.DTOs;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Controllers
{
    [Authorize(Roles = "ADMIN")]
    [ApiController]
    [Route("api/[controller]")]
    public class BitacorasController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public BitacorasController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BitacoraDto>>> GetBitacoras()
        {
            var bitacoras = await _context.Bitacoras
                .OrderByDescending(b => b.Fecha)
                .Select(b => new BitacoraDto
                {
                    IdBitacora = b.IdBitacora,
                    IdUsuario = b.IdUsuario,
                    Accion = b.Accion,
                    Entidad = b.Entidad,
                    IdEntidad = b.IdEntidad,
                    Descripcion = b.Descripcion,
                    Fecha = b.Fecha,
                    Ip = b.Ip,

                    Usuario = b.Usuario == null
                        ? null
                        : new UsuarioDto
                        {
                            IdUsuario = b.Usuario.IdUsuario,
                            Nombre = b.Usuario.Nombre,
                            Apellido = b.Usuario.Apellido,
                            Username = b.Usuario.Username,
                            Rol = b.Usuario.Rol,
                            Activo = b.Usuario.Activo,
                            FechaCreacion = b.Usuario.FechaCreacion
                        }
                })
                .ToListAsync();

            return Ok(bitacoras);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BitacoraDto>> GetBitacora(long id)
        {
            var bitacora = await _context.Bitacoras
                .Where(b => b.IdBitacora == id)
                .Select(b => new BitacoraDto
                {
                    IdBitacora = b.IdBitacora,
                    IdUsuario = b.IdUsuario,
                    Accion = b.Accion,
                    Entidad = b.Entidad,
                    IdEntidad = b.IdEntidad,
                    Descripcion = b.Descripcion,
                    Fecha = b.Fecha,
                    Ip = b.Ip,

                    Usuario = b.Usuario == null
                        ? null
                        : new UsuarioDto
                        {
                            IdUsuario = b.Usuario.IdUsuario,
                            Nombre = b.Usuario.Nombre,
                            Apellido = b.Usuario.Apellido,
                            Username = b.Usuario.Username,
                            Rol = b.Usuario.Rol,
                            Activo = b.Usuario.Activo,
                            FechaCreacion = b.Usuario.FechaCreacion
                        }
                })
                .FirstOrDefaultAsync();

            if (bitacora == null)
            {
                return NotFound();
            }

            return Ok(bitacora);
        }

        [HttpPost]
        public async Task<ActionResult<Bitacora>> CrearBitacora(Bitacora bitacora)
        {
            var usuarioExiste = await _context.Usuarios
                .AnyAsync(u => u.IdUsuario == bitacora.IdUsuario);

            if (!usuarioExiste)
            {
                return BadRequest("El usuario especificado no existe.");
            }

            bitacora.Fecha = DateTime.UtcNow;

            _context.Bitacoras.Add(bitacora);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetBitacora),
                new { id = bitacora.IdBitacora },
                bitacora
            );
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarBitacora(long id)
        {
            var bitacora = await _context.Bitacoras.FindAsync(id);

            if (bitacora == null)
            {
                return NotFound();
            }

            _context.Bitacoras.Remove(bitacora);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}