import type {JSX} from "react";
import {Download, FileText} from "lucide-react";
import type {PaymentHistoryItem} from "../model/types.ts";

function formatDate(iso?: string | null): string {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "long", year: "numeric"});
}

interface ReceiptsListProps {
    payments: PaymentHistoryItem[];
}

export function ReceiptsList({payments}: ReceiptsListProps): JSX.Element {
    const withReceipts = payments.filter(p => Boolean(p.receiptUrl));

    return (
        <div className="expenses-page__card">
            <div className="expenses-page__card-header">
                <div>
                    <div className="expenses-page__card-title">Квитанции</div>
                    <div className="expenses-page__card-sub">
                        Загрузите квитанции для налогового вычета или личных архивов
                    </div>
                </div>
            </div>

            {withReceipts.length === 0 ? (
                <div className="expenses-page__empty">
                    <FileText size={32} strokeWidth={1.2}/>
                    <p>Квитанций пока нет</p>
                </div>
            ) : (
                <div className="expenses-page__receipts-grid">
                    {withReceipts.map(item => (
                        <a
                            key={item.id}
                            href={item.receiptUrl!}
                            target="_blank"
                            rel="noreferrer"
                            download
                            className="expenses-page__receipt-card"
                        >
                            <div className="expenses-page__receipt-card-icon">
                                <FileText size={20}/>
                            </div>
                            <div className="expenses-page__receipt-card-info">
                                <div className="expenses-page__receipt-card-title">{item.title}</div>
                                <div className="expenses-page__receipt-card-date">{formatDate(item.paidAt)}</div>
                            </div>
                            <Download size={16} className="expenses-page__receipt-card-download"/>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
