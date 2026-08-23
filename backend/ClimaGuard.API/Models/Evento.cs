using System.ComponentModel.DataAnnotations;
namespace ClimaGuard.API.Models
{
    public class Evento
    {
        [Key]
        public int IdEvento { get; set; }

        public int IdAlerta { get; set; }

        public int IdSensor { get; set; }

        public string TipoFenomeno { get; set; } = string.Empty;

        public string Nivel { get; set; } = string.Empty;

        public DateTime FechaInicio { get; set; } = DateTime.UtcNow;

        public DateTime? FechaFin { get; set; }

        public string Estado { get; set; } = "ACTIVO";

        public Alerta? Alerta { get; set; }

        public Sensor? Sensor { get; set; }
    }
}