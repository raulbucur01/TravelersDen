using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelAppBackendAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddedItineraryDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accommodations",
                columns: table => new
                {
                    AccommodationId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PostId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2200)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PricePerNight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TotalPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Link = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accommodations", x => x.AccommodationId);
                    table.ForeignKey(
                        name: "FK_Accommodations_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripSteps",
                columns: table => new
                {
                    TripStepId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PostId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    StepNumber = table.Column<int>(type: "int", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(2200)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripSteps", x => x.TripStepId);
                    table.ForeignKey(
                        name: "FK_TripSteps_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "PostId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TripStepMedia",
                columns: table => new
                {
                    MediaId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TripStepId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AppwriteFileUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MediaType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TripStepMedia", x => x.MediaId);
                    table.ForeignKey(
                        name: "FK_TripStepMedia_TripSteps_TripStepId",
                        column: x => x.TripStepId,
                        principalTable: "TripSteps",
                        principalColumn: "TripStepId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accommodations_PostId",
                table: "Accommodations",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_TripStepMedia_TripStepId",
                table: "TripStepMedia",
                column: "TripStepId");

            migrationBuilder.CreateIndex(
                name: "IX_TripSteps_PostId",
                table: "TripSteps",
                column: "PostId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Accommodations");

            migrationBuilder.DropTable(
                name: "TripStepMedia");

            migrationBuilder.DropTable(
                name: "TripSteps");
        }
    }
}
