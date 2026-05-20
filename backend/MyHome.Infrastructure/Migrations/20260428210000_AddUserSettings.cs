using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    [DbContext(typeof(Persistence.AppDbContext))]
    [Migration("20260428210000_AddUserSettings")]
    public partial class AddUserSettings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    PushEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    PushNewRequest = table.Column<bool>(type: "boolean", nullable: false),
                    PushStatusChange = table.Column<bool>(type: "boolean", nullable: false),
                    EmailEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    EmailDigest = table.Column<string>(type: "text", nullable: false),
                    ChatEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    ChatSounds = table.Column<bool>(type: "boolean", nullable: false),
                    AutoSave = table.Column<bool>(type: "boolean", nullable: false),
                    NightMode = table.Column<bool>(type: "boolean", nullable: false),
                    NightModeStart = table.Column<string>(type: "text", nullable: false),
                    NightModeEnd = table.Column<string>(type: "text", nullable: false),
                    PhoneVisibility = table.Column<string>(type: "text", nullable: false),
                    WhoCanWrite = table.Column<string>(type: "text", nullable: false),
                    HideApartment = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorSecret = table.Column<string>(type: "text", nullable: true),
                    Theme = table.Column<string>(type: "text", nullable: false),
                    FontSize = table.Column<string>(type: "text", nullable: false),
                    Language = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserSettings_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserSettings_UserId",
                table: "UserSettings",
                column: "UserId",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserSettings");
        }
    }
}
