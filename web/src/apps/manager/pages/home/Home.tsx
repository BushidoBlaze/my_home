import type {JSX} from "react";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import {Plus} from "lucide-react";
import StatRow from "./ui/StatRow.tsx";
import PriorityQueue from "./ui/PriorityQueue.tsx";
import CollectionsCard from "./ui/CollectionsCard.tsx";
import TopBuildings from "./ui/TopBuildings.tsx";
import ActivityFeed from "./ui/ActivityFeed.tsx";
import ActiveVotings from "./ui/ActiveVotings.tsx";
import "./Home.css";

export default function Home(): JSX.Element {
    return (
        <>
            <TopBar
                title="Дашборд"
                subtitle="Сводка по 47 домам · понедельник, 18 мая"
                action={
                    <button className="btn btn--primary">
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
                        <TopBuildings/>
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
