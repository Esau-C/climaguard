using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClimaGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class Fase2_ComunidadesYSensores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Ubicacion",
                table: "Sensores",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "Sensores",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Sensores",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Codigo",
                table: "Sensores",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Sensores",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaInstalacion",
                table: "Sensores",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdComunidad",
                table: "Sensores",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UnidadMedida",
                table: "Sensores",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Comunidades",
                columns: table => new
                {
                    IdComunidad = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Departamento = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Pais = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Latitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Longitud = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Activa = table.Column<bool>(type: "bit", nullable: false),
                    FechaRegistro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comunidades", x => x.IdComunidad);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sensores_Codigo",
                table: "Sensores",
                column: "Codigo",
                unique: true,
                filter: "[Codigo] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Sensores_IdComunidad",
                table: "Sensores",
                column: "IdComunidad");

            migrationBuilder.AddForeignKey(
                name: "FK_Sensores_Comunidades_IdComunidad",
                table: "Sensores",
                column: "IdComunidad",
                principalTable: "Comunidades",
                principalColumn: "IdComunidad",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sensores_Comunidades_IdComunidad",
                table: "Sensores");

            migrationBuilder.DropTable(
                name: "Comunidades");

            migrationBuilder.DropIndex(
                name: "IX_Sensores_Codigo",
                table: "Sensores");

            migrationBuilder.DropIndex(
                name: "IX_Sensores_IdComunidad",
                table: "Sensores");

            migrationBuilder.DropColumn(
                name: "Codigo",
                table: "Sensores");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Sensores");

            migrationBuilder.DropColumn(
                name: "FechaInstalacion",
                table: "Sensores");

            migrationBuilder.DropColumn(
                name: "IdComunidad",
                table: "Sensores");

            migrationBuilder.DropColumn(
                name: "UnidadMedida",
                table: "Sensores");

            migrationBuilder.AlterColumn<string>(
                name: "Ubicacion",
                table: "Sensores",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                table: "Sensores",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Sensores",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);
        }
    }
}
