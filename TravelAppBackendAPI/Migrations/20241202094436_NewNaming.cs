using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class NewNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Users",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "PostID",
                table: "Saves",
                newName: "PostId");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Saves",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Saves_PostID",
                table: "Saves",
                newName: "IX_Saves_PostId");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Posts",
                newName: "UserId");

            migrationBuilder.RenameColumn(
                name: "PostID",
                table: "Posts",
                newName: "PostId");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_UserID",
                table: "Posts",
                newName: "IX_Posts_UserId");

            migrationBuilder.RenameColumn(
                name: "PostID",
                table: "PostMedia",
                newName: "PostId");

            migrationBuilder.RenameColumn(
                name: "AppwriteFileURL",
                table: "PostMedia",
                newName: "AppwriteFileUrl");

            migrationBuilder.RenameColumn(
                name: "MediaID",
                table: "PostMedia",
                newName: "MediaId");

            migrationBuilder.RenameIndex(
                name: "IX_PostMedia_PostID",
                table: "PostMedia",
                newName: "IX_PostMedia_PostId");

            migrationBuilder.RenameColumn(
                name: "PostID",
                table: "Likes",
                newName: "PostId");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "Likes",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Likes_PostID",
                table: "Likes",
                newName: "IX_Likes_PostId");

            migrationBuilder.AlterColumn<string>(
                name: "Interests",
                table: "Users",
                type: "nvarchar(500)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)");

            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "Users",
                type: "nvarchar(10)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)");

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "Users",
                type: "nvarchar(50)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)");

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "Users",
                type: "nvarchar(50)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)");

            migrationBuilder.AlterColumn<int>(
                name: "Age",
                table: "Users",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Users",
                newName: "UserID");

            migrationBuilder.RenameColumn(
                name: "PostId",
                table: "Saves",
                newName: "PostID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Saves",
                newName: "UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Saves_PostId",
                table: "Saves",
                newName: "IX_Saves_PostID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Posts",
                newName: "UserID");

            migrationBuilder.RenameColumn(
                name: "PostId",
                table: "Posts",
                newName: "PostID");

            migrationBuilder.RenameIndex(
                name: "IX_Posts_UserId",
                table: "Posts",
                newName: "IX_Posts_UserID");

            migrationBuilder.RenameColumn(
                name: "PostId",
                table: "PostMedia",
                newName: "PostID");

            migrationBuilder.RenameColumn(
                name: "AppwriteFileUrl",
                table: "PostMedia",
                newName: "AppwriteFileURL");

            migrationBuilder.RenameColumn(
                name: "MediaId",
                table: "PostMedia",
                newName: "MediaID");

            migrationBuilder.RenameIndex(
                name: "IX_PostMedia_PostId",
                table: "PostMedia",
                newName: "IX_PostMedia_PostID");

            migrationBuilder.RenameColumn(
                name: "PostId",
                table: "Likes",
                newName: "PostID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Likes",
                newName: "UserID");

            migrationBuilder.RenameIndex(
                name: "IX_Likes_PostId",
                table: "Likes",
                newName: "IX_Likes_PostID");

            migrationBuilder.AlterColumn<string>(
                name: "Interests",
                table: "Users",
                type: "nvarchar(500)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Gender",
                table: "Users",
                type: "nvarchar(10)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Country",
                table: "Users",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "City",
                table: "Users",
                type: "nvarchar(50)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Age",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
