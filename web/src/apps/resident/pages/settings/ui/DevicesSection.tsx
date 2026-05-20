import { SectionCard, ConfirmModal } from "./SettingsComponents";
import { useDevices } from "../hooks/useDevices";
import { useState } from "react";
import { Monitor, Smartphone, Tablet, Laptop } from "lucide-react";

const DeviceIconMap: Record<string, React.ReactNode> = {
    mobile: <Smartphone size={16} />,
    desktop: <Laptop size={16} />,
    tablet: <Tablet size={16} />,
    unknown: <Monitor size={16} />,
};

export function DevicesSection() {
    const { sessions, loading, actionId, revoke, revokeAll } = useDevices();
    const [confirmAll, setConfirmAll] = useState(false);

    return (
        <SectionCard title="Устройства" icon={<Monitor size={20} />}>
            {loading ? (
                <div className="set-skeleton-list">
                    {[1, 2].map((i) => <div key={i} className="set-skeleton" />)}
                </div>
            ) : (
                <>
                    <div className="set-group">
                        <div className="set-group__label">Активные сессии</div>
                        {sessions.map((s) => (
                            <div key={s.id} className="set-device">
                                <div className="set-device__icon">
                                    {DeviceIconMap[s.deviceType] ?? DeviceIconMap.desktop}
                                </div>
                                <div className="set-device__info">
                  <span className="set-device__name">
                    {s.deviceName}
                      {s.isCurrent && (
                          <span className="set-device__current">текущее</span>
                      )}
                  </span>
                                    <span className="set-device__meta">
                    {s.os} · {s.browser} · {s.location}
                  </span>
                                    <span className="set-device__active">
                    Активен: {new Date(s.lastActive).toLocaleString("ru")}
                  </span>
                                </div>
                                {!s.isCurrent && (
                                    <button
                                        className="set-device__revoke"
                                        onClick={() => revoke(s.id)}
                                        disabled={actionId === s.id}
                                        type="button"
                                    >
                                        {actionId === s.id ? "…" : "Завершить"}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {sessions.filter((s) => !s.isCurrent).length > 0 && (
                        <button
                            className="set-btn set-btn--outline-danger"
                            onClick={() => setConfirmAll(true)}
                            type="button"
                        >
                            Завершить все остальные сессии
                        </button>
                    )}
                </>
            )}

            {confirmAll && (
                <ConfirmModal
                    title="Завершить все сессии?"
                    description="Все устройства, кроме текущего, будут разлогинены."
                    confirmLabel="Завершить"
                    danger
                    onConfirm={async () => { await revokeAll(); setConfirmAll(false); }}
                    onCancel={() => setConfirmAll(false)}
                />
            )}
        </SectionCard>
    );
}