using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;

namespace MyHome.Infrastructure.Persistence;

/// <summary>
/// Сидер — заполняет таблицу демо-данными, если она пустая.
/// Вызывается из Program.cs после миграций.
/// Безопасно повторно запускать: проверяет наличие записей перед вставкой.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await SeedComplianceDeadlinesAsync(db);
        await db.SaveChangesAsync();
    }

    private static async Task SeedComplianceDeadlinesAsync(AppDbContext db)
    {
        // Если уже есть записи — не дублируем.
        if (await db.ComplianceDeadlines.AnyAsync()) return;

        var now = DateTime.UtcNow;
        db.ComplianceDeadlines.AddRange(
            new ComplianceDeadline
            {
                Id = Guid.NewGuid(),
                Category = "Lift",
                Title = "Освидетельствование лифта №2",
                Address = "Берёзовая, 14",
                DueAt = now.AddDays(3),
            },
            new ComplianceDeadline
            {
                Id = Guid.NewGuid(),
                Category = "Gas",
                Title = "Проверка ВДГО, подъезды 1–3",
                Address = "Парковая, 7к1",
                DueAt = now.AddDays(9),
            },
            new ComplianceDeadline
            {
                Id = Guid.NewGuid(),
                Category = "Fire",
                Title = "Перезарядка огнетушителей",
                Address = "Лесная, 2",
                DueAt = now.AddDays(14),
            },
            new ComplianceDeadline
            {
                Id = Guid.NewGuid(),
                Category = "Duct",
                Title = "Проверка дымоходов и вентканалов",
                Address = "Берёзовая, 16",
                DueAt = now.AddDays(28),
            }
        );
    }
}
