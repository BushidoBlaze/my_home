//plugins
import {useEffect, useMemo, useState, type JSX} from "react";
import {Filter, Info, Key, Sparkles, Plus} from "lucide-react";

//api
import {usersApi} from "@/api/users.api.ts";

//hooks
import {useExpensesPage} from "../hooks/useExpensesPage.ts";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

//types
import type {MeterReadingGroup} from "../model/expensesApi.ts";

//ui
import ResidentTopBar from "@/apps/resident/_shared/ResidentTopBar.tsx";
import {PeriodTile} from "./PeriodTile.tsx";
import {BillRow} from "./BillRow.tsx";
import {MonthlyChart} from "./MonthlyChart.tsx";
import {DonutBig} from "./DonutBig.tsx";
import {MeterReadingCard, type MeterTypeMeta} from "./MeterReadingCard.tsx";
import {AutoPayPanel} from "./AutoPayPanel.tsx";
import {HistoryList} from "./HistoryList.tsx";
import {ReceiptsList} from "./ReceiptsList.tsx";
import "./ExpensesPage.css";

// ── types & helpers ──────────────────────────────────────────────────────────

type TabId = "bills" | "analytics" | "meters" | "autopay" | "history" | "receipts";
type ChartPeriod = "year" | "12m" | "3y";

function money(value: number): string {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(value);
}

function currentMonth(): string {
    return new Date().toLocaleDateString("ru-RU", {month: "long"});
}

// Maps a distribution category to a stable chart color.
const CATEGORY_COLORS: Record<string, string> = {
    "Содержание": "#10b981",
    "Содержание жилья": "#10b981",
    "Отопление": "#1d4ed8",
    "Вода": "#b45309",
    "Водоснабжение": "#b45309",
    "Холодная и горячая вода": "#b45309",
    "Электр.": "#7c3aed",
    "Электроэнергия": "#7c3aed",
    "Связь": "#6a766f",
    "Связь и проч.": "#6a766f",
    "Домофон и связь": "#6a766f",
};

function colorFor(category: string, fallbackIndex: number): string {
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
    const palette = ["#10b981", "#1d4ed8", "#b45309", "#7c3aed", "#6a766f"];
    return palette[fallbackIndex % palette.length];
}

// ── meter types catalog ──────────────────────────────────────────────────────
//
// Жилец видит до 5 счётчиков (ХВС кухня/ванная, ГВС кухня/ванная, электричество).
// Названия используются как `meterType` в БД — поэтому держим их канонически здесь.
const METER_CATALOG: MeterTypeMeta[] = [
    {meterType: "ХВС Кухня",         icon: "drop",  type: "ХВС",            loc: "Кухня",      unit: "м³",     color: "#1d4ed8"},
    {meterType: "ХВС Ванная",        icon: "drop",  type: "ХВС",            loc: "Ванная",     unit: "м³",     color: "#1d4ed8"},
    {meterType: "ГВС Кухня",         icon: "flame", type: "ГВС",            loc: "Кухня",      unit: "м³",     color: "#b45309"},
    {meterType: "ГВС Ванная",        icon: "flame", type: "ГВС",            loc: "Ванная",     unit: "м³",     color: "#b45309"},
    {meterType: "Электричество",     icon: "bolt",  type: "Электричество",  loc: "Квартирный", unit: "кВт·ч",  color: "#7c3aed"},
];

const CHART_LEGEND = [
    {c: "#1d4ed8", l: "Начислено"},
    {c: "#10b981", l: "Оплачено"},
];

const TABS: { id: TabId; label: string; badge?: number; badgeTone?: "warning" | "danger" }[] = [
    {id: "bills", label: "Счета"},
    {id: "analytics", label: "Аналитика"},
    {id: "meters", label: "Показания ИПУ"},
    {id: "autopay", label: "Автоплатёж"},
    {id: "history", label: "История"},
    {id: "receipts", label: "Квитанции"},
];

// ── component ────────────────────────────────────────────────────────────────

