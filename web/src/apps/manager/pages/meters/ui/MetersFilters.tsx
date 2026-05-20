import type {JSX} from "react";
import {Search, Filter} from "lucide-react";

export default function MetersFilters(): JSX.Element {
    return (
        <div className="meters-filters">
            <button className="btn btn--sm meters-filters__tab--active">Все дома</button>
            <button className="btn btn--sm btn--ghost">Не передали</button>
            <button className="btn btn--sm btn--ghost">Подозр. значения</button>
            <button className="btn btn--sm btn--ghost">Нет ИПУ</button>
            <span className="meters-filters__spacer"/>
            <div className="meters-filters__search">
                <Search size={13} style={{color: "#64748b"}}/>
                <span className="meters-filters__search-placeholder">Дом, квартира, лиц.счёт</span>
            </div>
            <button className="btn btn--sm"><Filter size={12}/>Май 2026</button>
        </div>
    );
}
