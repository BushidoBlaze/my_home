using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceProviderContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProviderName",
                table: "Services",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProviderPhone",
                table: "Services",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProviderName",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "ProviderPhone",
                table: "Services");
        }
    }
}
