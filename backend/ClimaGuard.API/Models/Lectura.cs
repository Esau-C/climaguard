using System.ComponentModel.DataAnnotations;
namespace ClimaGuard.API.Models
{
    public class Lectura
    {
        [Key]
        public long IdLectura { get; set; }

        public int IdSensor { get; set; }

        public decimal? Temperatura { get; set; }

        public decimal? Humedad { get; set; }

        public decimal? VelocidadViento { get; set; }

        public decimal? NivelLluvia { get; set; }

        public decimal? NivelAgua { get; set; }

        public DateTime FechaLectura { get; set; } = DateTime.UtcNow;

        public Sensor? Sensor { get; set; }
    }
}