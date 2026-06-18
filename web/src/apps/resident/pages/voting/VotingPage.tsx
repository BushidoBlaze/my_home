//plugins
import type {JSX} from "react";
import {Check, CheckCircle, Users, Vote} from "lucide-react";

//hooks
import {useVotingPage} from "./hooks/useVotingPage.ts";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

//ui
import {VStat} from "./ui/VStat.tsx";
import {PollCardR} from "./ui/PollCardR.tsx";
import {ArchiveList} from "./ui/ArchiveList.tsx";
import ResidentTopBar from "@/apps/resident/_shared/ResidentTopBar.tsx";
import "./VotingPage.css";

export default function VotingPage(): JSX.Element {
    useDocumentTitle("Голосования");

    const {
        loading,
        error,
        active,
        closed,
        notVotedCount,
        myVotedCount,
        avgQuorum,
        closedThisYear,
        handleVote,
        reload,
    } = useVotingPage();

    // First row: poll #0 expanded (1.5fr) + poll #1 collapsed (1fr).
    // Subsequent polls render as wide rows below.
    const firstRow = active.slice(0, 2);
    const restRows = active.slice(2);

    return (
        <div className="voting-page">
            <ResidentTopBar
                title="Голосования"
                subtitle="Принимайте коллективные решения вместе с соседями"
                right={notVotedCount > 0 ? (
                    <span className="chip chip--warning voting-page__topbar-chip">
                        <span className="chip__dot"/>
                        {notVotedCount} ждут вашего голоса
                    </span>
                ) : undefined}
            />

            <div className="voting-page__content">

                {/* Stats */}
                <div className="voting-page__stats">
                    <VStat
                        icon={Vote}
                        tone="violet"
                        label="Активных"
                        value={active.length}
                        sub={notVotedCount > 0 ? `${notVotedCount} ждут вашего голоса` : "все ждут"}
                    />
                    <VStat
                        icon={CheckCircle}
                        tone="emerald"
                        label="Вы проголосовали"
                        value={myVotedCount}
                        sub={`из ${active.length} активных`}
                    />
                    <VStat
                        icon={Users}
                        tone="info"
                        label="Кворум сейчас"
                        value={`${avgQuorum}%`}
                        sub={`по ${active.length} голосованиям в среднем`}
                    />
                    <VStat
                        icon={Check}
                        tone="default"
                        label="Завершённых"
                        value={closed.length}
                        sub="за год"
                    />
                </div>

                {loading && (
                    <div className="voting-page__loading">
                        <div className="voting-page__spinner"/>
                        Загружаем голосования…
                    </div>
                )}

                {!loading && error && (
                    <div className="voting-page__empty-state">
                        <Vote size={32} strokeWidth={1.5}/>
                        <p className="voting-page__empty-title">{error}</p>
                        <button type="button" className="btn btn--primary" onClick={reload}>
                            Повторить
                        </button>
                    </div>
                )}

                {!loading && !error && active.length === 0 && (
                    <div className="voting-page__empty-state">
                        <Vote size={32} strokeWidth={1.5}/>
                        <p className="voting-page__empty-title">Нет активных голосований</p>
                        <p className="voting-page__empty-description">
                            Когда УК запустит опрос — он появится здесь и вы получите уведомление.
                        </p>
                    </div>
                )}

                {/* First row: 1.5fr + 1fr grid */}
                {firstRow.length > 0 && (
                    <div className="voting-page__first-row">
                        {firstRow.map((poll, i) => (
                            <PollCardR
                                key={poll.id}
                                poll={poll}
                                expanded={i === 0}
                                onVote={handleVote}
                            />
                        ))}
                    </div>
                )}

                {/* Subsequent polls — wide */}
                {restRows.map(poll => (
                    <PollCardR
                        key={poll.id}
                        poll={poll}
                        wide
                        onVote={handleVote}
                    />
                ))}

                {/* Archive */}
                {!loading && !error && (
                    <ArchiveList polls={closed} totalForYear={closedThisYear}/>
                )}

            </div>
        </div>
    );
}
