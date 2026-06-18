import type {JSX} from "react";

interface ApartmentStatProps {
    label: string;
    value: string;
}

// Маленькая ячейка статистики внутри ApartmentBlock: подпись сверху, крупное значение снизу.
// Вынесена отдельно, чтобы избежать копипасты разметки 4 раза.
export function ApartmentStat({label, value}: ApartmentStatProps): JSX.Element {
    return (
        <div className="resident-home__apartment-stat">
            <div className="resident-home__apartment-stat-label">{label}</div>
            {/* tnum — tabular-nums, фиксированная ширина цифр для ровного выравнивания значений */}
            <div className="tnum resident-home__apartment-stat-value">{value}</div>
        </div>
    );
}
