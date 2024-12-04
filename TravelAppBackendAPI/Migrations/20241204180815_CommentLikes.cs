using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class CommentLikes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Likes_UserID",
                table: "Likes");

            migrationBuilder.DropForeignKey(
                name: "FK_Saves_UserID",
                table: "Saves");

            migrationBuilder.CreateTable(
                name: "CommentLikes",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CommentId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommentLikes", x => new { x.UserId, x.CommentId });
                    table.ForeignKey(
                        name: "FK_CommentLikes_CommentID",
                        column: x => x.CommentId,
                        principalTable: "Comments",
                        principalColumn: "CommentId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CommentLikes_UserID",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommentLikes_CommentId",
                table: "CommentLikes",
                column: "CommentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_UserID",
                table: "Likes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Saves_UserID",
                table: "Saves",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Likes_UserID",
                table: "Likes");

            migrationBuilder.DropForeignKey(
                name: "FK_Saves_UserID",
                table: "Saves");

            migrationBuilder.DropTable(
                name: "CommentLikes");

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_UserID",
                table: "Likes",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Saves_UserID",
                table: "Saves",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
