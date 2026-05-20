import type {JSX} from "react";
import {CheckCircle2, X, ChevronRight} from "lucide-react";
import {ARCHIVED_POLLS} from "../model/data.ts";

export default function ArchiveList(): JSX.Element {
    return (
        <div className="vote-archive">
            <div className="t-eyebrow vote-archive__title">Недавно завершены</div>
            <div className="card vote-archive__list">
                {ARCHIVED_POLLS.map((p, i) => {
                    const ResultIcon = p.tone === "emerald" ? CheckCircle2 : X;
                    return (
                        <div key={i} className="vote-archive__item">
                            <ResultIcon
                                size={18}
                                style={{color: p.tone === "emerald" ? "#047857" : "#ef4444"}}
                            />
                            <div className="vote-archive__main">
                                <div className="vote-archive__title-text">{p.title}</div>
                                <div className="vote-archive__meta">{p.date} · кворум {p.q}%</div>
                            </div>
                            <span className={"chip chip--" + p.tone}>{p.result}</span>
                            <ChevronRight size={13} style={{color: "#64748b"}}/>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
