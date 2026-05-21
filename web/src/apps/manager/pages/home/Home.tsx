import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import {Plus} from "lucide-react";
import StatRow from "./ui/StatRow.tsx";
import PriorityQueue from "./ui/PriorityQueue.tsx";
import CollectionsCard from "./ui/CollectionsCard.tsx";
import ComplianceCard from "./ui/ComplianceCard.tsx";
import ActivityFeed from "./ui/ActivityFeed.tsx";
import ActiveVotings from "./ui/ActiveVotings.tsx";
import "./Home.css";

const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatToday(d: Date = new Date()): string {
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function Home(): JSX.Element {
    const navigate = useNavigate();

    return (
        <>
            <TopBar
                title="Дашборд"
                subtitle={`Сводка по 47 домам · ${formatToday()}`}
                action={
                    <button
                        className="btn btn--primary"
                        onClick={() => navigate("/manager/tickets")}
                    >
                        <Plus size={14}/> Новая заявка
                    </button>
                }
            />

            <div className="home">
                <StatRow/>

                <div className="home__mid">
                    <PriorityQueue/>
                    <div className="home__mid-right">
                        <CollectionsCard/>
                        <ComplianceCard/>
                    </div>
                </div>

                <div className="home__bottom">
                    <ActivityFeed/>
                    <ActiveVotings/>
                </div>
            </div>
        </>
    );
}
