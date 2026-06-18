import type {JSX} from "react";
import {Check, ChevronRight, X} from "lucide-react";
import type {PollItem, PollOptionItem} from "@/api/polls.api.ts";
import type {VoteChoice} from "../model/types.ts";

function classify(opt: PollOptionItem): VoteChoice | null {
    const t = opt.text.toLowerCase();
    if (t.includes("против")) return "against";
    if (t.includes("воздерж")) return "abstain";
    if (t.includes("за"))     return "for";
    return null;
}

function formatShortDate(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "short"});
}

// Poll is "accepted" when За votes are more than half of all (for+against) votes cast.
function isAccepted(poll: PollItem): boolean {
    const forOpt     = poll.options.find(o => classify(o) === "for");
    const againstOpt = poll.options.find(o => classify(o) === "against");
    const f = forOpt?.votes ?? 0;
    const a = againstOpt?.votes ?? 0;
    if (f + a === 0) return false;
    return f / (f + a) > 0.5;
}

function quorumPct(poll: PollItem): number {
    if (poll.totalEligible === 0) return 0;
    return Math.round((poll.totalVoters / poll.totalEligible) * 100);
}

const CHOICE_TEXT: Record<VoteChoice, string> = {
    for:     "За",
    against: "Против",
    abstain: "Воздержался",
};

const CHOICE_COLOR: Record<VoteChoice, string> = {
    for:     "#047857",
    against: "#b91c1c",
    abstain: "#b45309",
};

interface ArchiveListProps {
    polls:        PollItem[];
    totalForYear: number;
}

export function ArchiveList({polls, totalForYear}: ArchiveListProps): JSX.Element | null {
    if (polls.length === 0) return null;

    return (
        <section className="voting-page__archive">
            <header className="voting-page__archive-header">
                <div>
                    <div className="voting-page__archive-title">Завершённые голосования</div>
                    <div className="voting-page__archive-subtitle">
                        За последние 12 месяцев · {totalForYear} решений
                    </div>
                </div>
                <button type="button" className="btn btn--sm btn--ghost">
                    Архив целиком →
                </button>
            </header>

            <div className="voting-page__archive-list">
                {polls.map((poll, i) => {
                    const accepted = isAccepted(poll);
                    const myChoice = poll.myOptionId
                        ? classify(poll.options.find(o => o.id === poll.myOptionId)!) ?? null
                        : null;
                    const isLast = i === polls.length - 1;

                    return (
                        <div
                            key={poll.id}
                            className={`voting-page__archive-row${isLast ? " voting-page__archive-row--last" : ""}`}
                        >
                            <div
                                className="voting-page__archive-icon"
                                style={{
                                    background: accepted ? "#dcfce7" : "#fee2e2",
                                    color:      accepted ? "#047857" : "#b91c1c",
                                }}
                            >
                                {accepted ? <Check size={16} strokeWidth={2.5}/> : <X size={16} strokeWidth={2.5}/>}
                            </div>

                            <div className="voting-page__archive-info">
                                <div className="voting-page__archive-row-title">{poll.title}</div>
                                <div className="voting-page__archive-row-meta">
                                    <span>{formatShortDate(poll.endsAt)}</span>
                                    <span>·</span>
                                    <span>кворум {quorumPct(poll)}%</span>
                                    <span>·</span>
                                    <span className="tnum">{poll.totalVoters} / {poll.totalEligible}</span>
                                </div>
                            </div>

                            {myChoice && (
                                <div className="voting-page__archive-my-vote">
                                    Ваш голос:{" "}
                                    <b style={{color: CHOICE_COLOR[myChoice]}}>
                                        {CHOICE_TEXT[myChoice]}
                                    </b>
                                </div>
                            )}

                            <span
                                className={`chip ${accepted ? "chip--emerald" : "chip--danger"} voting-page__archive-result`}
                            >
                                {accepted ? "Принято" : "Не принято"}
                            </span>

                            <ChevronRight size={14} className="voting-page__archive-chevron"/>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
