using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace MyHome.Api.Security;

public static class SecurityHeadersMiddleware
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app, bool isDevelopment)
    {
        return app.Use(async (context, next) =>
        {
            var headers = context.Response.Headers;

            // Сниффинг MIME — выкл.
            headers["X-Content-Type-Options"] = "nosniff";

            // Clickjacking — запрещаем фреймы вообще.
            headers["X-Frame-Options"] = "DENY";

            // Реферер — без раскрытия пути.
            headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

            // Минимально разумная CSP для API. На путях / (фронт) можно расширить отдельно.
            // Для API-ответов это просто defence-in-depth, JSON не исполняется.
            if (!headers.ContainsKey("Content-Security-Policy"))
            {
                headers["Content-Security-Policy"] =
                    "default-src 'none'; frame-ancestors 'none'; base-uri 'none'";
            }

            headers["Permissions-Policy"] =
                "geolocation=(), microphone=(), camera=(), payment=(), usb=()";

            // HSTS только в prod и только по HTTPS.
            if (!isDevelopment && context.Request.IsHttps)
            {
                headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains";
            }

            // Не отдаём идентификацию сервера.
            headers.Remove("Server");
            headers.Remove("X-Powered-By");

            await next();
        });
    }
}
