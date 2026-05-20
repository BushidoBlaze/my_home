import type {JSX} from "react";
import {Map, Plus, MoreHorizontal, ChevronRight, MessageCircle} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {useHorizontalScroll} from "@/shared/hooks/useHorizontalScroll.ts";
import {
    SELECTED_STATS,
    HOUSE_TABS,
    HOUSE_ALERTS,
    HOUSE_FINANCE,
    HOUSE_STATUS,
    COUNCIL,
    PASSPORT,
} from "../model/data.ts";

export default function HouseDetail(): JSX.Element {
    const total = HOUSE_STATUS.reduce((a, b) => a + b.count, 0);
    const tabsRef = useHorizontalScroll<HTMLDivElement>();

    return (
        <aside className="bd-detail">
            {/* Hero */}
            <div className="bd-hero">
                <div className="bd-hero__head">
                    <BuildingSwatch size={56} color="#ef4444" label="A"/>
                    <div className="bd-hero__text">
                        <div className="bd-hero__title">ул. Берёзовая, 14</div>
                        <div className="bd-hero__sub">ЖК «Зелёный квартал» · П-44Т · 1998</div>
                        <div className="bd-hero__actions">
                            <button className="btn btn--sm">
                                <Map size={12}/>На карте
                            </button>
                            <button className="btn btn--sm btn--primary">
                                <Plus size={12}/>Заявка
                            </button>
                            <button className="btn btn--icon btn--sm">
                                <MoreHorizontal size={13}/>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bd-hero__stats">
                    {SELECTED_STATS.map((s, i) => (
                        <div key={i} className="bd-hero__stat">
                            <div className="bd-hero__stat-label">{s.k}</div>
                            <div className="tnum bd-hero__stat-value">{s.v}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div className="bd-tabs" ref={tabsRef}>
                {HOUSE_TABS.map((t, i) => (
                    <div
                        key={i}
                        className={"bd-tab" + (t.active ? " bd-tab--active" : "")}
                    >
                        {t.label}
                        {t.count && <span className="bd-tab__count">{t.count}</span>}
                    </div>
                ))}
            </div>

            {/* Sections */}
            <div className="bd-sections">
                {/* Alerts */}
                <div className="bd-alerts">
                    {HOUSE_ALERTS.map((a, i) => {
                        const AlertIcon = a.icon;
                        return (
                            <div key={i} className="bd-alert">
                                <div className="bd-alert__icon" style={{background: a.bg, color: a.fg}}>
                                    <AlertIcon size={14}/>
                                </div>
                                <div className="bd-alert__text">
                                    <div className="bd-alert__title">{a.title}</div>
                                    <div className="bd-alert__sub">{a.sub}</div>
                                </div>
                                <ChevronRight size={13} style={{color: "#64748b"}}/>
                            </div>
                        );
                    })}
                </div>

                {/* Finance */}
                <div>
                    <div className="t-eyebrow bd-section-title">Финансы дома · май</div>
                    <div className="bd-finance">
                        {HOUSE_FINANCE.map((f, i) => (
                            <div
                                key={i}
                                className={"bd-finance__cell" + (f.highlight ? " bd-finance__cell--highlight" : "")}
                            >
                                <div className="bd-finance__label">{f.label}</div>
                                <div
                                    className="tnum bd-finance__value"
                                    style={f.color ? {color: f.color} : undefined}
                                >
                                    {f.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status */}
                <div>
                    <div className="bd-status__head">
                        <div className="t-eyebrow">Состояние квартир</div>
                        <span className="bd-status__total">{total} квартиры</span>
                    </div>
                    <div className="bd-status__bar">
                        {HOUSE_STATUS.map((s, i) => (
                            <div key={i} style={{width: `${s.pct}%`, background: s.color}}/>
                        ))}
                    </div>
                    <div className="bd-status__legend">
                        {HOUSE_STATUS.map((s, i) => (
                            <div key={i} className="bd-status__legend-item">
                                <span className="bd-status__dot" style={{background: s.color}}/>
                                <span className="bd-status__legend-label">{s.label}</span>
                                <span className="tnum bd-status__legend-count">{s.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Council */}
                <div>
                    <div className="bd-council__head">
                        <div className="t-eyebrow">Совет дома</div>
                        <button className="btn btn--sm btn--ghost">
                            Все жильцы <ChevronRight size={12}/>
                        </button>
                    </div>
                    <div className="bd-council__list">
                        {COUNCIL.map((p, i) => (
                            <div key={i} className="bd-council__item">
                                <Avatar name={p.name} size={28}/>
                                <div className="bd-council__main">
                                    <div className="bd-council__name">{p.name}</div>
                                    <div className="bd-council__role">{p.role} · {p.apt}</div>
                                </div>
                                <button className="btn btn--icon btn--sm btn--ghost">
                                    <MessageCircle size={13}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Passport */}
                <div>
                    <div className="t-eyebrow bd-section-title">Паспорт дома</div>
                    <div className="bd-passport">
                        {PASSPORT.map((r, i) => (
                            <div key={i} className="bd-passport__row">
                                <div className="bd-passport__key">{r.k}</div>
                                <div className="bd-passport__val">{r.v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
