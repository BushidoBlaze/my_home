import type {JSX} from "react";
import {BadgeCheck, Clock, ExternalLink} from "lucide-react";
import type {PaymentHistoryItem} from "../model/types.ts";

function money(value: number): string {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(iso?: string | null): string {
    if (!iso) return "Дата неизвестна";
    return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "long", year: "numeric"});
}

interface HistoryListProps {
    payments: PaymentHistoryItem[];
}

export function HistoryList({payments}: HistoryListProps): JSX.Element {
    return (
        <div className="expenses-page__card">
            <div className="expenses-page__card-header">
                <div>
                    <div className="expenses-page__card-title">История платежей</div>
                    <div className="expenses-page__card-sub">
                        {payments.length} {pluralize(payments.length, ["запись", "записи", "записей"])}
                    </div>
                </div>
            </div>

            {payments.length === 0 ? (
                <div className="expenses-page__empty">
                    <Clock size={32} strokeWidth={1.2}/>
                    <p>Платежей пока нет</p>
                </div>
            ) : (
                <div className="expenses-page__history-list">
                    {payments.map(item => (
                        <article key={item.id} className="expenses-page__history-item">
                            <div className="expenses-page__history-item-icon">
                                <BadgeCheck size={16}/>
                            </div>
                            <div className="expenses-page__history-item-info">
                                <div className="expenses-page__history-item-title">{item.title}</div>
                                <div className="expenses-page__history-item-date">{formatDate(item.paidAt)}</div>
                            </div>
                            <div className="tnum expenses-page__history-item-amount">
                                {money(item.amount)}
                            </div>
                            {item.receiptUrl ? (
                                <a
                                    href={item.receiptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="expenses-page__receipt-link"
                                >
                                    <ExternalLink size={13}/>
                                    Чек
                                </a>
                            ) : (
                                <span className="expenses-page__receipt-empty">Без чека</span>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
}

function pluralize(n: number, forms: [string, string, string]): string {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 14) return forms[2];
    const mod10 = n % 10;
    if (mod10 === 1) return forms[0];
    if (mod10 >= 2 && mod10 <= 4) return forms[1];
    return forms[2];
}
