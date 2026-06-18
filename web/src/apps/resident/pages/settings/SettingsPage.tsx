// plugins
import { AlertCircle } from "lucide-react";

//hooks
import { useSettings } from "./hooks/useSettings.ts";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import { NotificationsSection } from "./ui/NotificationsSection.tsx";
import { ChatsSection } from "./ui/ChatsSection.tsx";
import { PrivacySection } from "./ui/PrivacySection.tsx";
import { DevicesSection } from "./ui/DevicesSection.tsx";
import { LanguageSection, InterfaceSection, OtherSection} from "./ui/OtherSections.tsx";

// styles
import "./SettingsPage.css";


export function SettingsPage() {
    useDocumentTitle('Настройки');

    const { settings, loading, saving, error, updateSection } = useSettings();

    return (
        <div className="set-page">
            {/* Header */}
            <div className="set-page__header">
                <div>
                    <h1 className="set-page__title">Настройки</h1>
                    <p className="set-page__subtitle">Управляйте параметрами аккаунта и приложения</p>
                </div>
                {saving && <span className="set-page__saving">Сохранение…</span>}
            </div>

            {error && (
                <div className="set-page__error">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="set-page__loader">
                    <div className="set-spinner" />
                    <span>Загрузка настроек…</span>
                </div>
            ) : (
                <div className="set-page__sections">
                    <NotificationsSection
                        value={settings.notifications}
                        onChange={(p) => updateSection("notifications", p)}
                    />
                    <ChatsSection
                        value={settings.chats}
                        onChange={(p) => updateSection("chats", p)}
                    />
                    <PrivacySection
                        value={settings.privacy}
                        onChange={(p) => updateSection("privacy", p)}
                    />
                    <DevicesSection />
                    <LanguageSection
                        value={settings.language}
                        onChange={(v) => updateSection("language", v)}
                    />
                    <InterfaceSection
                        value={settings.interface}
                        onChange={(p) => updateSection("interface", p)}
                    />
                    <OtherSection />
                </div>
            )}
        </div>
    );
}