using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddedMentionedUserInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MentionedUserId",
                table: "Comments",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Comments_MentionedUserId",
                table: "Comments",
                column: "MentionedUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_Users_MentionedUserId",
                table: "Comments",
                column: "MentionedUserId",
                principalTable: "Users",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_Users_MentionedUserId",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_Comments_MentionedUserId",
                table: "Comments");

            migrationBuilder.DropColumn(
                name: "MentionedUserId",
                table: "Comments");
        }
    }
}
