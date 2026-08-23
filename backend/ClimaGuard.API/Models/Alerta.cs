using System.ComponentModel.DataAnnotations;

namespace ClimaGuard.API.Models
{
    public class Alerta
    {
        [Key]
        public int IdAlerta { get; set; }

        public int IdSensor { get; set; }

        public long IdLectura { get; set; }

        public string TipoFenomeno { get; set; } = string.Empty;

        public string Nivel { get; set; } = string.Empty;

        public string Titulo { get; set; } = string.Empty;

        public string Mensaje { get; set; } = string.Empty;

        public DateTime FechaGeneracion { get; set; } = DateTime.UtcNow;

        public string Estado { get; set; } = "ACTIVA";

        public Sensor? Sensor { get; set; }

        public Lectura? Lectura { get; set; }
    }
}