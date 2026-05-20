import { useState } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { SettingRow, Toggle, SectionCard, ConfirmModal } from "./SettingsComponents";
import { blacklistApi } from "../model/settingsApi";
import type { ChatSettings } from "../model/types";

interface Props {
    value: ChatSettings;
    onChange: (patch: Partial<ChatSettings>) => void;
}

export function ChatsSection({ value, onChange }: Props) {
    const [removeId, setRemoveId] = useState<string | null>(null);

    const handleUnblock = async () => {
        if (!removeId) return;
        await blacklistApi.remove(removeId);
        onChange({
            blacklist: value.blacklist.filter((b) => b.id !== removeId),
        });
        setRemoveId(null);
    };

    return (
        <SectionCard title="Чаты" icon={<MessageCircle size={20} />}>
            <div className="set-group">
                <div className="set-group__label">Основное</div>
                <SettingRow
                    label="Автосохранение"
                    description="Сохранять черновики сообщений"
                    right={
                        <Toggle
                            checked={value.autoSave}
                            onChange={(v) => onChange({ autoSave: v })}
                        />
                    }
                />
                <SettingRow
                    label="Ночной режим"
                    description="Не беспокоить в ночные часы"
                    right={
                        <Toggle
                            checked={value.nightMode}
                            onChange={(v) => onChange({ nightMode: v })}
                        />
                    }
                />
                {value.nightMode && (
                    <div className="set-time-range">
                        <label>
                            С{" "}
                            <input
                                type="time"
                                className="set-time-input"
                                value={value.nightModeStart}
                                onChange={(e) => onChange({ nightModeStart: e.target.value })}
                            />
                        </label>
                        <span>до</span>
                        <label>
                            <input
                                type="time"
                                className="set-time-input"
                                value={value.nightModeEnd}
                                onChange={(e) => onChange({ nightModeEnd: e.target.value })}
                            />
                        </label>
                    </div>
                )}
            </div>

            <div className="set-group">
                <div className="set-group__label">
                    Чёрный список
                    <span className="set-group__count">{value.blacklist.length}</span>
                </div>
                {value.blacklist.length === 0 ? (
                    <div className="set-empty">Список пуст</div>
                ) : (
                    value.blacklist.map((entry) => (
                        <SettingRow
                            key={entry.id}
                            label={entry.name}
                            description={`Заблокирован ${new Date(entry.blockedAt).toLocaleDateString("ru")}`}
                            right={
                                <button
                                    className="set-icon-btn set-icon-btn--danger"
                                    onClick={() => setRemoveId(entry.id)}
                                    title="Разблокировать"
                                    type="button"
                                >
                                    <Trash2 size={15} />
                                </button>
                            }
                        />
                    ))
                )}
            </div>

            {removeId && (
                <ConfirmModal
                    title="Разблокировать пользователя?"
                    description="Пользователь снова сможет писать вам сообщения."
                    confirmLabel="Разблокировать"
                    onConfirm={handleUnblock}
                    onCancel={() => setRemoveId(null)}
                />
            )}
        </SectionCard>
    );
}