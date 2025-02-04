using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddedZoomToTripSteps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Zoom",
                table: "TripSteps",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Zoom",
                table: "TripSteps");
        }
    }
}
