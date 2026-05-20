import {pollsApi, type PollItem} from "@/api/polls.api.ts";
import {useEffect, useState} from "react";
import {
    BarChart2, CalendarDays, CheckCircle2, ChevronDown, ChevronUp,
    Clock, Lock, Users, Vote,
} from "lucide-react";
import "./VotingPage.css";

// ─── Helpers ─────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ru-RU", {
        day: "numeric", month: "long", year: "numeric",
    });
}

function getDaysLeft(iso: string) {
    const diff = new Date(iso).getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days < 0) return "Завершено";
    if (days === 0) return "Последний день";
    return `${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}`;
}


// ─── PollCard ─────────────────────────────────────────────

function PollCard({poll, onVote}: { poll: PollItem; onVote: (pollId: string, optionId: string) => Promise<void> }) {
    const [selected, setSelected] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);
    const [voting, setVoting] = useState(false);

    const status = poll.status.toLowerCase() as "active" | "closed";
    const showResults = poll.hasVoted || status === "closed";
    const total = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
    const daysLeft = getDaysLeft(poll.endsAt);
const winner = poll.options.reduce((a, b) => a.votes > b.votes ? a : b);

    async function handleVote() {
        if (!selected || voting) return;
        setVoting(true);
        try {
            await onVote(poll.id, selected);
        } finally {
            setVoting(false);
        }
    }

    return (
        <article className={`vp-card ${status === "closed" ? "vp-card--closed" : ""}`}>
            <div className="vp-card__head">
                <div className="vp-card__head-left">
                    <span className="vp-card__category">
                        {poll.category}
                    </span>
                    {status === "closed" && (
                        <span className="vp-card__closed-badge"><Lock size={11}/> Завершено</span>
                    )}
                    {poll.hasVoted && status === "active" && (
                        <span className="vp-card__voted-badge"><CheckCircle2 size={11}/> Вы проголосовали</span>
                    )}
                </div>
                <button className="vp-card__toggle" onClick={() => setExpanded(v => !v)}>
                    {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>
            </div>

            <h3 className="vp-card__title">{poll.title}</h3>

            {expanded && (
                <>
                    <p className="vp-card__desc">{poll.description}</p>
                    <div className="vp-card__options">
                        {poll.options.map(opt => {
                            const pct = Math.round((opt.votes / total) * 100);
                            const isMyVote = poll.myOptionId === opt.id;
                            const isWinner = status === "closed" && opt.id === winner.id;

                            if (showResults) {
                                return (
                                    <div key={opt.id} className={`vp-opt vp-opt--result ${isMyVote ? "vp-opt--mine" : ""} ${isWinner ? "vp-opt--winner" : ""}`}>
                                        <div className="vp-opt__label-row">
                                            <span className="vp-opt__text">
                                                {isWinner && <span className="vp-opt__winner-dot"/>}
                                                {opt.text}
                                                {isMyVote && <span className="vp-opt__my-tag">ваш голос</span>}
                                            </span>
                                            <span className="vp-opt__pct">{pct}%</span>
                                        </div>
                                        <div className="vp-opt__bar-wrap">
                                            <div className={`vp-opt__bar ${isMyVote ? "vp-opt__bar--mine" : ""}`} style={{width: `${pct}%`}}/>
                                        </div>
                                        <span className="vp-opt__votes">{opt.votes} голосов</span>
                                    </div>
                                );
                            }

                            return (
                                <button key={opt.id} className={`vp-opt vp-opt--choice ${selected === opt.id ? "vp-opt--selected" : ""}`} onClick={() => setSelected(opt.id)}>
                                    <span className="vp-opt__radio"/>
                                    <span className="vp-opt__text">{opt.text}</span>
                                </button>
                            );
                        })}
                    </div>

                    {!showResults && (
                        <button className="vp-card__vote-btn" disabled={!selected || voting} onClick={handleVote}>
                            <Vote size={16}/> {voting ? "Отправляем..." : "Проголосовать"}
                        </button>
                    )}
                </>
            )}

            <div className="vp-card__footer">
                <span className="vp-card__footer-item"><Users size={13}/> {poll.totalVoters} участников</span>
                <span className="vp-card__footer-item">
                    <CalendarDays size={13}/>
                    {status === "active" ? `до ${formatDate(poll.endsAt)}` : `завершено ${formatDate(poll.endsAt)}`}
                </span>
                {status === "active" && (
                    <span className={`vp-card__days ${daysLeft === "Последний день" ? "vp-card__days--urgent" : ""}`}>
                        <Clock size={12}/> {daysLeft}
                    </span>
                )}
            </div>
        </article>
    );
}

