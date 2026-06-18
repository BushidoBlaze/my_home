//plugins
import {useEffect, useState, type JSX} from "react";
import {useNavigate} from "react-router-dom";

//api
import {managerBuildingsApi} from "@/api/managerBuildings.api.ts";

//hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

//ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import StatRow from "./ui/StatRow.tsx";
import PriorityQueue from "./ui/PriorityQueue.tsx";
import CollectionsCard from "./ui/CollectionsCard.tsx";
import ComplianceCard from "./ui/ComplianceCard.tsx";
import ActivityFeed from "./ui/ActivityFeed.tsx";
import ActiveVotings from "./ui/ActiveVotings.tsx";

//styles
import "./Home.css";

const WEEKDAYS = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
const MONTHS = [
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

function formatToday(d: Date = new Date()): string {
    return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// Дательный падеж: «по 1 дому», «по 2/5 домам».
function housesDative(n: number): string {
    return n % 10 === 1 && n % 100 !== 11 ? "дому" : "домам";
}

export default function Home(): JSX.Element {
    useDocumentTitle('Домашняя страница УК');
    const navigate = useNavigate();

    // Реальное число домов в реестре — для подзаголовка «Сводка по N домам».
    const [houseCount, setHouseCount] = useState<number | null>(null);
    useEffect(() => {
        managerBuildingsApi.list()
            .then(list => setHouseCount(list.length))
            .catch(() => {});
    }, []);

    const today = formatToday();
    const subtitle = houseCount === null
        ? `Сводка · ${today}`
        : houseCount === 0
            ? `Дома ещё не добавлены · ${today}`
            : `Сводка по ${houseCount} ${housesDative(houseCount)} · ${today}`;

    return (
        <>
            <TopBar
                title="Дашборд"
                subtitle={subtitle}
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
