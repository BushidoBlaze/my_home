using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyHome.Api.Hubs;
using MyHome.Api.Security;
using MyHome.Infrastructure.Persistence;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // у разных контроллеров есть DTO с одинаковыми именами (CreateServiceDto и т.п.),
    // из-за этого swagger.json падал с 500. Берём полное имя типа, чтобы id не конфликтовали.
    options.CustomSchemaIds(t => (t.FullName ?? t.Name).Replace("+", "."));
});

// ограничиваем размер загрузки, чтобы не положили сервер гигантским файлом
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(o =>
{
    o.MultipartBodyLengthLimit = UploadSecurity.MaxFileSizeBytes;
});
builder.WebHost.ConfigureKestrel(k =>
{
    k.Limits.MaxRequestBodySize = UploadSecurity.MaxFileSizeBytes + 1024 * 1024; // запас на overhead multipart
});

// PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT. Ключ из env (Jwt__Key) или конфига, минимум 32 байта под HS256.
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Key отсутствует или короче 32 байт. Задайте сильный ключ через переменную окружения Jwt__Key " +
        "(например: openssl rand -base64 64).");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };

        // SignalR передаёт токен через query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/chat"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// CORS: сверяем host целиком, без сравнения по подстроке
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrWhiteSpace(origin)) return false;
                  if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
                  if (uri.Scheme != "http" && uri.Scheme != "https") return false;

                  var host = uri.Host;
                  if (host == "localhost" || host == "127.0.0.1") return true;

                  // туннели: только настоящие поддомены
                  if (host.EndsWith(".ngrok-free.app", StringComparison.OrdinalIgnoreCase)) return true;
                  if (host.EndsWith(".trycloudflare.com", StringComparison.OrdinalIgnoreCase)) return true;

                  return false;
              })
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()); // нужно для SignalR
});

// rate limiting: защита от перебора на /api/auth/*
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // 10 попыток в минуту с одного IP на авторизацию
    options.AddPolicy("auth", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    // общий потолок 600 запросов/мин на IP - смягчает простые DoS
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 600,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));
});

// SignalR: подробные ошибки только в dev
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = builder.Environment.IsDevelopment();
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler();
    app.UseHsts();
}

app.UseStatusCodePages();

// заголовки безопасности ставим раньше всего
app.UseSecurityHeaders(app.Environment.IsDevelopment());

app.UseCors("Frontend");

// раздаём загруженные файлы с защитными заголовками
app.UseStaticFiles(UploadSecurity.HardenedStaticOptions());

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapHub<ChatHub>("/hubs/chat");

app.Run();
