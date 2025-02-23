using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using TravelAppBackendAPI.Models;
using TravelAppBackendAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// Bind FastAPI settings
builder.Services.Configure<FastApiSettings>(builder.Configuration.GetSection("FastApiSettings"));

builder.Services.AddHttpClient<FastApiService>();

// Add services to the container.
builder.Services.AddControllers();

// Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")  // Frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register the Swagger generator
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Travel App API",
        Version = "v1",
        Description = "API for managing users and other resources in a travel app"
    });
});

// Configure the DbContext with SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Enable middleware to serve generated Swagger as a JSON endpoint
app.UseSwagger();

// Enable middleware to serve Swagger UI (HTML, JS, CSS, etc.), specifying the Swagger JSON endpoint
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Travel App API V1");
    c.RoutePrefix = string.Empty;  // Set to empty string to serve Swagger UI at the root (http://localhost:5000/)
});

// Use CORS middleware to enable cross-origin requests
app.UseCors("AllowAll");  // Apply the "AllowAll" policy

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Automatically open Swagger UI in the browser when the app starts
if (app.Environment.IsDevelopment())
{
    var url = "https://localhost:7007"; 
    Task.Run(() => Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }));
}

app.Run();
