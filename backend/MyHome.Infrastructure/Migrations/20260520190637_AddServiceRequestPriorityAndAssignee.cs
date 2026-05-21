using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceRequestPriorityAndAssignee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AssigneeId",
                table: "ServiceRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "ServiceRequests",
                type: "text",
                nullable: false,
                defaultValue: "Med");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_AssigneeId",
                table: "ServiceRequests",
                column: "AssigneeId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Users_AssigneeId",
                table: "ServiceRequests",
                column: "AssigneeId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Users_AssigneeId",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_AssigneeId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "AssigneeId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "ServiceRequests");
        }
    }
}
