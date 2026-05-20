// ─── Notifications ──────────────────────────────────────────────
export interface NotificationSettings {
    pushEnabled: boolean;
    pushNewRequest: boolean;
    pushStatusChange: boolean;
    emailEnabled: boolean;
    emailDigest: "never" | "daily" | "weekly";
    chatEnabled: boolean;
    chatSounds: boolean;
}

// ─── Chats ──────────────────────────────────────────────────────
export interface ChatSettings {
    autoSave: boolean;
    nightMode: boolean;
    nightModeStart: string; // "22:00"
    nightModeEnd: string;   // "07:00"
    blacklist: BlacklistEntry[];
}

export interface BlacklistEntry {
    id: string;
    name: string;
    avatarUrl?: string;
    blockedAt: string; // ISO date
}

// ─── Privacy ────────────────────────────────────────────────────
export type VisibilityLevel = "everyone" | "contacts" | "nobody";

export interface PrivacySettings {
    phoneVisibility: VisibilityLevel;
    whoCanWrite: VisibilityLevel;
    hideApartment: boolean;
    twoFactorEnabled: boolean;
}

// ─── Interface ──────────────────────────────────────────────────
export type Theme = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";

export interface InterfaceSettings {
    theme: Theme;
    fontSize: FontSize;
}

// ─── Language ───────────────────────────────────────────────────
export type Language = "ru" | "en";

// ─── Device / Sessions ──────────────────────────────────────────
export interface DeviceSession {
    id: string;
    deviceName: string;
    deviceType: "mobile" | "tablet" | "desktop" | "unknown";
    os: string;
    browser: string;
    ip: string;
    location: string;
    lastActive: string; // ISO date
    isCurrent: boolean;
}

// ─── Aggregate ──────────────────────────────────────────────────
export interface UserSettings {
    notifications: NotificationSettings;
    chats: ChatSettings;
    privacy: PrivacySettings;
    interface: InterfaceSettings;
    language: Language;
}

export interface UpdateSettingsPayload {
    section: keyof UserSettings;
    data: Partial<
        NotificationSettings | ChatSettings | PrivacySettings | InterfaceSettings
    > | Language;
}