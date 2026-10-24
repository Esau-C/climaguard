
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ClimaGuard.API.Services
{
    public class BitacoraService
    {
        private readonly ClimaGuardDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BitacoraService(
            ClimaGuardDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public void Registrar(
            string accion,
            string entidad,
            string? idEntidad,
            string descripcion)
        {
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
                throw new UnauthorizedAccessException(
                    "No hay un usuario autenticado para registrar la auditoria."
                );
            }

            var idUsuarioTexto = httpContext.User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (!int.TryParse(idUsuarioTexto, out int idUsuario))
            {
                throw new UnauthorizedAccessException(
                    "No se pudo identificar al usuario autenticado."
                );
            }

            var ip = httpContext.Connection.RemoteIpAddress?.ToString();

            var bitacora = new Bitacora
            {
                IdUsuario = idUsuario,
                Accion = accion.Trim().ToUpperInvariant(),
                Entidad = entidad.Trim().ToUpperInvariant(),
                IdEntidad = idEntidad,
                Descripcion = descripcion.Trim(),
                Fecha = DateTime.UtcNow,
                Ip = ip
            };

            // agregar al contexto sin guardar todavia
            _context.Bitacoras.Add(bitacora);
        }
    }
}
