import type {JSX} from "react";
import {Plus} from "lucide-react";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import BuildingsFilters from "./ui/BuildingsFilters.tsx";
import HousesTable from "./ui/HousesTable.tsx";
import HouseDetail from "./ui/HouseDetail.tsx";
import "./Buildings.css";

export default function Buildings(): JSX.Element {
    return (
        <>
            <TopBar
                title="Дома и квартиры"
                subtitle="47 домов · 9 412 квартир · 24 612 жильцов"
                action={
                    <>
                        <button className="btn btn--primary">
                            <Plus size={13}/>
                            Добавить дом
                        </button>
                    </>
                }
            />

            <BuildingsFilters/>

            <div className="bd-layout">
                <HousesTable/>
                <HouseDetail/>
            </div>
        </>
    );
}
