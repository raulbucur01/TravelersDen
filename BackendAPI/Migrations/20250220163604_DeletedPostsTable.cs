using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class DeletedPostsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostChanges_Posts_PostId",
                table: "PostChanges");

            migrationBuilder.CreateTable(
                name: "DeletedPosts",
                columns: table => new
                {
                    DeletionId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PostId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeleteTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Processed = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeletedPosts", x => x.DeletionId);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_PostChanges_Posts_PostId",
                table: "PostChanges",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "PostId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PostChanges_Posts_PostId",
                table: "PostChanges");

            migrationBuilder.DropTable(
                name: "DeletedPosts");

            migrationBuilder.AddForeignKey(
                name: "FK_PostChanges_Posts_PostId",
                table: "PostChanges",
                column: "PostId",
                principalTable: "Posts",
                principalColumn: "PostId");
        }
    }
}
