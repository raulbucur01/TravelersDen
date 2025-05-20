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
using System.Text;

var builder = WebApplication.CreateBuilder(args);

//// Add authentication with JWT Bearer
//builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
//    .AddJwtBearer(options =>
//    {
//        options.Events = new JwtBearerEvents
//        {
//            OnMessageReceived = async context =>
//            {
//                var token = context.Request.Cookies["AppwriteJWT"];
//                //Console.WriteLine("\n\n\n TOKEN: " + token + "\n\n\n");

//                if (string.IsNullOrEmpty(token))
//                {
//                    context.NoResult();
//                    return;
//                }

//                try
//                {
//                    var appwriteEndpoint = builder.Configuration["Appwrite:Endpoint"];
//                    var appwriteProjectId = builder.Configuration["Appwrite:ProjectId"];

//                    if (string.IsNullOrEmpty(appwriteEndpoint) || string.IsNullOrEmpty(appwriteProjectId))
//                    {
//                        throw new InvalidOperationException("Appwrite configuration values (Endpoint or ProjectId) are missing in appsettings.json.");
//                    }

//                    var client = new Client()
//                        .SetEndpoint(appwriteEndpoint)
//                        .SetProject(appwriteProjectId)
//                        .SetJWT(token);

//                    var account = new Account(client);
//                    var user = await account.Get();

//                    if (user != null)
//                    {
//                        var claims = new List<System.Security.Claims.Claim>
//                        {
//                            new System.Security.Claims.Claim("UserId", user.Id),
//                            new System.Security.Claims.Claim("Email", user.Email)
//                        };

//                        var identity = new System.Security.Claims.ClaimsIdentity(claims, JwtBearerDefaults.AuthenticationScheme);
//                        context.Principal = new System.Security.Claims.ClaimsPrincipal(identity);
//                        context.Success();
//                    }
//                    else
//                    {
//                        context.Fail("Invalid token");
//                    }
//                }
//                catch (Exception ex)
//                {
//                    Console.WriteLine("Token validation error: " + ex.Message);
//                    context.Fail("Invalid token");
//                }
//            }
//        };

//        options.TokenValidationParameters = new TokenValidationParameters
//        {
//            ValidateIssuer = false,
//            ValidateAudience = false,
//            ValidateLifetime = false,
//            ValidateIssuerSigningKey = false,
//            SignatureValidator = (token, _) => new System.IdentityModel.Tokens.Jwt.JwtSecurityToken(token) // Bypass default JWT validation
//        };
//    });

//builder.Services.AddAuthorizationBuilder()
//    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
//        .RequireAuthenticatedUser()
//        .Build());

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

builder.Services.AddHttpClient<FastApiService>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(10);  // adjust as needed
});

// Add services to the container.
builder.Services.AddControllers();

// Add CORS support
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:52679")  // Frontend URL
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
