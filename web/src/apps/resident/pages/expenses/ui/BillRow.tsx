import type {JSX} from "react";
import {CreditCard} from "lucide-react";
import type {UtilityBill} from "../model/types.ts";

export type BillTagTone = "warning" | "info" | "violet" | "emerald" | "danger" | "default";

const TAG_TONE_FOR_CATEGORY: Record<string, BillTagTone> = {
    "Содержание": "warning",
    "Содержание жилья": "warning",
    "Отопление": "info",
    "Связь": "violet",
    "Электроэнергия": "warning",
    "Водоснабжение": "info",
    "Холодная и горячая вода": "info",
};

function getTagTone(category: string): BillTagTone {
    return TAG_TONE_FOR_CATEGORY[category] ?? "default";
}

function money(value: number): string {
    return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDueDate(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {day: "2-digit", month: "2-digit", year: "numeric"});
}

interface BillRowProps {
    bill: UtilityBill;
    unpaid?: boolean;
    paying?: boolean;
    onPay?: () => void;
}

export function BillRow({bill, unpaid, paying, onPay}: BillRowProps): JSX.Element {
    const tone = getTagTone(bill.category);
    const sub = unpaid
        ? `${bill.periodLabel} · срок ${formatDueDate(bill.dueDate)}`
        : bill.periodLabel;

    return (
        <div className={`expenses-page__bill-row${unpaid ? " expenses-page__bill-row--unpaid" : ""}`}>

            <div className="expenses-page__bill-row-info">
                <span className={`chip chip--${tone} expenses-page__bill-row-chip`}>
                    {bill.category}
                </span>
                <div className="expenses-page__bill-row-title">{bill.title}</div>
                <div className="expenses-page__bill-row-sub">{sub}</div>
            </div>

            <div className="tnum expenses-page__bill-row-amount">{money(bill.amount)}</div>

            {unpaid ? (
                <button
                    type="button"
                    className="btn btn--primary expenses-page__bill-row-button"
                    onClick={onPay}
                    disabled={paying}
                >
                    <CreditCard size={14}/>
                    {paying ? "Оплата…" : "Оплатить"}
                </button>
            ) : (
                <span className="chip chip--emerald expenses-page__bill-row-status">
                    <span className="chip__dot"/>
                    Оплачено
                </span>
            )}
        </div>
    );
}
