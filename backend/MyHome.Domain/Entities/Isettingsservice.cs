using ResidentApp.Models.Settings;

namespace ResidentApp.Services;

public interface ISettingsService
{
    Task<UserSettingsDto> GetAllAsync(Guid userId);
    Task<UserSettingsDto> UpdateNotificationsAsync(Guid userId, UpdateNotificationsRequest req);
    Task<UserSettingsDto> UpdateChatsAsync(Guid userId, UpdateChatsRequest req);
    Task<UserSettingsDto> UpdatePrivacyAsync(Guid userId, UpdatePrivacyRequest req);
    Task<UserSettingsDto> UpdateInterfaceAsync(Guid userId, UpdateInterfaceRequest req);
    Task SetLanguageAsync(Guid userId, string language);

    Task<IReadOnlyList<DeviceSessionDto>> GetSessionsAsync(Guid userId);
    Task RevokeSessionAsync(Guid userId, Guid sessionId);
    Task RevokeAllOtherSessionsAsync(Guid userId, Guid currentSessionId);

    Task<Enable2FAResponse> Enable2FAAsync(Guid userId);
    Task Disable2FAAsync(Guid userId, string code);

    Task<IReadOnlyList<BlacklistEntryDto>> GetBlacklistAsync(Guid userId);
    Task RemoveFromBlacklistAsync(Guid userId, Guid blockedUserId);

    Task ClearCacheAsync(Guid userId);
    Task<byte[]> ExportDataAsync(Guid userId);
    Task DeleteAccountAsync(Guid userId, string password);
}