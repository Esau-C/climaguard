using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClimaGuard.API.Models
{
    public class Sensor
    {
        [Key]
        public int IdSensor { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        // temporalmente nullable para migrar sensores de fase 1
        [MaxLength(50)]
        public string? Codigo { get; set; }

        [Required]
        [MaxLength(100)]
        public string Tipo { get; set; } = string.Empty;

        // temporalmente nullable para migrar sensores de fase 1
        public int? IdComunidad { get; set; }

        [Required]
        [MaxLength(200)]
        public string Ubicacion { get; set; } = string.Empty;

        [MaxLength(50)]
        public string UnidadMedida { get; set; } = string.Empty;

        public decimal? Latitud { get; set; }

        public decimal? Longitud { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime? FechaInstalacion { get; set; }

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // relacion con comunidad
        public Comunidad? Comunidad { get; set; }

        [JsonIgnore]
        public ICollection<Lectura> Lecturas { get; set; }
            = new List<Lectura>();
    }
}