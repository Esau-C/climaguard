
using ClimaGuard.API.Data;
using ClimaGuard.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ClimaGuard.API.Controllers
{
    [ApiController]
    [Route("api/reglas-alerta")]
    [Authorize(Roles = "ADMIN,OPERADOR")]
    public class ReglasAlertaController : ControllerBase
    {
        private readonly ClimaGuardDbContext _context;

        public ReglasAlertaController(ClimaGuardDbContext context)
        {
            _context = context;
        }

        // obtener todas las reglas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReglaAlerta>>> ObtenerReglas()
        {
            var reglas = await _context.ReglasAlerta
                .AsNoTracking()
                .OrderBy(r => r.TipoFenomeno)
                .ThenBy(r => r.Nivel)
                .ThenBy(r => r.IdReglaAlerta)
                .ToListAsync();

            return Ok(reglas);
        }

        // obtener una regla por id
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ReglaAlerta>> ObtenerRegla(int id)
        {
            var regla = await _context.ReglasAlerta
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.IdReglaAlerta == id);

            if (regla == null)
            {
                return NotFound(new
                {
                    mensaje = "La regla de alerta no existe."
                });
            }

            return Ok(regla);
        }

        // crear una nueva regla
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<ReglaAlerta>> CrearRegla(
            [FromBody] ReglaAlerta regla)
        {
            var error = ValidarRegla(regla);

            if (error != null)
            {
                return BadRequest(new { mensaje = error });
            }

            regla.IdReglaAlerta = 0;
            regla.FechaCreacion = DateTime.UtcNow;
            regla.FechaModificacion = null;

            _context.ReglasAlerta.Add(regla);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(ObtenerRegla),
                new { id = regla.IdReglaAlerta },
                regla
            );
        }

        // actualizar una regla existente
        [HttpPut("{id:int}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> ActualizarRegla(
            int id,
            [FromBody] ReglaAlerta datos)
        {
            var regla = await _context.ReglasAlerta
                .FirstOrDefaultAsync(r => r.IdReglaAlerta == id);

            if (regla == null)
            {
                return NotFound(new
                {
                    mensaje = "La regla de alerta no existe."
                });
            }

            var error = ValidarRegla(datos);

            if (error != null)
            {
                return BadRequest(new { mensaje = error });
            }

            regla.Nombre = datos.Nombre.Trim();
            regla.TipoFenomeno = datos.TipoFenomeno.Trim();
            regla.Variable = datos.Variable.Trim();
            regla.Operador = datos.Operador.Trim();
            regla.Umbral = datos.Umbral;
            regla.VariableSecundaria = datos.VariableSecundaria;
            regla.OperadorSecundario = datos.OperadorSecundario;
            regla.UmbralSecundario = datos.UmbralSecundario;
            regla.Nivel = datos.Nivel.Trim();
            regla.Titulo = datos.Titulo.Trim();
            regla.Mensaje = datos.Mensaje.Trim();
            regla.FechaModificacion = DateTime.UtcNow;

            // el estado activo se administra por su endpoint
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // activar o desactivar una regla
        [HttpPut("{id:int}/estado")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CambiarEstado(
            int id,
            [FromQuery] bool activa)
        {
            var regla = await _context.ReglasAlerta
                .FirstOrDefaultAsync(r => r.IdReglaAlerta == id);

            if (regla == null)
            {
                return NotFound(new
                {
                    mensaje = "La regla de alerta no existe."
                });
            }

            regla.Activa = activa;
            regla.FechaModificacion = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                mensaje = activa
                    ? "Regla activada correctamente."
                    : "Regla desactivada correctamente.",
                regla.IdReglaAlerta,
                regla.Activa
            });
        }

        // validar los datos de una regla
        private static string? ValidarRegla(ReglaAlerta regla)
        {
            if (string.IsNullOrWhiteSpace(regla.Nombre))
                return "El nombre es obligatorio.";

            if (string.IsNullOrWhiteSpace(regla.TipoFenomeno))
                return "El tipo de fenomeno es obligatorio.";

            if (string.IsNullOrWhiteSpace(regla.Variable))
                return "La variable es obligatoria.";

            if (string.IsNullOrWhiteSpace(regla.Operador))
                return "El operador es obligatorio.";

            if (string.IsNullOrWhiteSpace(regla.Nivel))
                return "El nivel es obligatorio.";

            if (string.IsNullOrWhiteSpace(regla.Titulo))
                return "El titulo es obligatorio.";

            if (string.IsNullOrWhiteSpace(regla.Mensaje))
                return "El mensaje es obligatorio.";

            var operadoresValidos = new[]
            {
                ">", ">=", "<", "<=", "==", "!="
            };

            if (!operadoresValidos.Contains(regla.Operador))
                return "El operador principal no es valido.";

            bool tieneVariableSecundaria =
                !string.IsNullOrWhiteSpace(regla.VariableSecundaria);

            bool tieneOperadorSecundario =
                !string.IsNullOrWhiteSpace(regla.OperadorSecundario);

            bool tieneUmbralSecundario =
                regla.UmbralSecundario.HasValue;

            if (tieneVariableSecundaria ||
                tieneOperadorSecundario ||
                tieneUmbralSecundario)
            {
                if (!tieneVariableSecundaria ||
                    !tieneOperadorSecundario ||
                    !tieneUmbralSecundario)
                {
                    return "La condicion secundaria debe estar completa.";
                }

                if (!operadoresValidos.Contains(regla.OperadorSecundario!))
                    return "El operador secundario no es valido.";
            }

            var nivelesValidos = new[]
            {
                "AMARILLO", "NARANJA", "ROJO"
            };

            if (!nivelesValidos.Contains(regla.Nivel.Trim().ToUpperInvariant()))
                return "El nivel debe ser AMARILLO, NARANJA o ROJO.";

            return null;
        }
    }
}
