import type {JSX} from "react";
import {Plus} from "lucide-react";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {ACTIVE_VOTES} from "../model/data.ts";

export default function ActiveVotings(): JSX.Element {
    return (
        <div className="card home-votes">
            <div className="home-votes__head">
                <div>
                    <div className="t-h3">Активные голосования</div>
                    <div className="home-section-sub">3 идут, 1 ждёт публикации</div>
                </div>
                <button className="btn btn--sm">
                    <Plus size={12}/> Создать
                </button>
            </div>

            <div className="home-votes__list">
                {ACTIVE_VOTES.map((vote, i) => (
                    <div key={i}>
                        <div className="home-votes__row">
                            <span className="home-votes__title">{vote.title}</span>
                            <span className="tnum home-votes__count">{vote.votes}</span>
                        </div>
                        <div className="home-votes__bar">
                            <div className="home-votes__bar-track">
                                <Progress value={vote.quorum} max={100} color={vote.tone} h={5}/>
                            </div>
                            <span className="tnum home-votes__quorum">кворум {vote.quorum}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
