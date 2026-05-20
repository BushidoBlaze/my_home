import type {JSX} from "react";
import {Upload, Plus} from "lucide-react";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import MetersHero from "./ui/MetersHero.tsx";
import MetersFilters from "./ui/MetersFilters.tsx";
import MetersTable from "./ui/MetersTable.tsx";
import ApartmentGrid from "./ui/ApartmentGrid.tsx";
import RecentSubmissions from "./ui/RecentSubmissions.tsx";
import "./Meters.css";

export default function Meters(): JSX.Element {
    return (
        <>
            <TopBar
                title="Показания счётчиков"
                subtitle="Период: 1–25 мая · сбор показаний"
                action={
                    <>
                        <button className="btn">
                            <Upload size={13}/>
                            Загрузить отчёт в Excel
                        </button>
                    </>
                }
            />

            <div className="meters">
                <MetersHero/>
                <MetersFilters/>
                <MetersTable/>

                <div className="meters-bottom">
                    <div className="card meters-apts">
                        <div className="meters-apts__head-row">
                            <div>
                                <div className="t-h3">Берёзовая, 14 · квартиры</div>
                                <div className="meters-apts__sub">Подъезд 4 · 12-й этаж · по статусу передачи</div>
                            </div>
                            <div className="meters-apts__actions">
                                <button className="btn btn--sm">Напомнить всем</button>
                                <button className="btn btn--sm btn--primary">
                                    <Plus size={12}/>Внести вручную
                                </button>
                            </div>
                        </div>
                        <ApartmentGrid/>
                    </div>

                    <RecentSubmissions/>
                </div>
            </div>
        </>
    );
}
