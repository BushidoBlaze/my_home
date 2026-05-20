import type {JSX} from "react";
import {Upload, Sparkles} from "lucide-react";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import PeriodSwitcher from "./ui/PeriodSwitcher.tsx";
import BigStat from "./ui/BigStat.tsx";
import ChargesCard from "./ui/ChargesCard.tsx";
import StructureCard from "./ui/StructureCard.tsx";
import HousesTable from "./ui/HousesTable.tsx";
import TopDebtors from "./ui/TopDebtors.tsx";
import RecentPayments from "./ui/RecentPayments.tsx";
import {BIG_STATS} from "./model/data.ts";
import "./Billing.css";

export default function Billing(): JSX.Element {
    return (
        <>
            <TopBar
                title="Начисления и платежи"
                subtitle="Май 2026 · в работе"
                action={
                    <>
                        <button className="btn"><Upload size={13}/>
                            Платежи банка
                        </button>
                        <button className="btn btn--primary">
                            <Sparkles size={13}/>
                            Сформировать начисления
                        </button>
                    </>
                }
            />

            <div className="billing">
                <PeriodSwitcher/>

                <div className="billing-stats">
                    {BIG_STATS.map((s, i) => <BigStat key={i} stat={s}/>)}
                </div>

                <div className="billing-mid">
                    <ChargesCard/>
                    <StructureCard/>
                </div>

                <HousesTable/>

                <div className="billing-bottom">
                    <TopDebtors/>
                    <RecentPayments/>
                </div>
            </div>
        </>
    );
}
