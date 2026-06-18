import type {JSX} from "react";
import type {ExpensesChartPoint} from "../model/expensesApi.ts";

interface Props {
    data: ExpensesChartPoint[];
}

// Двойной столбчатый график «начислено / оплачено» по месяцам.
// Текущий месяц подсвечивается зелёным; столбец «оплачено» накладывается
// поверх «начислено» более насыщенным цветом.
export function MonthlyChart({data}: Props): JSX.Element {
    if (data.length === 0) {
        return (
            <div style={{padding: 24, textAlign: "center", color: "#6a766f", fontSize: 13}}>
                Данных за период пока нет.
            </div>
        );
    }

    const max = Math.max(1, ...data.map(d => Math.max(d.charged, d.paid)));
    const w = 720;
    const h = 220;
    const gap = 8;
    const bw = (w - gap * (data.length - 1)) / data.length;
    const currentMonth = new Date().toISOString().slice(0, 7);

    return (
        <svg
            width="100%"
            height={h + 30}
            viewBox={`0 0 ${w} ${h + 30}`}
            preserveAspectRatio="none"
            className="expenses-page__monthly-chart-svg"
        >
            {[0.25, 0.5, 0.75].map(p => (
                <line
                    key={p}
                    x1={0}
                    y1={h * (1 - p)}
                    x2={w}
                    y2={h * (1 - p)}
                    stroke="#edf0ec"
                    strokeDasharray="3 4"
                />
            ))}

            {data.map((d, i) => {
                const x = i * (bw + gap);
                const isCurrent = d.month === currentMonth;
                const chargedH = (d.charged / max) * h;
                const paidH = (d.paid / max) * h;

                return (
                    <g key={d.month} opacity={isCurrent ? 0.85 : 1}>
                        {/* «Начислено» — серо-голубой основной столбец */}
                        <rect
                            x={x}
                            y={h - chargedH}
                            width={bw}
                            height={chargedH}
                            fill={isCurrent ? "#10b981" : "#1d4ed8"}
                            opacity={0.25}
                            rx={2}
                        />
                        {/* «Оплачено» — наложен поверх */}
                        <rect
                            x={x}
                            y={h - paidH}
                            width={bw}
                            height={paidH}
                            fill={isCurrent ? "#10b981" : "#1d4ed8"}
                            rx={2}
                        />
                        <text
                            x={x + bw / 2}
                            y={h + 16}
                            textAnchor="middle"
                            style={{
                                font: `${isCurrent ? "700" : "500"} 11px "Onest", "Inter", sans-serif`,
                                fill: isCurrent ? "#059669" : "#6a766f",
                            }}
                        >
                            {d.label}
                        </text>
                        {d.charged > 0 && (
                            <text
                                x={x + bw / 2}
                                y={h - chargedH - 6}
                                textAnchor="middle"
                                style={{
                                    font: `600 10px "Onest", "Inter", sans-serif`,
                                    fill: "#6a766f",
                                }}
                            >
                                {Math.round(d.charged / 1000)}к
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
