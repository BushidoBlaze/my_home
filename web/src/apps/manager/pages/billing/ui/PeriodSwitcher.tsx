import type {JSX} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

export default function PeriodSwitcher(): JSX.Element {
    return (
        <div className="billing-period">
            <button className="btn btn--icon btn--sm btn--ghost">
                <ChevronLeft size={13}/>
            </button>
            <span className="billing-period__label">Май 2026</span>
            <button className="btn btn--icon btn--sm btn--ghost">
                <ChevronRight size={13}/>
            </button>
            <span className="chip chip--info billing-period__status">
                <span className="chip__dot"/>период открыт
            </span>
            <span className="billing-period__deadline">Закрытие периода: 5 июня</span>
        </div>
    );
}
