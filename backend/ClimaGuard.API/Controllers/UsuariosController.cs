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
    public class UsuariosController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public UsuariosController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        // obtener todos los usuarios
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetUsuarios()
        {
            var usuarios = await _context.Usuarios
                .OrderByDescending(u => u.FechaCreacion)
                .Select(u => new UsuarioDto
                {
                    IdUsuario = u.IdUsuario,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido,
                    Username = u.Username,
                    Rol = u.Rol,
                    Activo = u.Activo,
                    FechaCreacion = u.FechaCreacion
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // obtener usuario por id
        [HttpGet("{id}")]
        public async Task<ActionResult<UsuarioDto>> GetUsuario(int id)
        {
            var usuario = await _context.Usuarios
                .Where(u => u.IdUsuario == id)
                .Select(u => new UsuarioDto
                {
                    IdUsuario = u.IdUsuario,
                    Nombre = u.Nombre,
                    Apellido = u.Apellido,
                    Username = u.Username,
                    Rol = u.Rol,
                    Activo = u.Activo,
                    FechaCreacion = u.FechaCreacion
                })
                .FirstOrDefaultAsync();

            if (usuario == null)
            {
                return NotFound(
                    "El usuario no existe."
                );
            }

            return Ok(usuario);
        }

        // crear usuario
        [HttpPost]
        public async Task<IActionResult> CrearUsuario(
            Usuario usuario)
        {
            if (string.IsNullOrWhiteSpace(usuario.Nombre))
            {
                return BadRequest(
                    "El nombre es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Apellido))
            {
                return BadRequest(
                    "El apellido es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Username))
            {
                return BadRequest(
                    "El nombre de usuario es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.PasswordHash))
            {
                return BadRequest(
                    "La contraseña es obligatoria."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Rol))
            {
                return BadRequest(
                    "El rol es obligatorio."
                );
            }

            usuario.Nombre =
                usuario.Nombre.Trim();

            usuario.Apellido =
                usuario.Apellido.Trim();

            usuario.Username =
                usuario.Username.Trim();

            usuario.Rol =
                usuario.Rol.Trim().ToUpper();

            if (
                usuario.Rol != "ADMIN" &&
                usuario.Rol != "OPERADOR"
            )
            {
                return BadRequest(
                    "El rol debe ser ADMIN u OPERADOR."
                );
            }

            var usernameExiste =
                await _context.Usuarios
                    .AnyAsync(
                        u => u.Username == usuario.Username
                    );

            if (usernameExiste)
            {
                return BadRequest(
                    "El nombre de usuario ya existe."
                );
            }

            usuario.IdUsuario = 0;

            usuario.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    usuario.PasswordHash
                );

            usuario.Activo = true;
            usuario.FechaCreacion = DateTime.UtcNow;

            _context.Usuarios.Add(usuario);

            await _context.SaveChangesAsync();

            var usuarioRespuesta =
                new UsuarioDto
                {
                    IdUsuario =
                        usuario.IdUsuario,

                    Nombre =
                        usuario.Nombre,

                    Apellido =
                        usuario.Apellido,

                    Username =
                        usuario.Username,

                    Rol =
                        usuario.Rol,

                    Activo =
                        usuario.Activo,

                    FechaCreacion =
                        usuario.FechaCreacion
                };

            return CreatedAtAction(
                nameof(GetUsuario),
                new
                {
                    id = usuario.IdUsuario
                },
                usuarioRespuesta
            );
        }

        // actualizar usuario
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarUsuario(
            int id,
            Usuario usuario)
        {
            var usuarioExistente =
                await _context.Usuarios
                    .FindAsync(id);

            if (usuarioExistente == null)
            {
                return NotFound(
                    "El usuario no existe."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Nombre))
            {
                return BadRequest(
                    "El nombre es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Apellido))
            {
                return BadRequest(
                    "El apellido es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Username))
            {
                return BadRequest(
                    "El nombre de usuario es obligatorio."
                );
            }

            if (string.IsNullOrWhiteSpace(usuario.Rol))
            {
                return BadRequest(
                    "El rol es obligatorio."
                );
            }

            var rol =
                usuario.Rol
                    .Trim()
                    .ToUpper();

            if (
                rol != "ADMIN" &&
                rol != "OPERADOR"
            )
            {
                return BadRequest(
                    "El rol debe ser ADMIN u OPERADOR."
                );
            }

            var username =
                usuario.Username.Trim();

            var usernameOcupado =
                await _context.Usuarios
                    .AnyAsync(u =>
                        u.Username == username &&
                        u.IdUsuario != id
                    );

            if (usernameOcupado)
            {
                return BadRequest(
                    "El nombre de usuario ya existe."
                );
            }

            usuarioExistente.Nombre =
                usuario.Nombre.Trim();

            usuarioExistente.Apellido =
                usuario.Apellido.Trim();

            usuarioExistente.Username =
                username;

            usuarioExistente.Rol =
                rol;

            // solo cambia contraseña si se envia una nueva
            if (
                !string.IsNullOrWhiteSpace(
                    usuario.PasswordHash
                )
            )
            {
                usuarioExistente.PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        usuario.PasswordHash
                    );
            }

            await _context.SaveChangesAsync();

            var respuesta =
                new UsuarioDto
                {
                    IdUsuario =
                        usuarioExistente.IdUsuario,

                    Nombre =
                        usuarioExistente.Nombre,

                    Apellido =
                        usuarioExistente.Apellido,

                    Username =
                        usuarioExistente.Username,

                    Rol =
                        usuarioExistente.Rol,

                    Activo =
                        usuarioExistente.Activo,

                    FechaCreacion =
                        usuarioExistente.FechaCreacion
                };

            return Ok(new
            {
                mensaje =
                    "Usuario actualizado correctamente.",

                usuario =
                    respuesta
            });
        }

        // activar o desactivar usuario
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(
            int id,
            [FromQuery] bool activo)
        {
            var usuario =
                await _context.Usuarios
                    .FindAsync(id);

            if (usuario == null)
            {
                return NotFound(
                    "El usuario no existe."
                );
            }

            usuario.Activo = activo;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = activo
                    ? "Usuario activado correctamente."
                    : "Usuario desactivado correctamente.",

                idUsuario =
                    usuario.IdUsuario,

                activo =
                    usuario.Activo
            });
        }

        // eliminar usuario
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(
            int id)
        {
            var usuario =
                await _context.Usuarios
                    .FindAsync(id);

            if (usuario == null)
            {
                return NotFound(
                    "El usuario no existe."
                );
            }

            _context.Usuarios.Remove(usuario);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje =
                    "Usuario eliminado correctamente."
            });
        }
    }
}