
using Microsoft.AspNetCore.Authorization;
using ClimaGuard.API.Data;
using ClimaGuard.API.DTOs;
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

        // consultar todas las bitacoras
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BitacoraDto>>> GetBitacoras()
        {
            var bitacoras = await _context.Bitacoras
                .AsNoTracking()
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

        // consultar una bitacora por id
        [HttpGet("{id}")]
        public async Task<ActionResult<BitacoraDto>> GetBitacora(long id)
        {
            var bitacora = await _context.Bitacoras
                .AsNoTracking()
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
                return NotFound("El registro de bitacora no existe.");
            }

            return Ok(bitacora);
        }
    }
}
