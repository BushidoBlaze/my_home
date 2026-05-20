import { useState, useEffect, useCallback } from "react";
import { settingsApi } from "../model/settingsApi";
import type { Language, UserSettings } from "../model/types";

const DEFAULT_SETTINGS: UserSettings = {
    notifications: {
        pushEnabled: true,
        pushNewRequest: true,
        pushStatusChange: true,
        emailEnabled: false,
        emailDigest: "weekly",
        chatEnabled: true,
        chatSounds: true,
    },
    chats: {
        autoSave: true,
        nightMode: false,
        nightModeStart: "22:00",
        nightModeEnd: "07:00",
        blacklist: [],
    },
    privacy: {
        phoneVisibility: "contacts",
        whoCanWrite: "everyone",
        hideApartment: false,
        twoFactorEnabled: false,
    },
    interface: {
        theme: "light",
        fontSize: "medium",
    },
    language: "ru",
};

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        settingsApi
            .getAll()
            .then(setSettings)
            .catch(() => {
                // Fallback to defaults (offline/demo mode)
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        document.documentElement.lang = settings.language;

        const applyTheme = (theme: UserSettings["interface"]["theme"]) => {
            if (theme === "system") {
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
                return;
            }
            document.documentElement.setAttribute("data-theme", theme);
        };

        applyTheme(settings.interface.theme);

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleSystemThemeChange = () => {
            if (settings.interface.theme === "system") {
                applyTheme("system");
            }
        };
        mediaQuery.addEventListener("change", handleSystemThemeChange);

        const fontScale: Record<UserSettings["interface"]["fontSize"], string> = {
            small: "14px",
            medium: "16px",
            large: "18px",
        };
        document.documentElement.style.fontSize = fontScale[settings.interface.fontSize];

        return () => {
            mediaQuery.removeEventListener("change", handleSystemThemeChange);
        };
    }, [settings.language, settings.interface.theme, settings.interface.fontSize]);

    const updateSection = useCallback(
        async <K extends keyof UserSettings>(
            section: K,
            patch: K extends "language" ? Language : Partial<UserSettings[K]>
        ) => {
            // Optimistic update
            const prev = settings;
            const next = {
                ...settings,
                [section]:
                    section === "language"
                        ? patch
                        : { ...(settings[section] as object), ...(patch as object) },
            } as UserSettings;
            setSettings(next);

            setSaving(true);
            setError(null);
            try {
                await settingsApi.updateSection(section, next[section]);
            } catch (e) {
                setSettings(prev); // rollback
                setError((e as Error).message);
            } finally {
                setSaving(false);
            }
        },
        [settings]
    );

    return { settings, loading, saving, error, updateSection };
}