import {useState, type JSX} from "react";
import {Check, CheckCircle2, Vote, X} from "lucide-react";
import type {PollItem, PollOptionItem} from "@/api/polls.api.ts";
import {GRADIENTS, type PollTone, type VoteChoice} from "../model/types.ts";

const CATEGORY_LABEL: Record<string, string> = {
    improvement: "Благоустройство",
    tariff:      "Тариф",
    repair:      "Ремонт",
    security:    "Безопасность",
    general:     "Общее собрание",
    council:     "Совет дома",
};

const STATUS_TEXT: Record<PollTone, string> = {
    emerald: "Идёт",
    warning: "Идёт",
    danger:  "Не наберёт кворум",
};

function formatEndsAt(iso: string): string {
    return `до ${new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"})}`;
}

function getEndsIn(iso: string): string {
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return "завершено";
    const days = Math.ceil(ms / 86_400_000);
    if (days === 1) return "1 день";
    if (days < 5)  return `${days} дня`;
    return `${days} дней`;
}

// Maps a poll option's text to a vote choice (for/against/abstain).
function classifyOption(opt: PollOptionItem): VoteChoice | null {
    const t = opt.text.toLowerCase();
    if (t.includes("против")) return "against";
    if (t.includes("воздерж")) return "abstain";
    if (t.includes("за"))     return "for";
    return null;
}

// Locates the option for a given choice. Falls back to null for non-standard polls.
function findOption(options: PollOptionItem[], choice: VoteChoice): PollOptionItem | null {
    return options.find(o => classifyOption(o) === choice) ?? null;
}

// Picks a card tone based on quorum progress.
function pickTone(quorum: number, quorumGoal = 50): PollTone {
    if (quorum >= quorumGoal)        return "emerald";
    if (quorum >= quorumGoal * 0.5)  return "warning";
    return "danger";
}

const CHOICE_LABEL: Record<VoteChoice, string> = {
    for:     "За",
    against: "Против",
    abstain: "Воздерж.",
};

const CHOICE_COLOR: Record<VoteChoice, string> = {
    for:     "#047857", // emerald-700
    against: "#b91c1c", // danger
    abstain: "#b45309", // warning
};

interface PollCardRProps {
    poll:      PollItem;
    expanded?: boolean;
    wide?:     boolean;
    onVote:    (pollId: string, optionId: string) => Promise<void>;
}

