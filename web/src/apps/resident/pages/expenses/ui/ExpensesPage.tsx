import type {FormEvent, ReactNode} from "react";
import {useState} from "react";
import {
    BadgeCheck, CircleDollarSign, Clock, CreditCard,
    ExternalLink, FileText, Gauge, PieChart, Wallet,
} from "lucide-react";
import {Cell, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip} from "recharts";
import {useExpensesPage} from "../hooks/useExpensesPage.ts";
import "./ExpensesPage.css";

type Tab = "bills" | "analytics" | "meters" | "autopay" | "history";

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
    {id: "bills",     label: "Счета",         icon: <FileText size={15}/>},
    {id: "analytics", label: "Аналитика",      icon: <PieChart size={15}/>},
    {id: "meters",    label: "Показания ИПУ",  icon: <Gauge size={15}/>},
    {id: "autopay",   label: "Автоплатеж",     icon: <CreditCard size={15}/>},
    {id: "history",   label: "История",        icon: <Clock size={15}/>},
];

const CHART_COLORS = ["#1f7a5a", "#2ecc71", "#10b981", "#34d399", "#86efac", "#14532d"];

function money(value: number) {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function ExpensesPage() {
    const [activeTab, setActiveTab] = useState<Tab>("bills");

    const {
        loading,
        error,
        summary,
        bills,
        distribution,
        payments,
        autoPay,
        setAutoPay,
        meterForm,
        setMeterForm,
        payingBillId,
        meterSubmitting,
        autoPaySubmitting,
        successMessage,
        payBill,
        submitMeterReading,
        saveAutoPay,
    } = useExpensesPage();

    const onSubmitMeter = (e: FormEvent) => { e.preventDefault(); void submitMeterReading(); };
    const onSubmitAutoPay = (e: FormEvent) => { e.preventDefault(); void saveAutoPay(); };

    const pendingBills = bills.filter(b => b.status !== "Paid");
    const paidBills    = bills.filter(b => b.status === "Paid");

    return (
        <div className="exp-page">

            {/* Шапка */}
            <header className="exp-page__header">
                <h1 className="exp-page__title">Расходы</h1>
                <p className="exp-page__subtitle">Начисления, платежи и коммунальные показатели вашей квартиры</p>
            </header>

            {/* Уведомления */}
            {error          && <div className="exp-notice exp-notice--error">{error}</div>}
            {successMessage && <div className="exp-notice exp-notice--success">{successMessage}</div>}

            {/* Сводные карточки — всегда видны */}
            <div className="exp-stats">
                <article className="exp-stat exp-stat--charged">
                    <div className="exp-stat__icon"><CircleDollarSign size={20}/></div>
                    <div>
                        <span className="exp-stat__label">Начислено</span>
                        <strong className="exp-stat__value">{money(summary.charged)}</strong>
                    </div>
                </article>
                <article className="exp-stat exp-stat--paid">
                    <div className="exp-stat__icon"><BadgeCheck size={20}/></div>
                    <div>
                        <span className="exp-stat__label">Оплачено</span>
                        <strong className="exp-stat__value">{money(summary.paid)}</strong>
                    </div>
                </article>
                <article className="exp-stat exp-stat--debt">
                    <div className="exp-stat__icon"><Wallet size={20}/></div>
                    <div>
                        <span className="exp-stat__label">Долг</span>
                        <strong className="exp-stat__value">{money(summary.debt)}</strong>
                    </div>
                </article>
            </div>

            {/* Таб-навигация */}
            <nav className="exp-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`exp-tab ${activeTab === tab.id ? "exp-tab--active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.id === "bills" && pendingBills.length > 0 && (
                            <span className="exp-tab__badge">{pendingBills.length}</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Вкладка: Счета ── */}
            {activeTab === "bills" && (
                <section className="exp-panel" key="bills">
                    <div className="exp-panel__head">
                        <div className="exp-panel__icon"><FileText size={16}/></div>
                        <h2 className="exp-panel__title">Счета ЖКУ</h2>
                        {pendingBills.length > 0 && (
                            <span className="exp-panel__count exp-panel__count--warn">
                                {pendingBills.length} не оплачено
                            </span>
                        )}
                    </div>

                    {loading && <p className="exp-muted">Загрузка счетов…</p>}

                    {!loading && pendingBills.length > 0 && (
                        <div className="exp-bills">
                            <p className="exp-bills__group-label">К оплате</p>
                            {pendingBills.map(bill => (
                                <article key={bill.id} className="exp-bill exp-bill--pending">
                                    <div className="exp-bill__left">
                                        <span className="exp-bill__category">{bill.category}</span>
                                        <h3 className="exp-bill__title">{bill.title}</h3>
                                        <p className="exp-bill__meta">
                                            {bill.periodLabel} · Срок: {new Date(bill.dueDate).toLocaleDateString("ru-RU")}
                                        </p>
                                    </div>
                                    <div className="exp-bill__right">
                                        <strong className="exp-bill__amount">{money(bill.amount)}</strong>
                                        <button
                                            className="exp-btn exp-btn--primary"
                                            onClick={() => void payBill(bill.id)}
                                            disabled={payingBillId === bill.id}
                                        >
                                            {payingBillId === bill.id ? "Оплата…" : "Оплатить"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {!loading && paidBills.length > 0 && (
                        <div className="exp-bills exp-bills--paid">
                            <p className="exp-bills__group-label">Оплачено в этом периоде</p>
                            {paidBills.map(bill => (
                                <article key={bill.id} className="exp-bill exp-bill--done">
                                    <div className="exp-bill__left">
                                        <span className="exp-bill__category">{bill.category}</span>
                                        <h3 className="exp-bill__title">{bill.title}</h3>
                                        <p className="exp-bill__meta">{bill.periodLabel}</p>
                                    </div>
                                    <div className="exp-bill__right">
                                        <strong className="exp-bill__amount">{money(bill.amount)}</strong>
                                        <span className="exp-bill__paid-badge">Оплачено</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {!loading && bills.length === 0 && (
                        <p className="exp-muted">Счетов нет</p>
                    )}
                </section>
            )}

            {/* ── Вкладка: Аналитика ── */}
            {activeTab === "analytics" && (
                <section className="exp-panel" key="analytics">
                    <div className="exp-panel__head">
                        <div className="exp-panel__icon"><PieChart size={16}/></div>
                        <h2 className="exp-panel__title">Распределение расходов УК</h2>
                    </div>

                    {distribution.length === 0 ? (
                        <p className="exp-muted">Данных для отображения пока нет</p>
                    ) : (
                        <div className="exp-chart-wrap">
                            <div className="exp-chart">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie
                                            data={distribution}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={54}
                                            outerRadius={88}
                                            paddingAngle={2}
                                        >
                                            {distribution.map((item, i) => (
                                                <Cell key={item.category} fill={CHART_COLORS[i % CHART_COLORS.length]}/>
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={v => money(Number(v ?? 0))}
                                            labelFormatter={l => String(l)}
                                        />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="exp-legend">
                                {distribution.map((item, i) => (
                                    <div key={item.category} className="exp-legend-item">
                                        <span className="exp-legend-label">
                                            <i className="exp-legend-dot" style={{background: CHART_COLORS[i % CHART_COLORS.length]}}/>
                                            {item.category}
                                        </span>
                                        <strong className="exp-legend-value">{money(item.amount)}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* ── Вкладка: Показания ИПУ ── */}
            {activeTab === "meters" && (
                <section className="exp-panel" key="meters">
                    <div className="exp-panel__head">
                        <div className="exp-panel__icon"><Gauge size={16}/></div>
                        <h2 className="exp-panel__title">Передача показаний ИПУ</h2>
                    </div>
                    <p className="exp-panel__desc">
                        Передавайте показания счётчиков ежемесячно до 25-го числа.
                    </p>

                    <form className="exp-form" onSubmit={onSubmitMeter}>
                        <div className="exp-form__row">
                            <label className="exp-label">
                                <span>Тип счётчика</span>
                                <select
                                    className="exp-input"
                                    value={meterForm.meterType}
                                    onChange={e => setMeterForm(prev => ({...prev, meterType: e.target.value}))}
                                >
                                    <option>Холодная вода</option>
                                    <option>Горячая вода</option>
                                    <option>Электроэнергия</option>
                                    <option>Тепло</option>
                                </select>
                            </label>
                            <label className="exp-label">
                                <span>Показание</span>
                                <input
                                    className="exp-input"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={meterForm.value}
                                    onChange={e => setMeterForm(prev => ({...prev, value: Number(e.target.value)}))}
                                    required
                                    placeholder="0.00"
                                />
                            </label>
                            <label className="exp-label">
                                <span>Дата снятия</span>
                                <input
                                    className="exp-input"
                                    type="date"
                                    value={meterForm.readingDate}
                                    onChange={e => setMeterForm(prev => ({...prev, readingDate: e.target.value}))}
                                    required
                                />
                            </label>
                        </div>
                        <label className="exp-label">
                            <span>Комментарий <span className="exp-optional">(необязательно)</span></span>
                            <textarea
                                className="exp-input exp-textarea"
                                value={meterForm.comment ?? ""}
                                onChange={e => setMeterForm(prev => ({...prev, comment: e.target.value}))}
                                placeholder="Например: данные с фото счётчика"
                            />
                        </label>
                        <button className="exp-btn exp-btn--primary" type="submit" disabled={meterSubmitting}>
                            {meterSubmitting ? "Отправка…" : "Передать показания"}
                        </button>
                    </form>
                </section>
            )}

            {/* ── Вкладка: Автоплатеж ── */}
            {activeTab === "autopay" && (
                <section className="exp-panel" key="autopay">
                    <div className="exp-panel__head">
                        <div className="exp-panel__icon"><CreditCard size={16}/></div>
                        <h2 className="exp-panel__title">Автоплатеж</h2>
                    </div>
                    <p className="exp-panel__desc">
                        Платежи списываются автоматически в выбранный день при наличии непогашенных счетов.
                    </p>

                    <form className="exp-form" onSubmit={onSubmitAutoPay}>
                        {/* Тоггл включения */}
                        <div className="exp-toggle-row">
                            <div className="exp-toggle-row__info">
                                <span className="exp-toggle-row__label">Включить автоплатеж</span>
                                <span className="exp-toggle-row__desc">Автоматическое списание при появлении счетов</span>
                            </div>
                            <button
                                type="button"
                                className={`exp-toggle ${autoPay.enabled ? "exp-toggle--on" : ""}`}
                                onClick={() => setAutoPay(prev => ({...prev, enabled: !prev.enabled}))}
                            >
                                <span className="exp-toggle__thumb"/>
                            </button>
                        </div>

                        <div className="exp-form__row exp-form__row--two">
                            <label className="exp-label">
                                <span>Карта (маска номера)</span>
                                <input
                                    className="exp-input"
                                    value={autoPay.cardMask ?? ""}
                                    onChange={e => setAutoPay(prev => ({...prev, cardMask: e.target.value}))}
                                    placeholder="**** **** **** 1234"
                                    disabled={!autoPay.enabled}
                                />
                            </label>
                            <label className="exp-label">
                                <span>День списания</span>
                                <input
                                    className="exp-input"
                                    type="number"
                                    min={1}
                                    max={28}
                                    value={autoPay.dayOfMonth}
                                    onChange={e => setAutoPay(prev => ({...prev, dayOfMonth: Number(e.target.value)}))}
                                    disabled={!autoPay.enabled}
                                />
                            </label>
                        </div>

                        <label className="exp-label">
                            <span>Лимит на списание, ₽</span>
                            <input
                                className="exp-input"
                                type="number"
                                min={100}
                                value={autoPay.limitAmount}
                                onChange={e => setAutoPay(prev => ({...prev, limitAmount: Number(e.target.value)}))}
                                disabled={!autoPay.enabled}
                                placeholder="15000"
                            />
                        </label>

                        <button
                            className="exp-btn exp-btn--primary"
                            type="submit"
                            disabled={autoPaySubmitting}
                        >
                            {autoPaySubmitting ? "Сохранение…" : "Сохранить настройки"}
                        </button>
                    </form>
                </section>
            )}

            {/* ── Вкладка: История ── */}
            {activeTab === "history" && (
                <section className="exp-panel" key="history">
                    <div className="exp-panel__head">
                        <div className="exp-panel__icon"><Clock size={16}/></div>
                        <h2 className="exp-panel__title">История платежей</h2>
                        {payments.length > 0 && (
                            <span className="exp-panel__count">{payments.length} записей</span>
                        )}
                    </div>

                    {payments.length === 0 ? (
                        <div className="exp-empty">
                            <Clock size={32} strokeWidth={1.2}/>
                            <p>Платежей пока нет</p>
                        </div>
                    ) : (
                        <div className="exp-history">
                            {payments.map(item => (
                                <article key={item.id} className="exp-history-item">
                                    <div className="exp-history-item__left">
                                        <span className="exp-history-item__icon"><BadgeCheck size={16}/></span>
                                        <div>
                                            <h3 className="exp-history-item__title">{item.title}</h3>
                                            <p className="exp-history-item__date">
                                                {item.paidAt
                                                    ? new Date(item.paidAt).toLocaleDateString("ru-RU", {
                                                        day: "numeric", month: "long", year: "numeric",
                                                    })
                                                    : "Дата неизвестна"
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="exp-history-item__right">
                                        <strong className="exp-history-item__amount">{money(item.amount)}</strong>
                                        {item.receiptUrl ? (
                                            <a
                                                href={item.receiptUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="exp-receipt-btn"
                                            >
                                                <ExternalLink size={13}/>
                                                Чек
                                            </a>
                                        ) : (
                                            <span className="exp-muted">Без чека</span>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            )}

        </div>
    );
}
