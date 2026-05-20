using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyHome.Domain.Entities;
using MyHome.Infrastructure.Persistence;
using System.Security.Claims;

namespace MyHome.Api.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExpensesController(AppDbContext db) => _db = db;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        await EnsureSeedDataAsync();

        var bills = await _db.UtilityBills
            .AsNoTracking()
            .Where(b => b.UserId == CurrentUserId)
            .OrderBy(b => b.Status == "Paid")
            .ThenBy(b => b.DueDate)
            .Select(b => new
            {
                id = b.Id,
                category = b.Category,
                title = b.Title,
                periodLabel = b.PeriodLabel,
                amount = b.Amount,
                dueDate = b.DueDate,
                status = b.Status,
                paidAt = b.PaidAt,
                receiptUrl = b.ReceiptUrl
            })
            .ToListAsync();

        var paymentHistory = await _db.UtilityBills
            .AsNoTracking()
            .Where(b => b.UserId == CurrentUserId && b.Status == "Paid")
            .OrderByDescending(b => b.PaidAt)
            .Take(20)
            .Select(b => new
            {
                id = b.Id,
                title = b.Title,
                amount = b.Amount,
                paidAt = b.PaidAt,
                receiptUrl = b.ReceiptUrl
            })
            .ToListAsync();

        var autoPay = await _db.AutoPaymentSettings
            .AsNoTracking()
            .Where(a => a.UserId == CurrentUserId)
            .Select(a => new
            {
                enabled = a.Enabled,
                cardMask = a.CardMask,
                dayOfMonth = a.DayOfMonth,
                limitAmount = a.LimitAmount
            })
            .FirstOrDefaultAsync();

        var charged = bills.Sum(b => b.amount);
        var paid = bills.Where(b => b.status == "Paid").Sum(b => b.amount);
        var debt = bills.Where(b => b.status != "Paid").Sum(b => b.amount);

        var managementDistribution = bills
            .GroupBy(b => b.category)
            .Select(g => new
            {
                category = g.Key,
                amount = g.Sum(x => x.amount)
            })
            .OrderByDescending(x => x.amount)
            .ToList();

        return Ok(new
        {
            summary = new
            {
                charged,
                paid,
                debt
            },
            bills,
            managementDistribution,
            paymentHistory,
            autoPay = autoPay ?? new
            {
                enabled = false,
                cardMask = (string?)null,
                dayOfMonth = 10,
                limitAmount = 15000m
            }
        });
    }

    [HttpPost("bills/{billId:guid}/pay")]
    public async Task<IActionResult> PayBill(Guid billId)
    {
        var bill = await _db.UtilityBills
            .FirstOrDefaultAsync(b => b.Id == billId && b.UserId == CurrentUserId);

        if (bill == null) return NotFound("Счет не найден.");
        if (bill.Status == "Paid") return BadRequest("Счет уже оплачен.");

        bill.Status = "Paid";
        bill.PaidAt = DateTime.UtcNow;
        bill.ReceiptUrl = $"/receipts/{bill.Id}.pdf";

        await _db.SaveChangesAsync();
        return Ok(new { id = bill.Id, status = bill.Status, paidAt = bill.PaidAt, receiptUrl = bill.ReceiptUrl });
    }

    [HttpPost("meter-readings")]
    public async Task<IActionResult> SubmitMeterReading([FromBody] SubmitMeterReadingDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.MeterType))
            return BadRequest("Укажите тип счетчика.");
        if (dto.Value < 0)
            return BadRequest("Показание не может быть отрицательным.");

        var entity = new MeterReading
        {
            Id = Guid.NewGuid(),
            UserId = CurrentUserId,
            MeterType = dto.MeterType.Trim(),
            Value = dto.Value,
            ReadingDate = dto.ReadingDate ?? DateTime.UtcNow,
            Comment = string.IsNullOrWhiteSpace(dto.Comment) ? null : dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _db.MeterReadings.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(new { id = entity.Id, createdAt = entity.CreatedAt });
    }

    [HttpPut("autopay")]
    public async Task<IActionResult> UpsertAutoPay([FromBody] UpsertAutoPayDto dto)
    {
        if (dto.DayOfMonth is < 1 or > 28)
            return BadRequest("День списания должен быть в диапазоне 1-28.");
        if (dto.LimitAmount <= 0)
            return BadRequest("Лимит должен быть больше нуля.");

        var entity = await _db.AutoPaymentSettings
            .FirstOrDefaultAsync(a => a.UserId == CurrentUserId);

        if (entity == null)
        {
            entity = new AutoPaymentSetting
            {
                Id = Guid.NewGuid(),
                UserId = CurrentUserId
            };
            _db.AutoPaymentSettings.Add(entity);
        }

        entity.Enabled = dto.Enabled;
        entity.CardMask = string.IsNullOrWhiteSpace(dto.CardMask) ? null : dto.CardMask.Trim();
        entity.DayOfMonth = dto.DayOfMonth;
        entity.LimitAmount = dto.LimitAmount;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(new
        {
            enabled = entity.Enabled,
            cardMask = entity.CardMask,
            dayOfMonth = entity.DayOfMonth,
            limitAmount = entity.LimitAmount
        });
    }

    private async Task EnsureSeedDataAsync()
    {
        var hasBills = await _db.UtilityBills.AnyAsync(b => b.UserId == CurrentUserId);
        if (hasBills) return;

        var now = DateTime.UtcNow;
        var bills = new List<UtilityBill>
        {
            new() { Id = Guid.NewGuid(), UserId = CurrentUserId, Category = "Электроэнергия", Title = "Электроэнергия", PeriodLabel = "Апрель 2026", Amount = 1820m, DueDate = now.AddDays(7), Status = "Pending", CreatedAt = now },
            new() { Id = Guid.NewGuid(), UserId = CurrentUserId, Category = "Водоснабжение", Title = "Холодная и горячая вода", PeriodLabel = "Апрель 2026", Amount = 1460m, DueDate = now.AddDays(10), Status = "Pending", CreatedAt = now },
            new() { Id = Guid.NewGuid(), UserId = CurrentUserId, Category = "Содержание", Title = "Содержание жилья", PeriodLabel = "Апрель 2026", Amount = 2950m, DueDate = now.AddDays(5), Status = "Pending", CreatedAt = now },
            new() { Id = Guid.NewGuid(), UserId = CurrentUserId, Category = "Отопление", Title = "Отопление", PeriodLabel = "Март 2026", Amount = 3180m, DueDate = now.AddDays(-20), Status = "Paid", PaidAt = now.AddDays(-15), ReceiptUrl = $"/receipts/{Guid.NewGuid()}.pdf", CreatedAt = now.AddDays(-25) },
            new() { Id = Guid.NewGuid(), UserId = CurrentUserId, Category = "Домофон", Title = "Домофон и связь", PeriodLabel = "Март 2026", Amount = 540m, DueDate = now.AddDays(-18), Status = "Paid", PaidAt = now.AddDays(-16), ReceiptUrl = $"/receipts/{Guid.NewGuid()}.pdf", CreatedAt = now.AddDays(-23) }
        };

        _db.UtilityBills.AddRange(bills);
        await _db.SaveChangesAsync();
    }

    public sealed class SubmitMeterReadingDto
    {
        public string MeterType { get; set; } = "";
        public decimal Value { get; set; }
        public DateTime? ReadingDate { get; set; }
        public string? Comment { get; set; }
    }

    public sealed class UpsertAutoPayDto
    {
        public bool Enabled { get; set; }
        public string? CardMask { get; set; }
        public int DayOfMonth { get; set; } = 10;
        public decimal LimitAmount { get; set; } = 15000m;
    }
}
