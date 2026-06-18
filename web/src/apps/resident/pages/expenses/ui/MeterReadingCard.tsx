import {useState, type JSX} from "react";
import {Bolt, CheckCircle2, Droplet, Flame, X, type LucideIcon} from "lucide-react";
import type {MeterReadingGroup} from "../model/expensesApi.ts";

const ICON_MAP: Record<string, LucideIcon> = {
    drop: Droplet,
    flame: Flame,
    bolt: Bolt,
};

export interface MeterTypeMeta {
    /** Идентификатор типа счётчика, отправляется в API как meterType. */
    meterType: string;
    icon: "drop" | "flame" | "bolt";
    type: string;
    loc: string;
    unit: string;
    color: string;
}

interface Props {
    meta: MeterTypeMeta;
    /** История показаний для этого типа (последние сверху). null если ещё не передавали. */
    group?: MeterReadingGroup;
    submitting?: boolean;
    onSubmit: (newValue: string) => void;
}

function fmtNumber(n: number, fractionDigits = 1): string {
    return n.toLocaleString("ru-RU", {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

function isThisMonth(isoDate: string): boolean {
    const d = new Date(isoDate);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/**
 * Карточка одного счётчика — рендерит реальную историю.
 * Если показание уже передано в текущем месяце — карточка зелёная, кнопки нет.
 * Иначе — приглашает ввести новое значение, показывает предыдущее как подсказку.
 */
export function MeterReadingCard({meta, group, submitting, onSubmit}: Props): JSX.Element {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState("");

    const Icon = ICON_MAP[meta.icon];
    const hasHistory = !!group && group.history.length > 0;
    const prevValue = hasHistory ? group!.lastValue : null;
    const prevDate = hasHistory ? group!.lastReadingDate : null;

    // «Сдано» = есть запись за текущий месяц. Текущее значение = первое в истории
    // (бэк уже отдаёт history отсортированным по дате убыванию).
    const submittedThisMonth = hasHistory && isThisMonth(prevDate!);
    const previousBeforeThisMonth = group && group.history.length > 1
        ? group.history.find(h => !isThisMonth(h.readingDate))
        : undefined;

    const delta = submittedThisMonth && previousBeforeThisMonth
        ? prevValue! - previousBeforeThisMonth.value
        : null;

    const cardStyle = submittedThisMonth
        ? {background: "#f7f9f7", borderColor: "#e3e8e3"}
        : {background: "#fdf6e7", borderColor: "#e2c9a0"};

    const iconBgStyle = {
        background: `${meta.color}24`,
        color: meta.color,
    };

    const handleSave = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setEditing(false);
        setValue("");
    };

    return (
        <div className="expenses-page__meter-card" style={cardStyle}>
            <div className="expenses-page__meter-card-header">
                <div className="expenses-page__meter-card-icon" style={iconBgStyle}>
                    <Icon size={15}/>
                </div>
                <div className="expenses-page__meter-card-titles">
                    <div className="expenses-page__meter-card-type">{meta.type}</div>
                    <div className="expenses-page__meter-card-loc">{meta.loc}</div>
                </div>
                {submittedThisMonth && (
                    <CheckCircle2 size={16} className="expenses-page__meter-card-done"/>
                )}
            </div>

            <div>
                <div
                    className="expenses-page__meter-card-value"
                    style={{color: submittedThisMonth ? "#0e1f17" : "#6a766f"}}
                >
                    {submittedThisMonth && prevValue !== null
                        ? fmtNumber(prevValue, meta.unit === "кВт·ч" ? 0 : 1)
                        : "—"}
                    <span className="expenses-page__meter-card-unit">{meta.unit}</span>
                </div>
                <div className="expenses-page__meter-card-meta">
                    {hasHistory ? (
                        <>
                            пред. <span className="mono">
                                {fmtNumber(previousBeforeThisMonth?.value ?? prevValue!, meta.unit === "кВт·ч" ? 0 : 1)}
                            </span>
                            {delta !== null && (
                                <> · {delta >= 0 ? "+" : ""}{fmtNumber(delta, meta.unit === "кВт·ч" ? 0 : 1)} {meta.unit}</>
                            )}
                            {!submittedThisMonth && <> · ожидание</>}
                        </>
                    ) : (
                        <>первое показание</>
                    )}
                </div>
            </div>

            {!submittedThisMonth && !editing && (
                <button
                    type="button"
                    className="btn btn--primary btn--sm expenses-page__meter-card-button"
                    onClick={() => setEditing(true)}
                >
                    {hasHistory ? "Внести" : "Передать первое значение"}
                </button>
            )}

            {!submittedThisMonth && editing && (
                <div className="expenses-page__meter-card-edit">
                    <input
                        autoFocus
                        type="text"
                        inputMode="decimal"
                        className="expenses-page__meter-card-input"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        placeholder={hasHistory
                            ? `Больше ${fmtNumber(prevValue!, meta.unit === "кВт·ч" ? 0 : 1)} ${meta.unit}`
                            : `Текущее, ${meta.unit}`}
                        onKeyDown={e => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") { setEditing(false); setValue(""); }
                        }}
                    />
                    <div className="expenses-page__meter-card-edit-actions">
                        <button
                            type="button"
                            className="btn btn--primary btn--sm expenses-page__meter-card-button"
                            disabled={!value.trim() || submitting}
                            onClick={handleSave}
                        >
                            {submitting ? "…" : "Отправить"}
                        </button>
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm expenses-page__meter-card-cancel"
                            onClick={() => { setEditing(false); setValue(""); }}
                            aria-label="Отмена"
                        >
                            <X size={13}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
