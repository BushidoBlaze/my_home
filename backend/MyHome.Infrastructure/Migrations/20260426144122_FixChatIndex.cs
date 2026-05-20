using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixChatIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Chats_InviteCode",
                table: "Chats");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_InviteCode",
                table: "Chats",
                column: "InviteCode",
                unique: true,
                filter: "\"InviteCode\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Chats_InviteCode",
                table: "Chats");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_InviteCode",
                table: "Chats",
                column: "InviteCode",
                unique: true);
        }
    }
}
