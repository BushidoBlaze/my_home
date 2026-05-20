import type {JSX} from "react";
import {Search, Filter, List, LayoutGrid, Map} from "lucide-react";

export default function BuildingsFilters(): JSX.Element {
    return (
        <div className="bd-filters">
            <div className="bd-filters__search">
                <Search size={13} style={{color: "#64748b"}}/>
                <span className="bd-filters__search-placeholder">Поиск адреса, ЖК, серии…</span>
            </div>
            <button className="btn btn--sm"><Filter size={12}/>Район · все</button>
            <button className="btn btn--sm">Серия · все</button>
            <button className="btn btn--sm">Год сдачи</button>
            <button className="btn btn--sm">Тариф</button>
            <span className="bd-filters__spacer"/>
            <div className="bd-filters__views">
                <button className="btn btn--sm" style={{background: "#f1f5f9"}}>
                    <List size={13}/>
                </button>
                <button className="btn btn--sm btn--ghost">
                    <LayoutGrid size={13}/>
                </button>
                <button className="btn btn--sm btn--ghost">
                    <Map size={13}/>
                </button>
            </div>
        </div>
    );
}
