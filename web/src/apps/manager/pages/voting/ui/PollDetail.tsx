import type {JSX} from "react";
import {TrendingUp, Send} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {POLL_DETAIL, POLL_RESULTS, NON_VOTERS} from "../model/data.ts";

export default function PollDetail(): JSX.Element {
    return (
        <aside className="vote-detail">
            {/* Header */}
            <div className="vote-detail__section">
                <div className="vote-detail__head">
                    <span className="chip chip--emerald"><span className="chip__dot"/>идёт</span>
                    <span className="vote-detail__head-text">· создано {POLL_DETAIL.createdAt} · {POLL_DETAIL.author}</span>
                </div>
                <div className="vote-detail__title">{POLL_DETAIL.title}</div>
                <div className="vote-detail__description">{POLL_DETAIL.description}</div>

                <div className="vote-detail__metas">
                    {POLL_DETAIL.metaCards.map((m, i) => (
                        <div key={i} className="vote-detail__meta-card">
                            <div className="vote-detail__meta-label">{m.label}</div>
                            <div className="vote-detail__meta-value">{m.value}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Live quorum */}
            <div className="vote-detail__section">
                <div className="vote-detail__live-head">
                    <div className="t-eyebrow">Кворум · в реальном времени</div>
                    <span className="vote-detail__online">● онлайн</span>
                </div>
                <div className="vote-detail__quorum-row">
                    <span className="tnum vote-detail__quorum-value">{POLL_DETAIL.quorumNow}%</span>
                    <span className="tnum vote-detail__quorum-meta">
                        {POLL_DETAIL.votedCount} / {POLL_DETAIL.totalCount}
                    </span>
                    <span className="chip chip--emerald vote-detail__delta-chip">
                        <TrendingUp size={11}/>+12 за день
                    </span>
                </div>
                <div style={{marginTop: 10}}>
                    <Progress value={POLL_DETAIL.quorumNow} color="#10b981" h={8}/>
                </div>
                <div className="vote-detail__quorum-note">
                    Цель кворума — {POLL_DETAIL.quorumGoal}%, набран. Голосование состоится.
                </div>
            </div>

            {/* Results */}
            <div className="vote-detail__section">
                <div className="t-eyebrow" style={{marginBottom: 10}}>Результаты</div>
                <div className="vote-detail__results">
                    {POLL_RESULTS.map((r, i) => (
                        <div key={i}>
                            <div className="vote-detail__result-row">
                                <span className="vote-detail__result-label">{r.label}</span>
                                <span className="tnum vote-detail__result-count">
                                    {r.n} <span style={{color: "#64748b", fontWeight: 400}}>· {Math.round((r.n / r.total) * 100)}%</span>
                                </span>
                            </div>
                            <Progress value={r.n} max={r.total} color={r.color} h={5}/>
                        </div>
                    ))}
                </div>
            </div>

            {/* Non-voters */}
            <div className="vote-detail__section-last">
                <div className="vote-detail__voters-head">
                    <div className="t-eyebrow">Не проголосовали · 70</div>
                    <button className="btn btn--sm">Напомнить всем</button>
                </div>
                <div className="vote-detail__voters">
                    {NON_VOTERS.map((v, i) => (
                        <div key={i} className="vote-detail__voter">
                            <Avatar name={v.name} size={26}/>
                            <div className="vote-detail__voter-main">
                                <div className="vote-detail__voter-name">{v.name}</div>
                                <div className="vote-detail__voter-meta">{v.apt} · {v.last}</div>
                            </div>
                            <button className="btn btn--icon btn--sm btn--ghost">
                                <Send size={12}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    );
}
