import { useState } from "react";
import { Shield } from "lucide-react";
import {toast} from "sonner";
import {
    SettingRow,
    Toggle,
    SelectPill,
    SectionCard,
    ConfirmModal
} from "./SettingsComponents";
import { privacyApi } from "../model/settingsApi";
import type { PrivacySettings, VisibilityLevel } from "../model/types";

const VISIBILITY_OPTIONS: { value: VisibilityLevel; label: string }[] = [
    { value: "everyone", label: "Все" },
    { value: "contacts", label: "Контакты" },
    { value: "nobody", label: "Никто" },
];

interface Props {
    value: PrivacySettings;
    onChange: (patch: Partial<PrivacySettings>) => void;
}

export function PrivacySection({ value, onChange }: Props) {
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);

    const handle2FAToggle = async (enable: boolean) => {
        try {
            if (enable) {
                const res = await privacyApi.enable2FA();
                setQrUrl(res.qrCodeUrl);
                setSecret(res.secret);
                setShow2FAModal(true);
                return;
            }

            onChange({ twoFactorEnabled: false });
            toast.success("2FA отключена");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Не удалось изменить 2FA");
        }
    };

    return (
        <SectionCard title="Конфиденциальность" icon={<Shield size={20} />}>
            <div className="set-group">
                <div className="set-group__label">Видимость</div>
                <SettingRow
                    label="Кто видит номер телефона"
                    right={
                        <SelectPill
                            value={value.phoneVisibility}
                            options={VISIBILITY_OPTIONS}
                            onChange={(v) => onChange({ phoneVisibility: v })}
                        />
                    }
                />
                <SettingRow
                    label="Кто может писать"
                    right={
                        <SelectPill
                            value={value.whoCanWrite}
                            options={VISIBILITY_OPTIONS}
                            onChange={(v) => onChange({ whoCanWrite: v })}
                        />
                    }
                />
                <SettingRow
                    label="Скрыть номер квартиры"
                    description="Другие жильцы не увидят вашу квартиру"
                    right={
                        <Toggle
                            checked={value.hideApartment}
                            onChange={(v) => onChange({ hideApartment: v })}
                        />
                    }
                />
            </div>

            <div className="set-group">
                <div className="set-group__label">Безопасность</div>
                <SettingRow
                    label="Двухфакторная аутентификация"
                    description={value.twoFactorEnabled ? "Включена · Totp-приложение" : "Выключена"}
                    right={
                        <Toggle
                            checked={value.twoFactorEnabled}
                            onChange={handle2FAToggle}
                        />
                    }
                />
            </div>

            {show2FAModal && (
                <ConfirmModal
                    title="Настройка 2FA"
                    description="Отсканируйте QR-код в приложении-аутентификаторе (Google Authenticator, Яндекс.Ключ и т.п.)"
                    confirmLabel="Готово"
                    onConfirm={() => {
                        onChange({ twoFactorEnabled: true });
                        toast.success("2FA включена");
                        setShow2FAModal(false);
                    }}
                    onCancel={() => setShow2FAModal(false)}
                >
                    {qrUrl && (
                        <div className="set-qr">
                            <img src={qrUrl} alt="QR для 2FA" width={160} height={160} />
                            {secret && <p>Ключ для ручного ввода: <code>{secret}</code></p>}
                        </div>
                    )}
                </ConfirmModal>
            )}
        </SectionCard>
    );
}