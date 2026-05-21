import type {JSX} from "react";
import {TrendingUp, Send, Vote} from "lucide-react";
import {toast} from "sonner";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import type {Poll, VoterEntry} from "../model/types.ts";
import {NON_VOTERS} from "../model/data.ts";

interface PollDetailProps {
    poll: Poll | null;
    /** Список не голосовавших; пока берём из общего демо. */
    nonVoters?: VoterEntry[];
}

export default function PollDetail({poll, nonVoters = NON_VOTERS}: PollDetailProps): JSX.Element {
    if (!poll) {
        return (
            <aside className="vote-detail">
                <div className="vote-detail__empty">
                    <Vote size={32} strokeWidth={1.5}/>
                    <div className="vote-detail__empty-title">Выберите голосование</div>
                    <div className="vote-detail__empty-sub">Кликните на карточку слева, чтобы посмотреть детали и работать с участниками</div>
                </div>
            </aside>
        );
    }

    const votedCount = poll.votes.for + poll.votes.against + poll.votes.abstain;
    const totalCount = poll.votes.total;
    const nonVotersCount = totalCount - votedCount;

    const results = [
        {label: "За", n: poll.votes.for, color: "#10b981"},
        {label: "Против", n: poll.votes.against, color: "#ef4444"},
        {label: "Воздержались", n: poll.votes.abstain, color: "#f59e0b"},
    ];

    const statusToneClass = "chip chip--" + poll.statusTone;
    const quorumReached = poll.quorum >= poll.quorumGoal;
    const quorumNote = quorumReached
        ? `Цель кворума — ${poll.quorumGoal}%, набран. Голосование состоится.`
        : `Цель кворума — ${poll.quorumGoal}%, не набран. Осталось ${poll.endsIn}.`;

    const remindAll = () => {
        toast.success(`Напоминание отправлено ${nonVotersCount} жильцам`, {
            description: `«${poll.title}»`,
        });
    };

    const remindOne = (name: string) => {
        toast.success("Напоминание отправлено", {description: name});
    };

    return (
        <aside className="vote-detail">
            {/* Header */}
            <div className="vote-detail__section">
                <div className="vote-detail__head">
                    <span className={statusToneClass}><span className="chip__dot"/>{poll.status}</span>
                    {poll.createdAt && poll.author && (
                        <span className="vote-detail__head-text">
                            · создано {poll.createdAt} · {poll.author}
                        </span>
                    )}
                </div>
                <div className="vote-detail__title">{poll.title}</div>
                {poll.description && (
                    <div className="vote-detail__description">{poll.description}</div>
                )}

                <div className="vote-detail__metas">
                    <div className="vote-detail__meta-card">
                        <div className="vote-detail__meta-label">ТИП</div>
                        <div className="vote-detail__meta-value">{poll.type}</div>
                    </div>
                    <div className="vote-detail__meta-card">
                        <div className="vote-detail__meta-label">ДОМ</div>
                        <div className="vote-detail__meta-value">{poll.house}</div>
                    </div>
                    {poll.openedAt && (
                        <div className="vote-detail__meta-card">
                            <div className="vote-detail__meta-label">ОТКРЫТО</div>
                            <div className="vote-detail__meta-value">{poll.openedAt}</div>
                        </div>
                    )}
                    {poll.endsAt && (
                        <div className="vote-detail__meta-card">
                            <div className="vote-detail__meta-label">ДО</div>
                            <div className="vote-detail__meta-value">{poll.endsAt}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Live quorum */}
            <div className="vote-detail__section">
                <div className="vote-detail__live-head">
                    <div className="t-eyebrow">Кворум · в реальном времени</div>
                    <span className="vote-detail__online">● онлайн</span>
                </div>
                <div className="vote-detail__quorum-row">
                    <span className="tnum vote-detail__quorum-value">{poll.quorum}%</span>
                    <span className="tnum vote-detail__quorum-meta">
                        {votedCount} / {totalCount}
                    </span>
                    {quorumReached && (
                        <span className="chip chip--emerald vote-detail__delta-chip">
                            <TrendingUp size={11}/>{poll.quorumGoal}% набран
                        </span>
                    )}
                </div>
                <div style={{marginTop: 10}}>
                    <Progress
                        value={poll.quorum}
                        color={quorumReached ? "#10b981" : poll.statusTone === "danger" ? "#ef4444" : "#f59e0b"}
                        h={8}
                    />
                </div>
                <div className="vote-detail__quorum-note">{quorumNote}</div>
            </div>

            {/* Results */}
            <div className="vote-detail__section">
                <div className="t-eyebrow" style={{marginBottom: 10}}>Результаты</div>
                <div className="vote-detail__results">
                    {results.map((r, i) => (
                        <div key={i}>
                            <div className="vote-detail__result-row">
                                <span className="vote-detail__result-label">{r.label}</span>
                                <span className="tnum vote-detail__result-count">
                                    {r.n} <span style={{color: "#64748b", fontWeight: 400}}>· {votedCount > 0 ? Math.round((r.n / votedCount) * 100) : 0}%</span>
                                </span>
                            </div>
                            <Progress value={r.n} max={Math.max(votedCount, 1)} color={r.color} h={5}/>
                        </div>
                    ))}
                </div>
            </div>

            {/* Non-voters */}
            <div className="vote-detail__section-last">
                <div className="vote-detail__voters-head">
                    <div className="t-eyebrow">Не проголосовали · {nonVotersCount}</div>
                    <button className="btn btn--sm" onClick={remindAll}>Напомнить всем</button>
                </div>
                <div className="vote-detail__voters">
                    {nonVoters.map((v, i) => (
                        <div key={i} className="vote-detail__voter">
                            <Avatar name={v.name} size={26}/>
                            <div className="vote-detail__voter-main">
                                <div className="vote-detail__voter-name">{v.name}</div>
                                <div className="vote-detail__voter-meta">{v.apt} · {v.last}</div>
                            </div>
                            <button
                                className="btn btn--icon btn--sm btn--ghost"
                                onClick={() => remindOne(v.name)}
                                title={`Напомнить ${v.name}`}
                            >
                                <Send size={12}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
