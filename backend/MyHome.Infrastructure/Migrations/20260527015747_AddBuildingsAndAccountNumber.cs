using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBuildingsAndAccountNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountNumber",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Buildings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    City = table.Column<string>(type: "text", nullable: false),
                    Street = table.Column<string>(type: "text", nullable: false),
                    House = table.Column<string>(type: "text", nullable: false),
                    Block = table.Column<string>(type: "text", nullable: true),
                    Year = table.Column<int>(type: "integer", nullable: false),
                    Series = table.Column<string>(type: "text", nullable: true),
                    Cadastre = table.Column<string>(type: "text", nullable: true),
                    Floors = table.Column<int>(type: "integer", nullable: false),
                    Entrances = table.Column<int>(type: "integer", nullable: false),
                    Lifts = table.Column<int>(type: "integer", nullable: false),
                    ApartmentsTotal = table.Column<int>(type: "integer", nullable: false),
                    AreaTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ChairmanName = table.Column<string>(type: "text", nullable: true),
                    ChairmanApartment = table.Column<string>(type: "text", nullable: true),
                    Note = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Buildings", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_AccountNumber",
                table: "Users",
                column: "AccountNumber",
                unique: true,
                filter: "\"AccountNumber\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Buildings_City_Street_House_Block",
                table: "Buildings",
                columns: new[] { "City", "Street", "House", "Block" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Buildings");

            migrationBuilder.DropIndex(
                name: "IX_Users_AccountNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AccountNumber",
                table: "Users");
        }
    }
}
