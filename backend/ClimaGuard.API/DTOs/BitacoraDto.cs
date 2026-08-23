namespace ClimaGuard.API.DTOs
{
    public class BitacoraDto
    {
        public long IdBitacora { get; set; }

        public int IdUsuario { get; set; }

        public string Accion { get; set; } = string.Empty;

        public string Entidad { get; set; } = string.Empty;

        public string? IdEntidad { get; set; }

        public string Descripcion { get; set; } = string.Empty;

        public DateTime Fecha { get; set; }

        public string? Ip { get; set; }

        public UsuarioDto? Usuario { get; set; }
    }
}