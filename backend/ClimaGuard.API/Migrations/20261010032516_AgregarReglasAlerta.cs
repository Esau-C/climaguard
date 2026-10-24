using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClimaGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class AgregarReglasAlerta : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReglasAlerta",
                columns: table => new
                {
                    IdReglaAlerta = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    TipoFenomeno = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Variable = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Operador = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Umbral = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    VariableSecundaria = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    OperadorSecundario = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    UmbralSecundario = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Nivel = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Titulo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Mensaje = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Activa = table.Column<bool>(type: "bit", nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FechaModificacion = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReglasAlerta", x => x.IdReglaAlerta);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReglasAlerta_TipoFenomeno_Nivel_Activa",
                table: "ReglasAlerta",
                columns: new[] { "TipoFenomeno", "Nivel", "Activa" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReglasAlerta");
        }
    }
}
