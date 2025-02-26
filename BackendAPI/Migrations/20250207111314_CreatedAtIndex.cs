using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class CreatedAtIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Posts_CreatedAt",
                table: "Posts",
                column: "CreatedAt",
                descending: new bool[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Posts_CreatedAt",
                table: "Posts");
        }
    }
}
