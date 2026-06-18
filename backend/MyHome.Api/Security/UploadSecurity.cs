using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;

namespace MyHome.Api.Security;

// Всё про безопасность пользовательских загрузок в одном месте.
public static class UploadSecurity
{
    // максимум на один файл - 25 МБ
    public const long MaxFileSizeBytes = 25 * 1024 * 1024;

    // расширения, которым нельзя попадать в публичную статику: могут исполниться
    // в браузере (stored XSS) или на сервере
    private static readonly HashSet<string> DangerousExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".html", ".htm", ".xhtml", ".shtml",
        ".svg", ".xml", ".xsl", ".xslt",
        ".js", ".mjs", ".cjs", ".jsx", ".ts", ".tsx",
        ".css",
        ".php", ".phtml", ".phar",
        ".asp", ".aspx", ".cshtml", ".razor", ".ashx", ".asmx",
        ".jsp", ".jspx",
        ".py", ".pyc", ".rb", ".pl", ".cgi",
        ".exe", ".dll", ".so", ".dylib",
        ".bat", ".cmd", ".com", ".scr",
        ".sh", ".bash", ".zsh", ".fish",
        ".ps1", ".psm1", ".psd1",
        ".vbs", ".vbe", ".wsf", ".wsh", ".hta",
        ".jar", ".msi", ".msp"
    };

    // Проверяет файл, возвращает безопасное расширение (с точкой, в нижнем регистре)
    // или null + текст ошибки.
    public static (bool ok, string? safeExt, string? error) Validate(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return (false, null, "Файл не выбран");

        if (file.Length > MaxFileSizeBytes)
            return (false, null, $"Файл слишком большой (макс. {MaxFileSizeBytes / (1024 * 1024)} MB)");

        // достаём расширение аккуратно, даже если имя файла кривое
        var ext = (Path.GetExtension(file.FileName) ?? string.Empty).Trim().ToLowerInvariant();

        // только одно расширение из [a-z0-9], длиной 1..8
        if (string.IsNullOrEmpty(ext) || ext.Length > 8 || !System.Text.RegularExpressions.Regex.IsMatch(ext, "^\\.[a-z0-9]+$"))
            ext = string.Empty;

        if (!string.IsNullOrEmpty(ext) && DangerousExtensions.Contains(ext))
            return (false, null, "Этот тип файла запрещён");

        return (true, ext, null);
    }

    // StaticFileOptions для пользовательского контента: nosniff, CSP-sandbox и
    // отдача как download. Любой HTML/SVG скачивается, а не открывается страницей.
    public static StaticFileOptions HardenedStaticOptions()
    {
        // убираем mapping исполняемых в браузере типов - пусть отдаются как octet-stream
        var contentTypeProvider = new FileExtensionContentTypeProvider();
        string[] strip = {
            ".html", ".htm", ".xhtml", ".shtml",
            ".svg", ".svgz",
            ".xml", ".xsl", ".xslt",
            ".js", ".mjs", ".cjs",
            ".css",
            ".jar", ".hta", ".vbs", ".wsf"
        };
        foreach (var ext in strip)
        {
            contentTypeProvider.Mappings.Remove(ext);
        }

        return new StaticFileOptions
        {
            ContentTypeProvider = contentTypeProvider,
            ServeUnknownFileTypes = true,
            DefaultContentType = "application/octet-stream",
            OnPrepareResponse = ctx =>
            {
                var headers = ctx.Context.Response.Headers;
                headers["X-Content-Type-Options"] = "nosniff";
                headers["Content-Security-Policy"] = "default-src 'none'; sandbox; frame-ancestors 'none'";
                headers["X-Frame-Options"] = "DENY";
                headers["Referrer-Policy"] = "no-referrer";
            }
        };
    }
}
