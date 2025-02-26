using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using TravelAppBackendAPI.Models;
using TravelAppBackendAPI.Services;
using System.Net.Http.Headers;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = async context =>
            {
                var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                Console.WriteLine("\n TOKEN: \n");
                Console.WriteLine(token);

                if (!string.IsNullOrEmpty(token))
                {
                    using var client = new HttpClient();
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                    Console.WriteLine(token);
                    client.DefaultRequestHeaders.Add("X-Appwrite-Project", "6740c57e0035d48d554d");
                    client.DefaultRequestHeaders.Add("X-Appwrite-Key", "standard_e1278d91a4cc9c9a9ba417957758cfd942e09d4096ec3f729c62c4d136c67332f98de184137829e7984130bd150af67a979228f0efe1acdb687293bacf2c4e69bbe32e3d20d618039ec2baad6eade43b158a44d15bd0858a6a5bf78bd96d365e35efe82d91a134b0f7b9feeef4ca790dbba9e77b85c51908bc750a23a7a918d2");

                    var response = await client.GetAsync("https://cloud.appwrite.io/v1/users");

                    if (response.IsSuccessStatusCode)
                    {
                        var userData = await response.Content.ReadAsStringAsync();

                        var identity = new ClaimsIdentity(JwtBearerDefaults.AuthenticationScheme);
                        identity.AddClaim(new Claim(ClaimTypes.NameIdentifier, "appwrite_user")); // Add Appwrite user ID if needed

                        var principal = new ClaimsPrincipal(identity);
                        context.Principal = principal;
                        context.Success();
                    }
                    else
                    {
                        context.Fail("Invalid Token");
                    }
                }
            }
        };
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = false
        };
    });

builder.Services.AddAuthorization();

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Automatically open Swagger UI in the browser when the app starts
if (app.Environment.IsDevelopment())
{
    var url = "https://localhost:7007"; 
    Task.Run(() => Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }));
}

app.Run();
