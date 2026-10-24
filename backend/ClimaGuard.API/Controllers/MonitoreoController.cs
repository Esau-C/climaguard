
using ClimaGuard.API.Data;
using ClimaGuard.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClimaGuard.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MonitoreoController : ControllerBase
    {
        private readonly SimuladorClimaticoService _simulador;
        private readonly BitacoraService _bitacoraService;
        private readonly ClimaGuardDbContext _context;

        public MonitoreoController(
            SimuladorClimaticoService simulador,
            BitacoraService bitacoraService,
            ClimaGuardDbContext context)
        {
            _simulador = simulador;
            _bitacoraService = bitacoraService;
            _context = context;
        }

        // reiniciar ciclo de monitoreo
        [HttpPost("reiniciar")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ReiniciarMonitoreo()
        {
            var reinicioSolicitado = _simulador.SolicitarReinicio();

            if (!reinicioSolicitado)
            {
                return Conflict(new
                {
                    mensaje = "No se pudo solicitar el reinicio. El simulador puede estar deshabilitado o ya existe una solicitud pendiente."
                });
            }

            _bitacoraService.Registrar(
                "REINICIAR",
                "MONITOREO",
                null,
                "El administrador solicito reiniciar el ciclo de monitoreo climatico."
            );

            await _context.SaveChangesAsync();

            return Accepted(new
            {
                mensaje = "Solicitud de reinicio recibida correctamente. El simulador generara una nueva ronda de lecturas."
            });
        }
    }
}
