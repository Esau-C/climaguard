using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ClimaGuard.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEventoRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Eventos_Alertas_AlertaIdAlerta",
                table: "Eventos");

            migrationBuilder.DropForeignKey(
                name: "FK_Eventos_Sensores_SensorIdSensor",
                table: "Eventos");

            migrationBuilder.DropIndex(
                name: "IX_Eventos_AlertaIdAlerta",
                table: "Eventos");

            migrationBuilder.DropIndex(
                name: "IX_Eventos_SensorIdSensor",
                table: "Eventos");

            migrationBuilder.DropColumn(
                name: "AlertaIdAlerta",
                table: "Eventos");

            migrationBuilder.DropColumn(
                name: "SensorIdSensor",
                table: "Eventos");

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_IdAlerta",
                table: "Eventos",
                column: "IdAlerta");

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_IdSensor",
                table: "Eventos",
                column: "IdSensor");

            migrationBuilder.AddForeignKey(
                name: "FK_Eventos_Alertas_IdAlerta",
                table: "Eventos",
                column: "IdAlerta",
                principalTable: "Alertas",
                principalColumn: "IdAlerta",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Eventos_Sensores_IdSensor",
                table: "Eventos",
                column: "IdSensor",
                principalTable: "Sensores",
                principalColumn: "IdSensor",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Eventos_Alertas_IdAlerta",
                table: "Eventos");

            migrationBuilder.DropForeignKey(
                name: "FK_Eventos_Sensores_IdSensor",
                table: "Eventos");

            migrationBuilder.DropIndex(
                name: "IX_Eventos_IdAlerta",
                table: "Eventos");

            migrationBuilder.DropIndex(
                name: "IX_Eventos_IdSensor",
                table: "Eventos");

            migrationBuilder.AddColumn<int>(
                name: "AlertaIdAlerta",
                table: "Eventos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SensorIdSensor",
                table: "Eventos",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_AlertaIdAlerta",
                table: "Eventos",
                column: "AlertaIdAlerta");

            migrationBuilder.CreateIndex(
                name: "IX_Eventos_SensorIdSensor",
                table: "Eventos",
                column: "SensorIdSensor");

            migrationBuilder.AddForeignKey(
                name: "FK_Eventos_Alertas_AlertaIdAlerta",
                table: "Eventos",
                column: "AlertaIdAlerta",
                principalTable: "Alertas",
                principalColumn: "IdAlerta");

            migrationBuilder.AddForeignKey(
                name: "FK_Eventos_Sensores_SensorIdSensor",
                table: "Eventos",
                column: "SensorIdSensor",
                principalTable: "Sensores",
                principalColumn: "IdSensor");
        }
    }
}
