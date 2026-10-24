using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClimaGuard.API.Models
{
    public class Comunidad
    {
        [Key]
        public int IdComunidad { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Municipio { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Departamento { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Pais { get; set; } = "Guatemala";

        public decimal? Latitud { get; set; }

        public decimal? Longitud { get; set; }

        [MaxLength(500)]
        public string? Descripcion { get; set; }

        public bool Activa { get; set; } = true;

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Sensor> Sensores { get; set; }
            = new List<Sensor>();
    }
}