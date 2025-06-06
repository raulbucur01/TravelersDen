using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Diagnostics;
using BackendAPI.Models;
using BackendAPI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// binds and validates the JwtSettings section from appsettings.json
// fails on startup if the settings are invalid or missing
builder.Services.AddOptions<JwtSettings>()
    .BindConfiguration("JwtSettings")
    .Validate(settings =>
        !string.IsNullOrWhiteSpace(settings.Secret) &&
        !string.IsNullOrWhiteSpace(settings.Issuer) &&
        !string.IsNullOrWhiteSpace(settings.Audience) &&
        settings.ExpirationInMinutes > 0,
        "Invalid JwtSettings configuration")
    .ValidateOnStart();

// this accesses the JwtSettings section then binds it into an instance of the JwtSettings class returning it
// gives us a ready to use JwtSettings object
// used "!" because we know they are validated at this point to suppress the warning
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;

// registers the authentication system in the DI container
// makes JWT Bearer the default authentication scheme
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero, // strict expiration check
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            // custom logic to extract the JWT from the "jwt" cookie instead of the default Authorization header.
            // this enables cookie-based JWT authentication
            var token = context.Request.Cookies["jwt"];

            // if a token exists in the cookie, manually assign it to the context so the JWT middleware can validate it.
            if (!string.IsNullOrEmpty(token))
            {
                context.Token = token; // set the token to the one from the cookie
            }

            return Task.CompletedTask;
        }
    };
});

// add authorization policies so that we dont have to write [Authorize] on every controller
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

// Bind FastAPI settings
builder.Services.Configure<FastApiSettings>(builder.Configuration.GetSection("FastApiSettings"));

// Register services for dependency injection
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ItineraryGeneratorService>();
builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<PostService>();

builder.Services.AddHttpClient<FastApiService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(60);  // adjust as needed
});

// Add services to the container.
builder.Services.AddControllers();

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

// Enable middleware to serve Swagger UI, specifying the Swagger JSON endpoint
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Travel App API V1");
    c.RoutePrefix = string.Empty;  // Set to empty string to serve Swagger UI at the root (http://localhost:5000/)
});

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
