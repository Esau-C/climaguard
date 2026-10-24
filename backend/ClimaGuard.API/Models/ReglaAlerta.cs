
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClimaGuard.API.Models
{
    public class ReglaAlerta
    {
        [Key]
        public int IdReglaAlerta { get; set; }

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string TipoFenomeno { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Variable { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Operador { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Umbral { get; set; }

        // condicion secundaria opcional
        [MaxLength(50)]
        public string? VariableSecundaria { get; set; }

        [MaxLength(10)]
        public string? OperadorSecundario { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? UmbralSecundario { get; set; }

        [Required]
        [MaxLength(20)]
        public string Nivel { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Mensaje { get; set; } = string.Empty;

        public bool Activa { get; set; } = true;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        public DateTime? FechaModificacion { get; set; }
    }
}
