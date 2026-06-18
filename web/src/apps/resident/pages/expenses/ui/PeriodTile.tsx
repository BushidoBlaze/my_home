import type {JSX} from "react";
import {CreditCard} from "lucide-react";

export type PeriodTileTone = "default" | "emerald" | "danger";

interface PeriodTileProps {
    label:    string;
    value:    string;
    sub?:     string;
    delta?:   string;
    tone?:    PeriodTileTone;
    main?:    boolean;
    ctaLabel?: string;
    onCtaClick?: () => void;
}

const VALUE_COLOR: Record<PeriodTileTone, string> = {
    default: "#0e1f17",
    emerald: "#047857",
    danger:  "#b91c1c",
};

export function PeriodTile({
    label,
    value,
    sub,
    delta,
    tone = "default",
    main,
    ctaLabel,
    onCtaClick,
}: PeriodTileProps): JSX.Element {
    return (
        <div className={`expenses-page__period-tile${main ? " expenses-page__period-tile--main" : ""}`}>
            <div className="expenses-page__period-tile-label">{label}</div>
            <div
                className="tnum expenses-page__period-tile-value"
                style={{
                    fontSize: main ? 36 : 24,
                    color:    VALUE_COLOR[tone],
                }}
            >
                {value}
            </div>
            {sub   && <div className="expenses-page__period-tile-sub">{sub}</div>}
            {delta && (
                <div
                    className="expenses-page__period-tile-delta"
                    style={{color: tone === "danger" ? "#b91c1c" : "#6a766f"}}
                >
                    {delta}
                </div>
            )}
            {ctaLabel && (
                <div className="expenses-page__period-tile-cta">
                    <button
                        type="button"
                        className="btn btn--primary"
                        onClick={onCtaClick}
                    >
                        <CreditCard size={14}/>
                        {ctaLabel}
                    </button>
                </div>
            )}
        </div>
    );
}
