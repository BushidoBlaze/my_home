import type {JSX} from "react";
import {Download, Plus} from "lucide-react";
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import VotingTabs from "./ui/VotingTabs.tsx";
import PollCard from "./ui/PollCard.tsx";
import ArchiveList from "./ui/ArchiveList.tsx";
import PollDetail from "./ui/PollDetail.tsx";
import {POLLS} from "./model/data.ts";
import "./Voting.css";

export default function Voting(): JSX.Element {
    return (
        <>
            <TopBar
                title="Голосования"
                subtitle="3 активных · 1 черновик · 12 в архиве"
                action={
                    <>
                        <button className="btn"><Download size={13}/>Протоколы</button>
                        <button className="btn btn--primary">
                            <Plus size={13}/>Создать голосование
                        </button>
                    </>
                }
            />

            <div className="vote-layout">
                <div className="vote-list">
                    <VotingTabs/>

                    <div className="vote-cards">
                        {POLLS.map(p => <PollCard key={p.id} poll={p}/>)}
                    </div>

                    <ArchiveList/>
                </div>

                <PollDetail/>
            </div>
        </>
    );
}