export function PollCardR({poll, expanded, wide, onVote}: PollCardRProps): JSX.Element {
    const [voting, setVoting] = useState(false);

    const quorumGoal = 50;
    const quorum     = poll.totalEligible > 0
        ? Math.round((poll.totalVoters / poll.totalEligible) * 100)
        : 0;
    const tone       = pickTone(quorum, quorumGoal);
    const gradient   = GRADIENTS[tone];

    const forOpt     = findOption(poll.options, "for");
    const againstOpt = findOption(poll.options, "against");
    const abstainOpt = findOption(poll.options, "abstain");

    const votes = {
        for:     forOpt?.votes ?? 0,
        against: againstOpt?.votes ?? 0,
        abstain: abstainOpt?.votes ?? 0,
        total:   poll.totalEligible || 1,
    };
    const sumOf = votes.for + votes.against || 1;
    const supportPct = Math.round((votes.for / sumOf) * 100);

    const myChoice: VoteChoice | null = poll.myOptionId
        ? classifyOption(poll.options.find(o => o.id === poll.myOptionId)!) ?? null
        : null;

    const category = CATEGORY_LABEL[poll.category] ?? "Опрос";
    const endsAt   = formatEndsAt(poll.endsAt);
    const endsIn   = getEndsIn(poll.endsAt);
    const status   = STATUS_TEXT[tone];

    const handleVote = async (optionId: string) => {
        if (voting) return;
        setVoting(true);
        try { await onVote(poll.id, optionId); }
        finally { setVoting(false); }
    };

    const coverClassName =
        "poll-card-r__cover" +
        (expanded ? " poll-card-r__cover--expanded" : "");

    const cardClassName =
        "poll-card-r" +
        (wide ? " poll-card-r--wide" : "");

    return (
        <article className={cardClassName}>

            {/* Cover with gradient + decorative circles */}
            <div
                className={coverClassName}
                style={{background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`}}
            >
                <svg
                    className="poll-card-r__cover-shape"
                    width="200"
                    height="200"
                    viewBox="0 0 100 100"
                    fill="none"
                >
                    <circle cx="50" cy="50" r="30" stroke="white" strokeWidth=".7"/>
                    <circle cx="50" cy="50" r="42" stroke="white" strokeWidth=".5"/>
                    <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="1.2"/>
                </svg>

                <div className="poll-card-r__cover-meta">
                    <Vote size={22}/>
                    <span className="poll-card-r__cover-type">{category}</span>
                    <span className="poll-card-r__cover-dot"/>
                    {poll.authorName && (
                        <span className="poll-card-r__cover-creator">{poll.authorName}</span>
                    )}
                    <span className="poll-card-r__cover-ends-at">{endsAt}</span>
                </div>

                {expanded && (
                    <div className="poll-card-r__cover-title">{poll.title}</div>
                )}
            </div>

            {/* Body */}
            <div className="poll-card-r__body">

                {!expanded && (
                    <h3 className="poll-card-r__title">{poll.title}</h3>
                )}

                <div className="poll-card-r__status-row">
                    <span className={`chip chip--${tone} poll-card-r__status-chip`}>
                        <span className="chip__dot"/>
                        {status}
                    </span>
                    <span className="poll-card-r__ends-in">
                        Закроется через <b>{endsIn}</b>
                    </span>
                    {myChoice && (
                        <span className="poll-card-r__my-vote">
                            Ваш голос:{" "}
                            <b style={{color: CHOICE_COLOR[myChoice]}}>
                                {CHOICE_LABEL[myChoice]}
                            </b>
                        </span>
                    )}
                </div>

                {poll.description && (
                    <p className="poll-card-r__description">{poll.description}</p>
                )}

                {/* Quorum + votes block */}
                <div className="poll-card-r__quorum-block">

                    <div className="poll-card-r__quorum-header">
                        <span className="poll-card-r__quorum-label">Кворум</span>
                        <span className="tnum poll-card-r__quorum-value">
                            {quorum}%{" "}
                            <span className="poll-card-r__quorum-goal">· цель {quorumGoal}%</span>
                        </span>
                    </div>

                    <div className="poll-card-r__quorum-bar">
                        <div
                            className="poll-card-r__quorum-bar-fill"
                            style={{
                                width:      `${Math.min(quorum, 100)}%`,
                                background: gradient.from,
                            }}
                        />
                        <div
                            className="poll-card-r__quorum-bar-tick"
                            style={{left: `${quorumGoal}%`}}
                        />
                    </div>

                    {/* 3-segment vote distribution bar */}
                    <div className="poll-card-r__vote-bar">
                        <div
                            className="poll-card-r__vote-bar-segment"
                            style={{
                                width:      `${(votes.for / votes.total) * 100}%`,
                                background: "#10b981",
                            }}
                            title={`За — ${votes.for}`}
                        />
                        <div
                            className="poll-card-r__vote-bar-segment"
                            style={{
                                width:      `${(votes.against / votes.total) * 100}%`,
                                background: "#b91c1c",
                            }}
                            title={`Против — ${votes.against}`}
                        />
                        <div
                            className="poll-card-r__vote-bar-segment"
                            style={{
                                width:      `${(votes.abstain / votes.total) * 100}%`,
                                background: "#b45309",
                            }}
                            title={`Воздержались — ${votes.abstain}`}
                        />
                    </div>

                    <div className="poll-card-r__vote-legend">
                        <span className="poll-card-r__vote-legend-item">
                            <span className="poll-card-r__vote-legend-dot" style={{background: "#10b981"}}/>
                            За <b className="tnum">{votes.for}</b>
                        </span>
                        <span className="poll-card-r__vote-legend-item">
                            <span className="poll-card-r__vote-legend-dot" style={{background: "#b91c1c"}}/>
                            Против <b className="tnum">{votes.against}</b>
                        </span>
                        <span className="poll-card-r__vote-legend-item">
                            <span className="poll-card-r__vote-legend-dot" style={{background: "#b45309"}}/>
                            Воздерж. <b className="tnum">{votes.abstain}</b>
                        </span>
                        <span className="poll-card-r__vote-legend-support">
                            Поддержка <b className="tnum">{supportPct}%</b>
                        </span>
                    </div>
                </div>

                {/* Vote action: 3 buttons or voted banner */}
                {!myChoice && forOpt && againstOpt && abstainOpt && (
                    <div className="poll-card-r__vote-buttons">
                        <button
                            type="button"
                            className="btn btn--primary poll-card-r__vote-button"
                            disabled={voting}
                            onClick={() => handleVote(forOpt.id)}
                        >
                            <Check size={14}/>
                            Голосовать «За»
                        </button>
                        <button
                            type="button"
                            className="btn poll-card-r__vote-button"
                            disabled={voting}
                            onClick={() => handleVote(againstOpt.id)}
                        >
                            «Против»
                        </button>
                        <button
                            type="button"
                            className="btn btn--ghost poll-card-r__vote-button"
                            disabled={voting}
                            onClick={() => handleVote(abstainOpt.id)}
                        >
                            Воздержаться
                        </button>
                    </div>
                )}

                {myChoice && (
                    <div className="poll-card-r__voted-banner">
                        <CheckCircle2 size={16} className="poll-card-r__voted-icon"/>
                        <span className="poll-card-r__voted-text">
                            Ваш голос учтён. Можно изменить до закрытия.
                        </span>
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm poll-card-r__voted-change"
                        >
                            Изменить голос
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}

// Re-export icons used by ArchiveList for shared chip styling
export {Check as PollCheckIcon, X as PollCrossIcon};
