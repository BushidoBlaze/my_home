using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixOrphansAndShadowFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceRequests_Users_UserId",
                table: "ServiceRequests");

            migrationBuilder.DropIndex(
                name: "IX_ServiceRequests_UserId",
                table: "ServiceRequests");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "ServiceRequests");

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Expenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "ComplianceDeadlines",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_OrganizationId",
                table: "Expenses",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ComplianceDeadlines_OrganizationId",
                table: "ComplianceDeadlines",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Chats_ServiceRequestId",
                table: "Chats",
                column: "ServiceRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_Chats_ServiceRequests_ServiceRequestId",
                table: "Chats",
                column: "ServiceRequestId",
                principalTable: "ServiceRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ComplianceDeadlines_Organizations_OrganizationId",
                table: "ComplianceDeadlines",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_Organizations_OrganizationId",
                table: "Expenses",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Chats_ServiceRequests_ServiceRequestId",
                table: "Chats");

            migrationBuilder.DropForeignKey(
                name: "FK_ComplianceDeadlines_Organizations_OrganizationId",
                table: "ComplianceDeadlines");

            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_Organizations_OrganizationId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_OrganizationId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_ComplianceDeadlines_OrganizationId",
                table: "ComplianceDeadlines");

            migrationBuilder.DropIndex(
                name: "IX_Chats_ServiceRequestId",
                table: "Chats");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "ComplianceDeadlines");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "ServiceRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequests_UserId",
                table: "ServiceRequests",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceRequests_Users_UserId",
                table: "ServiceRequests",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
