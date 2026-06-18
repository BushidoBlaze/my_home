import type {JSX} from "react";
import {Trash2, MessageCircle} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import type {BuildingDetail, BuildingStatusSegment} from "@/api/managerBuildings.api.ts";

const STATUS_COLOR: Record<BuildingStatusSegment["tone"], string> = {
    ok: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    muted: "#64748b",
};

interface Props {
    detail: BuildingDetail | null;
    loading: boolean;
    formatMoney: (amount: number) => string;
    formatArea: (m2: number) => string;
    onDelete: (id: string) => void;
}

export default function HouseDetail({detail, loading, formatMoney, formatArea, onDelete}: Props): JSX.Element {
    if (loading && !detail) {
        return (
            <aside className="bd-detail">
                <div style={{padding: 24, textAlign: "center", color: "#64748b"}}>Загружаем…</div>
            </aside>
        );
    }

    if (!detail) {
        return (
            <aside className="bd-detail">
                <div style={{padding: 24, textAlign: "center", color: "#64748b"}}>
                    Выберите дом в таблице, чтобы посмотреть детали
                </div>
            </aside>
        );
    }

    const totalSegments = detail.statusBreakdown.reduce((a, s) => a + s.count, 0) || 1;

    const passport: Array<{k: string; v: string}> = [
        {k: "Серия / тип", v: detail.series ?? "не указано"},
        {k: "Кадастр", v: detail.cadastre ?? "не указано"},
        {k: "Этажей", v: String(detail.floors)},
        {k: "Подъездов", v: String(detail.entrances)},
        {k: "Лифтов", v: String(detail.lifts)},
        {k: "Год постройки", v: String(detail.year)},
        {k: "Площадь общая", v: formatArea(detail.areaTotal)},
    ];
    if (detail.note) passport.push({k: "Примечание", v: detail.note});

    const heroStats = [
        {k: "Этажей", v: String(detail.floors)},
        {k: "Подъездов", v: String(detail.entrances)},
        {k: "Лифтов", v: String(detail.lifts)},
        {k: "Квартир", v: String(detail.apartmentsTotal)},
    ];

    return (
        <aside className="bd-detail">
            <div className="bd-hero">
                <div className="bd-hero__head">
                    <BuildingSwatch size={56} color={STATUS_COLOR[detail.statusBreakdown[2]?.count > 0 ? "danger" : "ok"]} label="A"/>
                    <div className="bd-hero__text">
                        <div className="bd-hero__title">{detail.addr}</div>
                        <div className="bd-hero__sub">
                            {detail.series ? `${detail.series} · ` : ""}{detail.year}
                        </div>
                        <div className="bd-hero__actions">
                            <button
                                className="btn btn--sm bd-hero__delete"
                                onClick={() => onDelete(detail.id)}
                            >
                                <Trash2 size={13}/>Удалить дом
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bd-hero__stats">
                    {heroStats.map((s, i) => (
                        <div key={i} className="bd-hero__stat">
                            <div className="bd-hero__stat-label">{s.k}</div>
                            <div className="tnum bd-hero__stat-value">{s.v}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bd-sections">
                <div>
                    <div className="t-eyebrow bd-section-title">
                        Финансы дома · текущий месяц
                    </div>
                    <div className="bd-finance">
                        <div className="bd-finance__cell">
                            <div className="bd-finance__label">Начислено</div>
                            <div className="tnum bd-finance__value">{formatMoney(detail.finance.charged)}</div>
                        </div>
                        <div className="bd-finance__cell">
                            <div className="bd-finance__label">Собрано</div>
                            <div className="tnum bd-finance__value" style={{color: "#047857"}}>
                                {formatMoney(detail.finance.paid)}
                            </div>
                        </div>
                        <div className="bd-finance__cell bd-finance__cell--highlight">
                            <div className="bd-finance__label">Задолженность</div>
                            <div className="tnum bd-finance__value" style={{color: "#ef4444"}}>
                                {formatMoney(detail.finance.debt)}
                            </div>
                        </div>
                        <div className="bd-finance__cell">
                            <div className="bd-finance__label">Собираемость</div>
                            <div className="tnum bd-finance__value">{detail.finance.collectionPct}%</div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="bd-status__head">
                        <div className="t-eyebrow">Состояние квартир</div>
                        <span className="bd-status__total">{detail.apartmentsTotal} квартиры</span>
                    </div>
                    <div className="bd-status__bar">
                        {detail.statusBreakdown.map((s, i) => (
                            <div
                                key={i}
                                style={{
                                    width: `${(s.count / totalSegments) * 100}%`,
                                    background: STATUS_COLOR[s.tone],
                                }}
                            />
                        ))}
                    </div>
                    <div className="bd-status__legend">
                        {detail.statusBreakdown.map((s, i) => (
                            <div key={i} className="bd-status__legend-item">
                                <span className="bd-status__dot" style={{background: STATUS_COLOR[s.tone]}}/>
                                <span className="bd-status__legend-label">{s.label}</span>
                                <span className="tnum bd-status__legend-count">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {detail.chairmanName && (
                    <div>
                        <div className="bd-council__head">
                            <div className="t-eyebrow">Совет дома</div>
                        </div>
                        <div className="bd-council__list">
                            <div className="bd-council__item">
                                <Avatar name={detail.chairmanName} size={28}/>
                                <div className="bd-council__main">
                                    <div className="bd-council__name">{detail.chairmanName}</div>
                                    <div className="bd-council__role">
                                        Председатель совета{detail.chairmanApartment ? ` · кв. ${detail.chairmanApartment}` : ""}
                                    </div>
                                </div>
                                <button className="btn btn--icon btn--sm btn--ghost" disabled>
                                    <MessageCircle size={13}/>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <div className="t-eyebrow bd-section-title">Паспорт дома</div>
                    <div className="bd-passport">
                        {passport.map((r, i) => (
                            <div key={i} className="bd-passport__row">
                                <div className="bd-passport__key">{r.k}</div>
                                <div className="bd-passport__val">{r.v}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {detail.residents.length > 0 && (
                    <div>
                        <div className="t-eyebrow bd-section-title">
                            Жильцы ({detail.residents.length})
                        </div>
                        <div className="bd-council__list">
                            {detail.residents.slice(0, 6).map(r => (
                                <div key={r.id} className="bd-council__item">
                                    <Avatar name={r.fullName} size={28}/>
                                    <div className="bd-council__main">
                                        <div className="bd-council__name">{r.fullName}</div>
                                        <div className="bd-council__role">
                                            кв. {r.apartment ?? "—"}{r.debt > 0 ? ` · долг ${formatMoney(r.debt)}` : ""}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {detail.residents.length > 6 && (
                                <div style={{padding: 8, color: "#64748b", fontSize: 12}}>
                                    и ещё {detail.residents.length - 6}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
