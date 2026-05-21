import type {JSX} from "react";
import {CheckCircle2, X, ChevronRight} from "lucide-react";
import {toast} from "sonner";
import {ARCHIVED_POLLS} from "../model/data.ts";

interface ArchiveListProps {
    /** В режиме "tab=archive" показываем весь список; иначе — только последние 3 как preview. */
    full?: boolean;
}

export default function ArchiveList({full = false}: ArchiveListProps): JSX.Element {
    const items = full ? ARCHIVED_POLLS : ARCHIVED_POLLS.slice(0, 3);
    const title = full ? "Архив голосований" : "Недавно завершены";

    const openProtocol = (t: string) => {
        toast("Открываю протокол", {description: t});
    };

    return (
        <div className="vote-archive">
            <div className="t-eyebrow vote-archive__title">{title}</div>
            <div className="card vote-archive__list">
                {items.map((p, i) => {
                    const ResultIcon = p.tone === "emerald" ? CheckCircle2 : X;
                    return (
                        <div
                            key={i}
                            className="vote-archive__item"
                            onClick={() => openProtocol(p.title)}
                            style={{cursor: "pointer"}}
                        >
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
