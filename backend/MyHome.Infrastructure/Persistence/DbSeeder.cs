using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;

namespace MyHome.Infrastructure.Persistence;

// Заполняет пустые таблицы демо-данными. Зовётся из Program.cs после миграций.
// Повторный запуск безопасен - каждый кусок проверяет, есть ли уже записи.
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await RemoveDemoComplianceDeadlinesAsync(db);

        // если демо-данные вдруг не лягут - всё равно стартуем (чистим трекер и едем дальше)
        try
        {
            await SeedDemoWorldAsync(db);
        }
        catch (Exception ex)
        {
            db.ChangeTracker.Clear();
            Console.WriteLine($"[DbSeeder] demo world skipped: {ex.Message}");
        }

        await EnsureOrganizationAndBackfillAsync(db);
        await SeedMarketplaceAsync(db);
        await BackfillAccountNumbersAsync(db);
        await db.SaveChangesAsync();
    }

    // Демо-мир для показа: УК, дом, менеджер и 3 жителя + заявки, начисления,
    // показания, активное голосование и новость. Если менеджер уже есть - выходим.
    // Логины (пароль у всех Demo12345):
    //   manager@demo.ru, ivanov@demo.ru, petrova@demo.ru, sidorov@demo.ru
    private static async Task SeedDemoWorldAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync(u => u.Role == "Manager")) return;

        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var pwd = BCrypt.Net.BCrypt.HashPassword("Demo12345");

        // УК
        var org = await db.Organizations.FirstOrDefaultAsync();
        if (org == null)
        {
            org = new Organization { Id = Guid.NewGuid(), Name = "УК «Зелёный квартал»", Subtitle = "Мой Дом" };
            db.Organizations.Add(org);
        }

        // 2) Менеджер УК
        var manager = new User
        {
            Id = Guid.NewGuid(), Email = "manager@demo.ru", FullName = "Атласов Раян",
            Password = pwd, Role = "Manager", Phone = "+7 (495) 120-30-40",
            OrganizationId = org.Id, CreatedAt = now,
        };
        db.Users.Add(manager);

        // 3) Дом УК
        var building = new Building
        {
            Id = Guid.NewGuid(), OrganizationId = org.Id,
            City = "Москва", Street = "Рябинина", House = "8",
            Year = 2019, Series = "Монолит-кирпич", Cadastre = "77:01:000789:0011",
            Floors = 25, Entrances = 6, Lifts = 12, ApartmentsTotal = 312, AreaTotal = 21800m,
            ChairmanName = "Сергей Власов", ChairmanApartment = "41",
            Note = "Монолит-кирпич, 2019 г.", CreatedAt = now,
        };
        db.Buildings.Add(building);

        // 4) Жители (привязаны к УК; ФИО в формате «Фамилия Имя»)
        var residents = new[]
        {
            new User { Id = Guid.NewGuid(), Email = "ivanov@demo.ru",  FullName = "Иванов Алексей",  Password = pwd, Role = "Resident", Phone = "+7 (916) 100-10-01", OrganizationId = org.Id, Country = "Россия", City = "Москва", Street = "Рябинина", House = "8", Entrance = "1", Floor = "3", ApartmentNumber = "12", Area = 54.5f, Rooms = 2, Residents = 3, ApartmentRole = "Собственник", CreatedAt = now },
            new User { Id = Guid.NewGuid(), Email = "petrova@demo.ru", FullName = "Петрова Мария",   Password = pwd, Role = "Resident", Phone = "+7 (916) 100-10-02", OrganizationId = org.Id, Country = "Россия", City = "Москва", Street = "Рябинина", House = "8", Entrance = "2", Floor = "5", ApartmentNumber = "45", Area = 72.0f, Rooms = 3, Residents = 4, ApartmentRole = "Собственник", CreatedAt = now },
            new User { Id = Guid.NewGuid(), Email = "sidorov@demo.ru", FullName = "Сидоров Дмитрий", Password = pwd, Role = "Resident", Phone = "+7 (916) 100-10-03", OrganizationId = org.Id, Country = "Россия", City = "Москва", Street = "Рябинина", House = "8", Entrance = "3", Floor = "8", ApartmentNumber = "78", Area = 41.0f, Rooms = 1, Residents = 1, ApartmentRole = "Арендатор", CreatedAt = now },
        };
        db.Users.AddRange(residents);

        // 5) Заявки от жителей — разные статусы/приоритеты (чтобы доска была живой)
        db.ServiceRequests.AddRange(
            new ServiceRequest { Id = Guid.NewGuid(), ResidentId = residents[0].Id, Title = "Не работает домофон", Description = "Домофон в подъезде №1 не реагирует на звонок уже второй день.", Category = "Repair",   Priority = "High", Status = "New",        CreatedAt = now.AddHours(-3) },
            new ServiceRequest { Id = Guid.NewGuid(), ResidentId = residents[0].Id, Title = "Течёт кран на кухне",  Description = "Подтекает смеситель, нужна замена прокладки.",                  Category = "Plumbing", Priority = "Med",  Status = "InProgress", CreatedAt = now.AddDays(-1) },
            new ServiceRequest { Id = Guid.NewGuid(), ResidentId = residents[1].Id, Title = "Перегорела лампа в подъезде", Description = "На 5-м этаже не горит свет на лестничной площадке.",     Category = "Electric", Priority = "Low",  Status = "New",        CreatedAt = now.AddHours(-20) },
            new ServiceRequest { Id = Guid.NewGuid(), ResidentId = residents[1].Id, Title = "Уборка после ремонта", Description = "Соседи сделали ремонт, в подъезде строительная пыль.",          Category = "Cleaning", Priority = "Med",  Status = "Review",     CreatedAt = now.AddDays(-2) },
            new ServiceRequest { Id = Guid.NewGuid(), ResidentId = residents[2].Id, Title = "Шум при работе лифта",  Description = "Лифт в подъезде №3 громко скрипит при движении.",                Category = "Repair",   Priority = "Med",  Status = "Done",       CreatedAt = now.AddDays(-4) }
        );

        // 6) Начисления — у одного жителя долг, у остальных оплачено
        var period = RuMonthYear(now);
        db.UtilityBills.AddRange(
            new UtilityBill { Id = Guid.NewGuid(), UserId = residents[0].Id, Category = "Содержание жилья", Title = "ЖКУ за " + period, PeriodLabel = period, Amount = 9950m, DueDate = monthStart.AddDays(24), Status = "Paid",    PaidAt = now.AddDays(-2), CreatedAt = monthStart },
            new UtilityBill { Id = Guid.NewGuid(), UserId = residents[1].Id, Category = "Содержание жилья", Title = "ЖКУ за " + period, PeriodLabel = period, Amount = 7200m, DueDate = monthStart.AddDays(24), Status = "Pending", PaidAt = null,            CreatedAt = monthStart },
            new UtilityBill { Id = Guid.NewGuid(), UserId = residents[2].Id, Category = "Содержание жилья", Title = "ЖКУ за " + period, PeriodLabel = period, Amount = 5400m, DueDate = monthStart.AddDays(24), Status = "Paid",    PaidAt = now.AddDays(-1), CreatedAt = monthStart }
        );

        // 7) Показания счётчиков за текущий месяц (для % сдачи)
        db.MeterReadings.AddRange(
            new MeterReading { Id = Guid.NewGuid(), UserId = residents[0].Id, MeterType = "ХВС Кухня",     Value = 124.5m, ReadingDate = now, CreatedAt = now },
            new MeterReading { Id = Guid.NewGuid(), UserId = residents[0].Id, MeterType = "ГВС Кухня",     Value = 88.2m,  ReadingDate = now, CreatedAt = now },
            new MeterReading { Id = Guid.NewGuid(), UserId = residents[0].Id, MeterType = "Электричество", Value = 8530m,  ReadingDate = now, CreatedAt = now },
            new MeterReading { Id = Guid.NewGuid(), UserId = residents[1].Id, MeterType = "ХВС Кухня",     Value = 201m,   ReadingDate = now, CreatedAt = now }
        );

        // 8) Активное голосование от УК
        db.Polls.Add(new Poll
        {
            Id = Guid.NewGuid(), Title = "Установка шлагбаума во дворе",
            Description = "Предлагается установить автоматический шлагбаум на въезде во двор для ограничения сквозного проезда.",
            Category = "Благоустройство", Status = "Active", EndsAt = now.AddDays(10),
            CreatedAt = now.AddDays(-1), CreatedById = manager.Id,
            Options = new List<PollOption>
            {
                new() { Id = Guid.NewGuid(), Text = "За" },
                new() { Id = Guid.NewGuid(), Text = "Против" },
                new() { Id = Guid.NewGuid(), Text = "Воздержусь" },
            }
        });

        // 9) Новость от УК
        db.NewsPosts.Add(new NewsPost
        {
            Id = Guid.NewGuid(), Title = "Плановое отключение горячей воды",
            Content = "Уважаемые жители! С 1 по 3 июля будет проводиться плановое отключение ГВС для профилактических работ. Приносим извинения за неудобства.",
            Category = "Announcement", Importance = "Normal", SourceType = "ManagementCompany",
            IsPinned = true, CreatedById = manager.Id,
            PublishedAt = now.AddDays(-1), CreatedAt = now.AddDays(-1), UpdatedAt = now.AddDays(-1)
        });

        await db.SaveChangesAsync();
    }

    private static string RuMonthYear(DateTime d)
    {
        string[] m = { "", "январь", "февраль", "март", "апрель", "май", "июнь",
                       "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь" };
        return $"{m[d.Month]} {d.Year}";
    }

    // Создаёт одну УК (если её нет) и подцепляет к ней бесхозные данные:
    // дома и менеджеров напрямую, жильцов - по совпадению адреса с домом.
    // Трогает только записи с пустым OrganizationId.
    private static async Task EnsureOrganizationAndBackfillAsync(AppDbContext db)
    {
        var org = await db.Organizations.FirstOrDefaultAsync();
        if (org == null)
        {
            org = new Organization
            {
                Id = Guid.NewGuid(),
                Name = "УК «Зелёный квартал»",
                Subtitle = "Мой Дом",
            };
            db.Organizations.Add(org);
            await db.SaveChangesAsync(); // нужен Id для бэкфилла ниже
        }

        var orphanBuildings = await db.Buildings.Where(b => b.OrganizationId == null).ToListAsync();
        foreach (var b in orphanBuildings) b.OrganizationId = org.Id;

        var managers = await db.Users.Where(u => u.Role == "Manager" && u.OrganizationId == null).ToListAsync();
        foreach (var m in managers) m.OrganizationId = org.Id;

        await db.SaveChangesAsync();

        // жильцов цепляем к УК дома, чей адрес совпал
        var buildings = await db.Buildings.AsNoTracking().ToListAsync();
        var residents = await db.Users
            .Where(u => u.Role == "Resident" && u.OrganizationId == null && u.Street != null && u.House != null)
            .ToListAsync();

        foreach (var r in residents)
        {
            var match = buildings.FirstOrDefault(b => AddressMatches(r.Street, r.House, r.Building, b));
            if (match != null) r.OrganizationId = match.OrganizationId;
        }
    }

    private static string Norm(string? s) => (s ?? "").Trim().ToLowerInvariant();

    private static bool AddressMatches(string? street, string? house, string? block, Building b) =>
        Norm(street) == Norm(b.Street)
        && Norm(house) == Norm(b.House)
        && (string.IsNullOrWhiteSpace(b.Block) || Norm(block) == Norm(b.Block));

    // чистит старые демо-сроки, которые раньше засевал сидер (по заголовку+адресу).
    // реальные сроки не трогает
    private static async Task RemoveDemoComplianceDeadlinesAsync(AppDbContext db)
    {
        var demo = await db.ComplianceDeadlines
            .Where(c =>
                (c.Title == "Освидетельствование лифта №2" && c.Address == "Берёзовая, 14") ||
                (c.Title == "Проверка ВДГО, подъезды 1–3" && c.Address == "Парковая, 7к1") ||
                (c.Title == "Перезарядка огнетушителей" && c.Address == "Лесная, 2") ||
                (c.Title == "Проверка дымоходов и вентканалов" && c.Address == "Берёзовая, 16"))
            .ToListAsync();

        if (demo.Count > 0)
            db.ComplianceDeadlines.RemoveRange(demo);
    }

    // Демо-витрина маркетплейса: один исполнитель и несколько услуг по категориям,
    // чтобы /resident/marketplace не была пустой. Реальные услуги добавляют через UI.
    private static async Task SeedMarketplaceAsync(AppDbContext db)
    {
        if (await db.Services.AnyAsync()) return;

        // общий владелец витринных услуг. Пароль случайный (под ним не логинятся),
        // но валидный bcrypt-хэш, чтобы /auth/login не падал
        const string providerEmail = "service@zelenyy-kvartal.ru";
        var provider = await db.Users.FirstOrDefaultAsync(u => u.Email == providerEmail);
        if (provider == null)
        {
            provider = new User
            {
                Id = Guid.NewGuid(),
                Email = providerEmail,
                FullName = "Сервисный центр «Зелёный квартал»",
                Password = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                Role = "Resident",
                Phone = "+7 (495) 120-30-40",
                CreatedAt = DateTime.UtcNow,
            };
            db.Users.Add(provider);
        }

        db.Services.AddRange(
            new Service
            {
                Id = Guid.NewGuid(), Provider = provider,
                Title = "Генеральная уборка квартиры",
                Description = "Полная уборка с мытьём окон, кухни и санузла. Своё оборудование и эко-средства.",
                Category = "Cleaning", Price = 3500m,
                ProviderName = "Клининг «Чистый дом»", ProviderPhone = "+7 (495) 120-30-41",
            },
            new Service
            {
                Id = Guid.NewGuid(), Provider = provider,
                Title = "Мастер на час: мелкий ремонт",
                Description = "Повесить полку, починить смеситель, заменить розетку. Выезд в день обращения.",
                Category = "Repair", Price = 1200m,
                ProviderName = "Игорь, частный мастер", ProviderPhone = "+7 (916) 555-12-12",
            },
            new Service
            {
                Id = Guid.NewGuid(), Provider = provider,
                Title = "Доставка питьевой воды 19 л",
                Description = "Бутыль артезианской воды до двери. Бесплатная помпа при заказе от 3 бутылей.",
                Category = "Delivery", Price = 350m,
                ProviderName = "АкваДоставка", ProviderPhone = "+7 (495) 120-30-42",
            },
            new Service
            {
                Id = Guid.NewGuid(), Provider = provider,
                Title = "Ремонт стиральных машин",
                Description = "Диагностика и ремонт на дому, гарантия на работы 12 месяцев.",
                Category = "Appliances", Price = 1500m,
                ProviderName = "СервисБыт", ProviderPhone = "+7 (495) 120-30-43",
            },
            new Service
            {
                Id = Guid.NewGuid(), Provider = provider,
                Title = "Уход за газоном и участком",
                Description = "Стрижка газона, обрезка кустов, уборка территории у дома.",
                Category = "Home", Price = 2000m,
                ProviderName = "ЗелёныйДвор", ProviderPhone = "+7 (495) 120-30-44",
            },
            new Service
            {
                Id = Guid.NewGuid(), Provider = provider,
                Title = "Маникюр на дому",
                Description = "Аппаратный маникюр и покрытие гель-лаком. Стерильные инструменты, выезд мастера.",
                Category = "Beauty", Price = 1800m,
                ProviderName = "Studio Nails", ProviderPhone = "+7 (916) 555-77-88",
            }
        );
    }

    // проставляет лицевой счёт тем, у кого он ещё пуст.
    // формат 740-XXXX-XXXX, детерминированно из id
    private static async Task BackfillAccountNumbersAsync(AppDbContext db)
    {
        var users = await db.Users
            .Where(u => u.AccountNumber == null)
            .ToListAsync();

        foreach (var u in users)
        {
            u.AccountNumber = BuildAccountNumberFromId(u.Id);
        }
    }

    private static string BuildAccountNumberFromId(Guid id)
    {
        // первые 8 цифр из id в формате 740-XXXX-XXXX.
        // 740 - условный код демо-УК «Зелёный квартал»
        var hex = id.ToString("N");
        var digits = new string(hex.Where(char.IsDigit).Concat("00000000000").ToArray()).Substring(0, 8);
        return $"740-{digits.Substring(0, 4)}-{digits.Substring(4, 4)}";
    }
}
