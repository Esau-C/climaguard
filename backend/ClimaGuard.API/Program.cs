using ClimaGuard.API.Data;
using ClimaGuard.API.Hubs;
using ClimaGuard.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// BASE DE DATOS
// =====================================================

builder.Services.AddDbContext<ClimaGuardDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// =====================================================
// SERVICIOS
// =====================================================


builder.Services.AddScoped<AnalisisRiesgoService>();
builder.Services.AddScoped<BitacoraService>();
builder.Services.AddHttpContextAccessor();

// registrar una unica instancia del simulador
builder.Services.AddSingleton<SimuladorClimaticoService>();

// ejecutar esa misma instancia como servicio en segundo plano
builder.Services.AddHostedService(provider =>
    provider.GetRequiredService<SimuladorClimaticoService>());

// =====================================================
// SIGNALR
// =====================================================

builder.Services.AddSignalR();

// =====================================================
// CONTROLADORES
// =====================================================

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            ReferenceHandler.IgnoreCycles;
    });

// =====================================================
// CORS
// =====================================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "http://localhost:5500"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// =====================================================
// AUTENTICACION JWT
// =====================================================

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "No se encontro Jwt:Key en appsettings.json."
    );

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ClockSkew = TimeSpan.Zero
            };
    });

// =====================================================
// AUTORIZACION
// =====================================================

builder.Services.AddAuthorization();

// =====================================================
// OPENAPI
// =====================================================

builder.Services.AddOpenApi();

var app = builder.Build();

// =====================================================
// PIPELINE
// =====================================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AngularPolicy");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// =====================================================
// SIGNALR HUB
// =====================================================

app.MapHub<AlertHub>("/hubs/alerts");

app.Run();