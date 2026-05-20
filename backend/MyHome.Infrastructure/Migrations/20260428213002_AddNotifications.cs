using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MyHome.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                CREATE TABLE IF NOT EXISTS "Notifications" (
                    "Id" uuid NOT NULL,
                    "UserId" uuid NOT NULL,
                    "Title" text NOT NULL,
                    "Message" text NOT NULL,
                    "Type" text NOT NULL,
                    "IsRead" boolean NOT NULL,
                    "CreatedAt" timestamp with time zone NOT NULL,
                    "ReadAt" timestamp with time zone NULL,
                    "RelatedRequestId" uuid NULL,
                    CONSTRAINT "PK_Notifications" PRIMARY KEY ("Id"),
                    CONSTRAINT "FK_Notifications_ServiceRequests_RelatedRequestId" FOREIGN KEY ("RelatedRequestId") REFERENCES "ServiceRequests" ("Id") ON DELETE SET NULL,
                    CONSTRAINT "FK_Notifications_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
                );
                """);

            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_Notifications_RelatedRequestId"
                ON "Notifications" ("RelatedRequestId");
                """);

            migrationBuilder.Sql("""
                CREATE INDEX IF NOT EXISTS "IX_Notifications_UserId_IsRead_CreatedAt"
                ON "Notifications" ("UserId", "IsRead", "CreatedAt");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""DROP TABLE IF EXISTS "Notifications";""");
        }
    }
}
