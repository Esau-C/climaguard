using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClimaGuard.API.Models
{
    public class Sensor
    {
        [Key]
        public int IdSensor { get; set; }

        public string Nombre { get; set; } = string.Empty;

        public string Tipo { get; set; } = string.Empty;

        public string Ubicacion { get; set; } = string.Empty;

        public decimal? Latitud { get; set; }

        public decimal? Longitud { get; set; }

        public bool Activo { get; set; } = true;

        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Lectura> Lecturas { get; set; } = new List<Lectura>();
    }
}