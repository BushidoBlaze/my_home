import type {JSX} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

const MONTHS = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

interface Props {
    year: number;
    month: number; // 1-12
    onPrev: () => void;
    onNext: () => void;
}

export default function PeriodSwitcher({year, month, onPrev, onNext}: Props): JSX.Element {
    return (
        <div className="billing-period">
            <button className="btn btn--icon btn--sm btn--ghost" onClick={onPrev} title="Предыдущий месяц">
                <ChevronLeft size={13}/>
            </button>
            <span className="billing-period__label">{MONTHS[month - 1]} {year}</span>
            <button className="btn btn--icon btn--sm btn--ghost" onClick={onNext} title="Следующий месяц">
                <ChevronRight size={13}/>
            </button>
            <span className="chip chip--info billing-period__status">
                <span className="chip__dot"/>период открыт
            </span>
        </div>
    );
}
