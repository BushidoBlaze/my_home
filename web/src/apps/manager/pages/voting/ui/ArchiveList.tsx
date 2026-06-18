import type {JSX} from "react";
import {CheckCircle2, X, ChevronRight} from "lucide-react";
import {toast} from "sonner";
import type {Poll} from "../model/types.ts";

interface ArchiveListProps {
    /** Список закрытых голосований из API. */
    polls: Poll[];
}

/** Считается «принятым» если набран кворум и большинство «За». */
function pollOutcome(poll: Poll): {label: string; tone: "emerald" | "danger"} {
    const quorumReached = poll.quorum >= poll.quorumGoal;
    const forWins = poll.votes.for > poll.votes.against;
    if (quorumReached && forWins) return {label: "Принято", tone: "emerald"};
    return {label: "Не принято", tone: "danger"};
}

export default function ArchiveList({polls}: ArchiveListProps): JSX.Element {
    const openProtocol = (title: string) => {
        toast("Открываю протокол", {description: title});
    };

    return (
        <div className="vote-archive">
            <div className="t-eyebrow vote-archive__title">Архив голосований · {polls.length}</div>
            <div className="card vote-archive__list">
                {polls.map(p => {
                    const outcome = pollOutcome(p);
                    const ResultIcon = outcome.tone === "emerald" ? CheckCircle2 : X;
                    return (
                        <div
                            key={p.id}
                            className="vote-archive__item"
                            onClick={() => openProtocol(p.title)}
                            style={{cursor: "pointer"}}
                        >
                            <ResultIcon
                                size={18}
                                style={{color: outcome.tone === "emerald" ? "#047857" : "#ef4444"}}
                            />
                            <div className="vote-archive__main">
                                <div className="vote-archive__title-text">{p.title}</div>
                                <div className="vote-archive__meta">
                                    {p.createdAt} · кворум {p.quorum}%
                                </div>
                            </div>
                            <span className={"chip chip--" + outcome.tone}>{outcome.label}</span>
                            <ChevronRight size={13} style={{color: "#64748b"}}/>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
