using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using BackendAPI.Models;
using BackendAPI.Services;
using Appwrite;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Appwrite.Services;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Add authentication with JWT Bearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = async context =>
            {
                //var token = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

                var token = context.Request.Cookies["AppwriteJWT"];
                Console.WriteLine("\n\n\n TOKEN: " + token + "\n\n\n");

                if (string.IsNullOrEmpty(token))
                {
                    context.NoResult();
                    return;
                }

                try
                {
                    var appwriteEndpoint = builder.Configuration["Appwrite:Endpoint"];
                    var appwriteProjectId = builder.Configuration["Appwrite:ProjectId"];

                    if (string.IsNullOrEmpty(appwriteEndpoint) || string.IsNullOrEmpty(appwriteProjectId))
                    {
                        throw new InvalidOperationException("Appwrite configuration values (Endpoint or ProjectId) are missing in appsettings.json.");
                    }

                    var client = new Client()
                        .SetEndpoint(appwriteEndpoint)
                        .SetProject(appwriteProjectId)
                        .SetJWT(token);

                    var account = new Account(client);
                    var user = await account.Get();

                    if (user != null)
                    {
                        var claims = new List<System.Security.Claims.Claim>
                        {
                            new System.Security.Claims.Claim("UserId", user.Id),
                            new System.Security.Claims.Claim("Email", user.Email)
                        };

                        var identity = new System.Security.Claims.ClaimsIdentity(claims, JwtBearerDefaults.AuthenticationScheme);
                        context.Principal = new System.Security.Claims.ClaimsPrincipal(identity);
                        context.Success();
                    }
                    else
                    {
                        context.Fail("Invalid token");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Token validation error: " + ex.Message);
                    context.Fail("Invalid token");
                }
            }
        };

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false,
            ValidateIssuerSigningKey = false,
            SignatureValidator = (token, _) => new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(token) // Bypass default JWT validation
        };
    });

builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

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
            .AllowCredentials()      
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