export default function ExpensesPage(): JSX.Element {
    useDocumentTitle("Расходы и платежи");

    const {
        loading,
        error,
        summary,
        bills,
        distribution,
        payments,
        autoPay,
        setAutoPay,
        payingBillId,
        meterSubmitting,
        autoPaySubmitting,
        successMessage,
        chart,
        meterReadings,
        meterReadingsLoading,
        payBill,
        submitMeterReading,
        saveAutoPay,
    } = useExpensesPage();

    const [activeTab, setActiveTab] = useState<TabId>("bills");
    const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("12m");
    const [whatIsOpen, setWhatIsOpen] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [accountNumber, setAccountNumber] = useState<string>("");

    // Лицевой счёт берём из профиля; при первой загрузке он у бэка авто-back-fill-ится.
    useEffect(() => {
        usersApi.getMe()
            .then(u => setAccountNumber(u.accountNumber ?? ""))
            .catch(() => setAccountNumber(""));
    }, []);

    const month = currentMonth();
    const pendingBills = bills.filter(b => b.status !== "Paid");
    const paidBills = bills.filter(b => b.status === "Paid");
    const toPay = Math.max(summary.charged - summary.paid, summary.debt);

    // Сводим каталог счётчиков и историю с бэка в единый список карточек.
    // Если жилец ещё не передавал показания этого типа — `lastValue` пустой,
    // и кнопка карточки «Передать первое значение».
    const meterCards = useMemo(() => {
        const byType = new Map<string, MeterReadingGroup>();
        for (const r of meterReadings) byType.set(r.meterType, r);
        return METER_CATALOG.map(meta => ({
            meta,
            group: byType.get(meta.meterType),
        }));
    }, [meterReadings]);
    const pendingMeters = meterCards.filter(m => !m.group || !isReadingThisMonth(m.group.lastReadingDate)).length;

    // Real distribution data — used by the donut and structure list.
    const distributionData = useMemo(() => {
        const items = distribution.length > 0 ? distribution : [];
        const total = items.reduce((s, x) => s + x.amount, 0) || 1;
        return items.map((item, i) => ({
            v: item.amount,
            c: colorFor(item.category, i),
            l: item.category,
            p: Math.round((item.amount / total) * 100),
            money: money(item.amount),
        }));
    }, [distribution]);

    const totalCharged = useMemo(
        () => distributionData.reduce((s, x) => s + x.v, 0),
        [distributionData],
    );

    // Передача показаний конкретного типа счётчика на бэк.
    const handleMeterSubmit = (meta: MeterTypeMeta, newValue: string) => {
        const numeric = Number(newValue.replace(",", "."));
        if (!isFinite(numeric) || numeric < 0) return;
        void submitMeterReading({
            meterType: meta.meterType,
            value: numeric,
            readingDate: new Date().toISOString().slice(0, 10),
            comment: "",
        });
    };

    return (
        <div className="expenses-page">
            <ResidentTopBar
                title="Расходы"
                subtitle="Начисления, платежи и показания вашей квартиры"
                right={
                    <>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setAccountOpen(v => !v)}
                            disabled={!accountNumber}
                        >
                            <Key size={14}/>
                            {accountNumber || "Лицевой счёт"}
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setActiveTab("autopay")}
                        >
                            <Sparkles size={14}/>
                            Автоплатёж
                        </button>
                    </>
                }
            />

            <div className="expenses-page__content">

                {/* Notices */}
                {error && (
                    <div className="expenses-page__notice expenses-page__notice--error">{error}</div>
                )}
                {successMessage && (
                    <div className="expenses-page__notice expenses-page__notice--success">{successMessage}</div>
                )}

                {/* Account info popover */}
                {accountOpen && accountNumber && (
                    <div className="expenses-page__account-popover">
                        <div>
                            <div className="expenses-page__account-popover-label">Лицевой счёт</div>
                            <div className="mono expenses-page__account-popover-number">{accountNumber}</div>
                        </div>
                        <button
                            type="button"
                            className="btn btn--sm"
                            onClick={() => {
                                void navigator.clipboard.writeText(accountNumber);
                            }}
                        >
                            Скопировать
                        </button>
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={() => setAccountOpen(false)}
                        >
                            Закрыть
                        </button>
                    </div>
                )}

                {/* ── Hero card: period tiles + tabs ── */}
                <div className="expenses-page__hero">

                    <div className="expenses-page__hero-tiles">
                        <PeriodTile
                            main
                            label={`К ОПЛАТЕ В ${month.toUpperCase()}`}
                            value={loading ? "—" : money(toPay)}
                            sub={loading ? "" : `из ${money(summary.charged)} начислений`}
                            ctaLabel={toPay > 0 ? `Оплатить ${money(toPay)}` : undefined}
                            onCtaClick={() => {
                                const first = pendingBills[0];
                                if (first) void payBill(first.id);
                            }}
                        />
                        <PeriodTile
                            label={`Начислено за ${month}`}
                            value={loading ? "—" : money(summary.charged)}
                        />
                        <PeriodTile
                            label={`Оплачено за ${month}`}
                            value={loading ? "—" : money(summary.paid)}
                            tone="emerald"
                        />
                        <PeriodTile
                            label="Долг"
                            value={loading ? "—" : money(summary.debt)}
                            tone="danger"
                        />
                    </div>

                    <div className="expenses-page__hero-tabs">
                        {TABS.map(t => {
                            const active = activeTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    className={`expenses-page__hero-tab${active ? " expenses-page__hero-tab--active" : ""}`}
                                    onClick={() => setActiveTab(t.id)}
                                >
                                    {t.label}
                                </button>
                            );
                        })}

                        <span className="expenses-page__hero-tabs-spacer"/>

                        <button type="button" className="expenses-page__hero-tabs-button btn btn--ghost btn--sm" disabled>
                            <Filter size={13}/>
                            Период · {month} {new Date().getFullYear()}
                        </button>
                    </div>
                </div>

                {/* ── BILLS TAB ── */}
                {activeTab === "bills" && (
                    <div className="expenses-page__card">
                        <div className="expenses-page__card-header">
                            <div>
                                <div className="expenses-page__card-title">Счета ЖКУ · {month}</div>
                                <div className="expenses-page__card-sub">
                                    {pendingBills.length} не оплачено · {paidBills.length} закрыты
                                </div>
                            </div>
                            <div className="expenses-page__card-header-actions">
                                <button
                                    type="button"
                                    className="btn btn--ghost btn--sm"
                                    onClick={() => setWhatIsOpen(v => !v)}
                                >
                                    <Info size={13}/>
                                    Что входит?
                                </button>
                                {pendingBills.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn--primary btn--sm"
                                        onClick={() => {
                                            pendingBills.forEach(b => void payBill(b.id));
                                        }}
                                    >
                                        Оплатить всё ({money(toPay)})
                                    </button>
                                )}
                            </div>
                        </div>

                        {whatIsOpen && (
                            <div className="expenses-page__what-is">
                                <p>В счёт ЖКУ входят: содержание жилья (управление, уборка подъездов, вывоз мусора),
                                    отопление, водоснабжение (ХВС/ГВС), электроэнергия, домофон и связь, общедомовые
                                    нужды (ОДН).</p>
                            </div>
                        )}

                        {pendingBills.length > 0 && (
                            <div className="expenses-page__bills-section">
                                <div className="expenses-page__section-label">К ОПЛАТЕ</div>
                                {pendingBills.map(bill => (
                                    <BillRow
                                        key={bill.id}
                                        bill={bill}
                                        unpaid
                                        paying={payingBillId === bill.id}
                                        onPay={() => void payBill(bill.id)}
                                    />
                                ))}
                            </div>
                        )}

                        {paidBills.length > 0 && (
                            <div className="expenses-page__bills-section expenses-page__bills-section--paid">
                                <div className="expenses-page__section-label">ОПЛАЧЕНО В ЭТОМ ПЕРИОДЕ</div>
                                <div className="expenses-page__bills-list">
                                    {paidBills.map(bill => (
                                        <BillRow key={bill.id} bill={bill}/>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!loading && bills.length === 0 && (
                            <div className="expenses-page__bills-section">
                                <p className="expenses-page__placeholder">Счетов нет</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ── ANALYTICS TAB ── */}
                {activeTab === "analytics" && (
                    <div className="expenses-page__analytics-row">

                        <div className="expenses-page__card">
                            <div className="expenses-page__card-header">
                                <div>
                                    <div className="expenses-page__card-title">
                                        Расходы
                                        за {chartPeriod === "year" ? "год" : chartPeriod === "3y" ? "3 года" : "12 месяцев"}
                                    </div>
                                    <div className="expenses-page__card-sub">
                                        Начислено vs оплачено · по месяцам
                                    </div>
                                </div>
                                <div className="expenses-page__card-header-actions">
                                    {([["year", "Год"], ["12m", "12 мес"], ["3y", "3 года"]] as const).map(([id, label]) => (
                                        <button
                                            key={id}
                                            type="button"
                                            className={`btn btn--sm${chartPeriod === id ? " expenses-page__period-pill" : " btn--ghost"}`}
                                            onClick={() => setChartPeriod(id)}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="expenses-page__chart-body">
                                <MonthlyChart data={chart}/>
                                <div className="expenses-page__chart-legend">
                                    {CHART_LEGEND.map(s => (
                                        <span key={s.l} className="expenses-page__chart-legend-item">
                                            <span
                                                className="expenses-page__chart-legend-swatch"
                                                style={{background: s.c}}
                                            />
                                            <span className="expenses-page__chart-legend-text">{s.l}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="expenses-page__card">
                            <div className="expenses-page__card-header">
                                <div>
                                    <div className="expenses-page__card-title">Структура · {month}</div>
                                    <div className="expenses-page__card-sub">На что вы платите</div>
                                </div>
                            </div>
                            <div className="expenses-page__structure-body">
                                {distributionData.length > 0 ? (
                                    <>
                                        <DonutBig
                                            segments={distributionData}
                                            total={money(totalCharged)}
                                            monthLabel={month.toUpperCase()}
                                        />
                                        <div className="expenses-page__structure-list">
                                            {distributionData.map(s => (
                                                <div key={s.l} className="expenses-page__structure-row">
                                                    <span
                                                        className="expenses-page__structure-dot"
                                                        style={{background: s.c}}
                                                    />
                                                    <span className="expenses-page__structure-label">{s.l}</span>
                                                    <span className="tnum expenses-page__structure-value">{s.money}</span>
                                                    <span className="tnum expenses-page__structure-pct">{s.p}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div style={{padding: 16, color: "#6a766f", fontSize: 13}}>
                                        За этот месяц начислений ещё нет.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── METERS TAB ── Реальные показания: каждый счётчик из каталога ── */}
                {activeTab === "meters" && (
                    <div className="expenses-page__card">
                        <div className="expenses-page__card-header">
                            <div>
                                <div className="expenses-page__card-title">Показания счётчиков</div>
                                <div className="expenses-page__card-sub">
                                    Передайте до 25 {month} · показания сразу попадают в УК
                                </div>
                            </div>
                            <div className="expenses-page__card-header-actions">
                                <span className={`chip ${pendingMeters === 0 ? "chip--emerald" : "chip--warning"}`}>
                                    <span className="chip__dot"/>
                                    {pendingMeters === 0
                                        ? "все показания переданы"
                                        : `осталось ${pendingMeters} из ${meterCards.length}`}
                                </span>
                            </div>
                        </div>

                        {meterReadingsLoading && (
                            <div style={{padding: 24, color: "#6a766f", fontSize: 13}}>
                                Загружаем историю показаний…
                            </div>
                        )}

                        {!meterReadingsLoading && (
                            <div className="expenses-page__meters-grid">
                                {meterCards.map(card => (
                                    <MeterReadingCard
                                        key={card.meta.meterType}
                                        meta={card.meta}
                                        group={card.group}
                                        submitting={meterSubmitting}
                                        onSubmit={value => handleMeterSubmit(card.meta, value)}
                                    />
                                ))}
                            </div>
                        )}

                        <div style={{marginTop: 16, padding: 12, background: "#f7f9f7", borderRadius: 8, color: "#6a766f", fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start"}}>
                            <Plus size={14} style={{flexShrink: 0, marginTop: 2}}/>
                            <span>
                                Передавайте показания каждый месяц с 1-го по 25-е. Если пропустить месяц,
                                УК начислит по среднему за последние 6 месяцев или по нормативу.
                            </span>
                        </div>
                    </div>
                )}

                {activeTab === "autopay" && (
                    <AutoPayPanel
                        autoPay={autoPay}
                        setAutoPay={setAutoPay}
                        submitting={autoPaySubmitting}
                        onSave={() => void saveAutoPay()}
                    />
                )}

                {activeTab === "history" && (
                    <HistoryList payments={payments}/>
                )}

                {activeTab === "receipts" && (
                    <ReceiptsList payments={payments}/>
                )}

            </div>
        </div>
    );
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Был ли последний приём показаний в текущем календарном месяце. */
function isReadingThisMonth(isoDate: string): boolean {
    const d = new Date(isoDate);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
