import {useCallback, useEffect, useState, type JSX} from "react";
import {TrendingUp, Send, Vote, Lock, AlertCircle} from "lucide-react";
import {toast} from "sonner";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {pollsApi, type NonVoterItem} from "@/api/polls.api.ts";
import type {Poll} from "../model/types.ts";

interface PollDetailProps {
    poll: Poll | null;
    /** Вызывается когда статус голосования меняется (например, после закрытия). */
    onChanged?: () => void;
}

export default function PollDetail({poll, onChanged}: PollDetailProps): JSX.Element {
    const [nonVoters, setNonVoters] = useState<NonVoterItem[]>([]);
    const [nvLoading, setNvLoading] = useState(false);
    const [nvError, setNvError] = useState<string | null>(null);
    const [remindingAll, setRemindingAll] = useState(false);
    const [remindingOne, setRemindingOne] = useState<string | null>(null);
    const [closing, setClosing] = useState(false);

    const loadNonVoters = useCallback(async (id: string) => {
        setNvLoading(true);
        setNvError(null);
        try {
            const list = await pollsApi.getNonVoters(id);
            setNonVoters(list);
        } catch (e) {
            setNvError(e instanceof Error ? e.message : "Не удалось загрузить список");
            setNonVoters([]);
        } finally {
            setNvLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!poll) {
            setNonVoters([]);
            return;
        }
        void loadNonVoters(poll.id);
    }, [poll, loadNonVoters]);

    if (!poll) {
        return (
            <aside className="vote-detail">
                <div className="vote-detail__empty">
                    <Vote size={32} strokeWidth={1.5}/>
                    <div className="vote-detail__empty-title">Выберите голосование</div>
                    <div className="vote-detail__empty-sub">
                        Кликните на карточку слева, чтобы посмотреть детали и работать с участниками
                    </div>
                </div>
            </aside>
        );
    }

    const votedCount = poll.votes.for + poll.votes.against + poll.votes.abstain;
    const totalCount = poll.votes.total;
    const nonVotersCount = nonVoters.length || (totalCount - votedCount);

    const results = [
        {label: "За", n: poll.votes.for, color: "#10b981"},
        {label: "Против", n: poll.votes.against, color: "#ef4444"},
        {label: "Воздержались", n: poll.votes.abstain, color: "#f59e0b"},
    ];

    const quorumReached = poll.quorum >= poll.quorumGoal;
    const quorumNote = quorumReached
        ? `Цель кворума — ${poll.quorumGoal}%, набран. Голосование состоится.`
        : `Цель кворума — ${poll.quorumGoal}%, не набран. Осталось ${poll.endsIn}.`;

    const remindAll = async () => {
        if (remindingAll) return;
        setRemindingAll(true);
        try {
            const r = await pollsApi.remindAll(poll.id);
            toast.success(`Напоминание отправлено ${r.notified} жильцам`, {description: `«${poll.title}»`});
        } catch (e) {
            toast.error("Не удалось отправить напоминание", {
                description: e instanceof Error ? e.message : undefined,
            });
        } finally {
            setRemindingAll(false);
        }
    };

    const remindOne = async (userId: string, name: string) => {
        if (remindingOne) return;
        setRemindingOne(userId);
        try {
            await pollsApi.remindOne(poll.id, userId);
            toast.success("Напоминание отправлено", {description: name});
        } catch (e) {
            toast.error("Не удалось отправить напоминание", {
                description: e instanceof Error ? e.message : undefined,
            });
        } finally {
            setRemindingOne(null);
        }
    };

    const closePoll = async () => {
        if (!confirm(`Закрыть голосование «${poll.title}»? Жильцы больше не смогут голосовать.`)) return;
        setClosing(true);
        try {
            await pollsApi.closePoll(poll.id);
            toast.success("Голосование закрыто");
            onChanged?.();
        } catch (e) {
            toast.error("Не удалось закрыть", {
                description: e instanceof Error ? e.message : undefined,
            });
        } finally {
            setClosing(false);
        }
    };

    const statusToneClass = "chip chip--" + poll.statusTone;

    return (
        <aside className="vote-detail">
            {/* Header */}
            <div className="vote-detail__section">
                <div className="vote-detail__head">
                    <span className={statusToneClass}><span className="chip__dot"/>{poll.status}</span>
                    {poll.createdAt && (
                        <span className="vote-detail__head-text">
                            · создано {poll.createdAt}{poll.author ? ` · ${poll.author}` : ""}
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
                                    {r.n} <span style={{color: "#64748b", fontWeight: 400}}>
                                        · {votedCount > 0 ? Math.round((r.n / votedCount) * 100) : 0}%
                                    </span>
                                </span>
                            </div>
                            <Progress value={r.n} max={Math.max(votedCount, 1)} color={r.color} h={5}/>
                        </div>
                    ))}
                </div>
            </div>

            {/* Non-voters */}
            <div className="vote-detail__section">
                <div className="vote-detail__voters-head">
                    <div className="t-eyebrow">Не проголосовали · {nonVotersCount}</div>
                    <button
                        className="btn btn--sm"
                        onClick={remindAll}
                        disabled={remindingAll || nonVoters.length === 0}
                    >
                        {remindingAll ? "Отправляем…" : "Напомнить всем"}
                    </button>
                </div>

                {nvLoading && (
                    <div className="vote-detail__nv-state">Загружаем список…</div>
                )}
                {!nvLoading && nvError && (
                    <div className="vote-detail__nv-state vote-detail__nv-state--error">
                        <AlertCircle size={14}/> {nvError}
                    </div>
                )}
                {!nvLoading && !nvError && nonVoters.length === 0 && (
                    <div className="vote-detail__nv-state">Все жильцы уже проголосовали 🎉</div>
                )}

                {!nvLoading && nonVoters.length > 0 && (
                    <div className="vote-detail__voters">
                        {nonVoters.slice(0, 10).map(v => (
                            <div key={v.id} className="vote-detail__voter">
                                <Avatar name={v.fullName} size={26}/>
                                <div className="vote-detail__voter-main">
                                    <div className="vote-detail__voter-name">{v.fullName}</div>
                                    <div className="vote-detail__voter-meta">
                                        {v.apartmentNumber ? `кв. ${v.apartmentNumber}` : "адрес не указан"}
                                        {v.lastSeen && v.lastSeen !== "—" ? ` · ${v.lastSeen}` : ""}
                                    </div>
                                </div>
                                <button
                                    className="btn btn--icon btn--sm btn--ghost"
                                    onClick={() => remindOne(v.id, v.fullName)}
                                    disabled={remindingOne === v.id}
                                    title={`Напомнить ${v.fullName}`}
                                >
                                    <Send size={12}/>
                                </button>
                            </div>
                        ))}
                        {nonVoters.length > 10 && (
                            <div className="vote-detail__nv-more">
                                и ещё {nonVoters.length - 10} жильцов
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Danger zone */}
            <div className="vote-detail__section-last">
                <button
                    className="btn btn--sm vote-detail__close-btn"
                    onClick={closePoll}
                    disabled={closing}
                >
                    <Lock size={12}/> {closing ? "Закрываем…" : "Закрыть голосование"}
                </button>
            </div>
        </aside>
    );
}
