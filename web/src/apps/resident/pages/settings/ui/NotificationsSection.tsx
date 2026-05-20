import { Bell } from "lucide-react";
import {
    SettingRow,
    Toggle,
    SelectPill,
    SectionCard
} from "./SettingsComponents";
import type { NotificationSettings } from "../model/types";

interface Props {
    value: NotificationSettings;
    onChange: (patch: Partial<NotificationSettings>) => void;
}

const DIGEST_OPTIONS = [
    { value: "never" as const, label: "Никогда" },
    { value: "daily" as const, label: "Ежедн." },
    { value: "weekly" as const, label: "Еженед." },
];

export function NotificationsSection({ value, onChange }: Props) {
    return (
        <SectionCard title="Уведомления" icon={<Bell size={20} />} defaultOpen>
            {/* Push */}
            <div className="set-group">
                <div className="set-group__label">Push-уведомления</div>
                <SettingRow
                    label="Включить Push"
                    right={
                        <Toggle
                            checked={value.pushEnabled}
                            onChange={(v) => onChange({ pushEnabled: v })}
                        />
                    }
                />
                <SettingRow
                    label="Новая заявка"
                    description="Оповещение при поступлении заявки"
                    right={
                        <Toggle
                            checked={value.pushNewRequest}
                            onChange={(v) => onChange({ pushNewRequest: v })}
                            disabled={!value.pushEnabled}
                        />
                    }
                />
                <SettingRow
                    label="Изменение статуса"
                    description="Статус заявки обновился"
                    right={
                        <Toggle
                            checked={value.pushStatusChange}
                            onChange={(v) => onChange({ pushStatusChange: v })}
                            disabled={!value.pushEnabled}
                        />
                    }
                />
            </div>

            {/* Email */}
            <div className="set-group">
                <div className="set-group__label">Email</div>
                <SettingRow
                    label="Email-уведомления"
                    right={
                        <Toggle
                            checked={value.emailEnabled}
                            onChange={(v) => onChange({ emailEnabled: v })}
                        />
                    }
                />
                <SettingRow
                    label="Дайджест"
                    description="Частота сводной рассылки"
                    right={
                        <SelectPill
                            value={value.emailDigest}
                            options={DIGEST_OPTIONS}
                            onChange={(v) => onChange({ emailDigest: v })}
                        />
                    }
                />
            </div>

            {/* Chat */}
            <div className="set-group">
                <div className="set-group__label">Чат</div>
                <SettingRow
                    label="Уведомления в чате"
                    right={
                        <Toggle
                            checked={value.chatEnabled}
                            onChange={(v) => onChange({ chatEnabled: v })}
                        />
                    }
                />
                <SettingRow
                    label="Звуки"
                    description="Звуковой сигнал при новом сообщении"
                    right={
                        <Toggle
                            checked={value.chatSounds}
                            onChange={(v) => onChange({ chatSounds: v })}
                            disabled={!value.chatEnabled}
                        />
                    }
                />
            </div>
        </SectionCard>
    );
}