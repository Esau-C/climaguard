using System.ComponentModel.DataAnnotations;
namespace ClimaGuard.API.Models
{
    public class Bitacora
    {
        [Key]
        public long IdBitacora { get; set; }

        public int IdUsuario { get; set; }

        public string Accion { get; set; } = string.Empty;

        public string Entidad { get; set; } = string.Empty;

        public string? IdEntidad { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        public string? Ip { get; set; }

        public Usuario? Usuario { get; set; }
    }
}