// ─── Main page ────────────────────────────────────────────

type Tab = "active" | "closed";

export default function VotingPage() {
    const [polls, setPolls] = useState<PollItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("active");

    async function loadPolls() {
        try {
            const data = await pollsApi.getPolls();
            setPolls(data);
            setError(null);
        } catch {
            setError("Не удалось загрузить голосования");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { void loadPolls(); }, []);

    async function handleVote(pollId: string, optionId: string) {
        await pollsApi.vote(pollId, optionId);
        await loadPolls();
    }

    const active = polls.filter(p => p.status.toLowerCase() === "active");
    const closed = polls.filter(p => p.status.toLowerCase() === "closed");
    const shown = tab === "active" ? active : closed;
    const notVotedCount = active.filter(p => !p.hasVoted).length;

    if (loading) return (
        <div className="vp">
            <div style={{display: "flex", justifyContent: "center", padding: "80px 0"}}>
                <div style={{width: 36, height: 36, borderRadius: "50%", border: "3px solid #e8f5ee", borderTopColor: "#1f7a5a", animation: "spin 0.8s linear infinite"}}/>
            </div>
        </div>
    );

    if (error) return (
        <div className="vp">
            <div className="vp__empty">
                <div className="vp__empty-icon"><Vote size={32}/></div>
                <p className="vp__empty-title">{error}</p>
                <button onClick={loadPolls} style={{marginTop: 8, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #1f7a5a", background: "transparent", color: "#1f7a5a", cursor: "pointer"}}>Повторить</button>
            </div>
        </div>
    );

    return (
        <div className="vp">
            <header className="vp__header">
                <div className="vp__header-left">
                    <h1 className="vp__title">Голосования</h1>
                    <p className="vp__subtitle">Принимайте коллективные решения без собраний и созвонов</p>
                </div>
                {notVotedCount > 0 && (
                    <div className="vp__pending-badge">
                        <Vote size={14}/>
                        {notVotedCount} ожидают вашего голоса
                    </div>
                )}
            </header>

            <div className="vp__stats">
                <div className="vp__stat">
                    <div className="vp__stat-icon vp__stat-icon--active"><Vote size={18}/></div>
                    <div>
                        <span className="vp__stat-value">{active.length}</span>
                        <span className="vp__stat-label">Активных</span>
                    </div>
                </div>
                <div className="vp__stat">
                    <div className="vp__stat-icon vp__stat-icon--voted"><CheckCircle2 size={18}/></div>
                    <div>
                        <span className="vp__stat-value">{active.filter(p => p.hasVoted).length}</span>
                        <span className="vp__stat-label">Вы проголосовали</span>
                    </div>
                </div>
                <div className="vp__stat">
                    <div className="vp__stat-icon vp__stat-icon--closed"><BarChart2 size={18}/></div>
                    <div>
                        <span className="vp__stat-value">{closed.length}</span>
                        <span className="vp__stat-label">Завершённых</span>
                    </div>
                </div>
            </div>

            <div className="vp__tabs">
                <button className={`vp__tab ${tab === "active" ? "vp__tab--active" : ""}`} onClick={() => setTab("active")}>
                    Активные
                    {active.length > 0 && <span className="vp__tab-badge">{active.length}</span>}
                </button>
                <button className={`vp__tab ${tab === "closed" ? "vp__tab--active" : ""}`} onClick={() => setTab("closed")}>
                    Завершённые
                </button>
            </div>

            {shown.length === 0 ? (
                <div className="vp__empty">
                    <div className="vp__empty-icon"><Vote size={32}/></div>
                    <p className="vp__empty-title">
                        {tab === "active" ? "Нет активных голосований" : "Завершённых голосований нет"}
                    </p>
                    <p className="vp__empty-text">
                        {tab === "active"
                            ? "Когда управляющая компания запустит опрос, он появится здесь"
                            : "История завершённых голосований будет отображаться здесь"
                        }
                    </p>
                </div>
            ) : (
                <div className="vp__list">
                    {shown.map(poll => (
                        <PollCard key={poll.id} poll={poll} onVote={handleVote}/>
                    ))}
                </div>
            )}
        </div>
    );
}
