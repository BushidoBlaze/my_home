namespace ResidentApp.Models.Settings;

// ?? Outbound ??????????????????????????????????????????????????

public record NotificationSettingsDto(
    bool PushEnabled,
    bool PushNewRequest,
    bool PushStatusChange,
    bool EmailEnabled,
    string EmailDigest,
    bool ChatEnabled,
    bool ChatSounds
);

public record ChatSettingsDto(
    bool AutoSave,
    bool NightMode,
    string NightModeStart,
    string NightModeEnd,
    IReadOnlyList<BlacklistEntryDto> Blacklist
);

public record BlacklistEntryDto(
    string Id,
    string Name,
    string? AvatarUrl,
    DateTime BlockedAt
);

public record PrivacySettingsDto(
    string PhoneVisibility,
    string WhoCanWrite,
    bool HideApartment,
    bool TwoFactorEnabled
);

public record InterfaceSettingsDto(
    string Theme,
    string FontSize
);

public record UserSettingsDto(
    NotificationSettingsDto Notifications,
    ChatSettingsDto Chats,
    PrivacySettingsDto Privacy,
    InterfaceSettingsDto Interface,
    string Language
);

public record DeviceSessionDto(
    string Id,
    string DeviceName,
    string DeviceType,
    string Os,
    string Browser,
    string Ip,
    string Location,
    DateTime LastActive,
    bool IsCurrent
);

// ?? Inbound ???????????????????????????????????????????????????

public record UpdateNotificationsRequest(
    bool? PushEnabled,
    bool? PushNewRequest,
    bool? PushStatusChange,
    bool? EmailEnabled,
    string? EmailDigest,
    bool? ChatEnabled,
    bool? ChatSounds
);

public record UpdateChatsRequest(
    bool? AutoSave,
    bool? NightMode,
    string? NightModeStart,
    string? NightModeEnd
);

public record UpdatePrivacyRequest(
    string? PhoneVisibility,
    string? WhoCanWrite,
    bool? HideApartment
);

public record UpdateInterfaceRequest(
    string? Theme,
    string? FontSize
);

public record SetLanguageRequest(string Language);

public record Enable2FAResponse(string QrCodeUrl, string Secret);

public record Disable2FARequest(string Code);

public record DeleteAccountRequest(string Password);