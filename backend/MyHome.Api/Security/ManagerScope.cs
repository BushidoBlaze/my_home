using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using MyHome.Infrastructure.Persistence;

namespace MyHome.Api.Security;

/// <summary>
/// Резолвит УК (Organization) текущего менеджера из JWT. Менеджерские выборки
/// фильтруются по этому OrganizationId — каждая УК видит только свои дома/заявки.
/// </summary>
public static class ManagerScope
{
    public static async Task<Guid?> CurrentOrgIdAsync(AppDbContext db, ClaimsPrincipal user)
    {
        var idStr = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(idStr, out var id)) return null;

        return await db.Users
            .Where(u => u.Id == id)
            .Select(u => u.OrganizationId)
            .FirstOrDefaultAsync();
    }
}
