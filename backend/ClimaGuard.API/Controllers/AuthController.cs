using ClimaGuard.API.Data;
using ClimaGuard.API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ClimaGuard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            ClimaGuardDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            if (string.IsNullOrWhiteSpace(loginDto.Username) ||
                string.IsNullOrWhiteSpace(loginDto.Password))
            {
                return BadRequest("Debe ingresar usuario y contraseña.");
            }

            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(
                    u => u.Username == loginDto.Username
                );

            if (usuario == null)
            {
                return Unauthorized(
                    "Usuario o contraseña incorrectos."
                );
            }

            if (!usuario.Activo)
            {
                return Unauthorized(
                    "El usuario se encuentra inactivo."
                );
            }

            bool passwordValido;

            try
            {
                passwordValido = BCrypt.Net.BCrypt.Verify(
                    loginDto.Password,
                    usuario.PasswordHash
                );
            }
            catch
            {
                return Unauthorized(
                    "La contraseña almacenada no es válida."
                );
            }

            if (!passwordValido)
            {
                return Unauthorized(
                    "Usuario o contraseña incorrectos."
                );
            }

            var token = GenerarToken(
                usuario.IdUsuario,
                usuario.Username,
                usuario.Rol
            );

            return Ok(new
            {
                token,
                usuario = new
                {
                    usuario.IdUsuario,
                    usuario.Nombre,
                    usuario.Apellido,
                    usuario.Username,
                    usuario.Rol
                }
            });
        }

        private string GenerarToken(
            int idUsuario,
            string username,
            string rol)
        {
            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "No se encontró la configuración Jwt:Key."
                );
            }

            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    idUsuario.ToString()
                ),

                new Claim(
                    ClaimTypes.Name,
                    username
                ),

                new Claim(
                    ClaimTypes.Role,
                    rol
                )
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}