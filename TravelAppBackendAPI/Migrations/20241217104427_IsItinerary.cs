using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class IsItinerary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsItinerary",
                table: "Posts",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsItinerary",
                table: "Posts");
        }
    }
}
