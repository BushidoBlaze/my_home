import type {JSX} from "react";
import {useNavigate} from "react-router-dom";
import {Plus} from "lucide-react";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {managerDashboardApi} from "@/api/managerDashboard.api.ts";
import {useDashboardData} from "../hooks/useDashboardData.ts";
import {adaptActiveVotes} from "../model/adapters.ts";
import {DataError, DataLoading} from "./DataState.tsx";

export default function ActiveVotings(): JSX.Element {
    const navigate = useNavigate();
    const {data: votes, loading, error, retry} = useDashboardData(
        () => managerDashboardApi.getActiveVotes(5),
        adaptActiveVotes,
    );

    return (
        <div className="card home-votes">
            <div className="home-votes__head">
                <div>
                    <div className="t-h3">Активные голосования</div>
                    <div className="home-section-sub">
                        {loading ? "загрузка…" : votes ? `${votes.length} идут` : "—"}
                    </div>
                </div>
                <button
                    className="btn btn--sm"
                    onClick={() => navigate("/manager/vote")}
                >
                    <Plus size={12}/> Создать
                </button>
            </div>

            {loading && <DataLoading compact label="Загрузка голосований…"/>}
            {!loading && (error || !votes) && (
                <DataError compact title="Голосования недоступны" onRetry={retry}/>
            )}
            {!loading && !error && votes && (
                <div className="home-votes__list">
                    {votes.map((vote, i) => (
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
            )}
        </div>
    );
}
