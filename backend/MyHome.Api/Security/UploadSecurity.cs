using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;

namespace MyHome.Api.Security;

/// <summary>
/// Централизованные настройки безопасности для пользовательских загрузок.
/// </summary>
public static class UploadSecurity
{
    /// <summary>
    /// Максимальный размер одного загружаемого файла (25 MB).
    /// </summary>
    public const long MaxFileSizeBytes = 25 * 1024 * 1024;

    /// <summary>
    /// Расширения, которые НИКОГДА не должны попадать в публичную статику,
    /// потому что могут исполниться в браузере жертвы (stored XSS / drive-by)
    /// или на сервере (если кто-то поставит обработчик).
    /// </summary>
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

    /// <summary>
    /// Валидирует загружаемый файл. Возвращает безопасное серверное расширение
    /// (с точкой, в нижнем регистре) или null + ошибку.
    /// </summary>
    public static (bool ok, string? safeExt, string? error) Validate(IFormFile? file)
    {
        if (file == null || file.Length == 0)
            return (false, null, "Файл не выбран");

        if (file.Length > MaxFileSizeBytes)
            return (false, null, $"Файл слишком большой (макс. {MaxFileSizeBytes / (1024 * 1024)} MB)");

        // Безопасно достаём расширение даже если FileName кривое.
        var ext = (Path.GetExtension(file.FileName) ?? string.Empty).Trim().ToLowerInvariant();

        // Допускаем только однокомпонентное расширение из [a-z0-9] длиной 1..8.
        if (string.IsNullOrEmpty(ext) || ext.Length > 8 || !System.Text.RegularExpressions.Regex.IsMatch(ext, "^\\.[a-z0-9]+$"))
            ext = string.Empty;

        if (!string.IsNullOrEmpty(ext) && DangerousExtensions.Contains(ext))
            return (false, null, "Этот тип файла запрещён");

        return (true, ext, null);
    }

    /// <summary>
    /// StaticFileOptions для пользовательского контента: принудительный download,
    /// nosniff, CSP-sandbox. Запускает любой HTML/SVG как скачивание, а не как страницу.
    /// </summary>
    public static StaticFileOptions HardenedStaticOptions()
    {
        // Кастомный mapping: убираем потенциально исполняемые в браузере типы,
        // чтобы они отдавались как application/octet-stream и не рендерились inline.
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
