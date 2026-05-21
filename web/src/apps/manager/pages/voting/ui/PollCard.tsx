import type {JSX} from "react";
import {Vote} from "lucide-react";
import {toast} from "sonner";
import type {Poll} from "../model/types.ts";
import {COVER_COLORS} from "../model/data.ts";

interface PollCardProps {
    poll: Poll;
    selected: boolean;
    onSelect: (id: string) => void;
}

export default function PollCard({poll, selected, onSelect}: PollCardProps): JSX.Element {
    const cc = COVER_COLORS[poll.cover] || COVER_COLORS.emerald;
    const supportPct = Math.round((poll.votes.for / (poll.votes.for + poll.votes.against || 1)) * 100);
    const notVoted = poll.votes.total - poll.votes.for - poll.votes.against - poll.votes.abstain;

    const cardClass = "vote-card" + (selected ? " vote-card--selected" : "");

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(poll.id);
    };
    const handleRemind = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast.success(`Напоминание отправлено ${notVoted} жильцам`, {description: `«${poll.title}»`});
    };
    const handleProtocol = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast("Протокол будет сформирован после закрытия голосования", {
            description: poll.endsIn ? `Осталось ${poll.endsIn}` : undefined,
        });
    };

    return (
        <div
            className={cardClass}
            onClick={() => onSelect(poll.id)}
            style={{cursor: "pointer"}}
        >
            <div
                className="vote-card__cover"
                style={{background: `linear-gradient(90deg, ${cc.bg1}, ${cc.bg2})`}}
            />

            <div className="vote-card__body">
                <div className="vote-card__head">
                    <div className="vote-card__icon">
                        <Vote size={20}/>
                    </div>
                    <div className="vote-card__main">
                        <div className="vote-card__meta">
                            <span className="vote-card__meta-text">{poll.type} · {poll.house}</span>
                            <span className={"chip chip--" + poll.statusTone}>
                                <span className="chip__dot"/>{poll.status}
                            </span>
                        </div>
                        <div className="vote-card__title">{poll.title}</div>
                    </div>
                    <div className="vote-card__ends">
                        <div className="vote-card__ends-label">До закрытия</div>
                        <div className="vote-card__ends-value">{poll.endsIn}</div>
                    </div>
                </div>

                <div className="vote-card__quorum">
                    <div className="vote-card__quorum-head">
                        <span>Кворум</span>
                        <span className="tnum vote-card__quorum-value">
                            {poll.quorum}% <span style={{color: "#64748b", fontWeight: 400}}>· цель {poll.quorumGoal}%</span>
                        </span>
                    </div>
                    <div className="vote-card__quorum-bar">
                        <div
                            className="vote-card__quorum-fill"
                            style={{
                                width: `${poll.quorum}%`,
                                background: `linear-gradient(90deg, ${cc.bg1}, ${cc.bg2})`,
                            }}
                        />
                        <div
                            className="vote-card__quorum-goal"
                            style={{left: `${poll.quorumGoal}%`}}
                            title="Цель"
                        />
                    </div>
                </div>

                <div className="vote-card__stack">
                    <div className="vote-card__stack-bar">
                        <div
                            className="vote-card__stack-for"
                            style={{width: `${(poll.votes.for / poll.votes.total) * 100}%`}}
                            title={"За — " + poll.votes.for}
                        />
                        <div
                            className="vote-card__stack-against"
                            style={{width: `${(poll.votes.against / poll.votes.total) * 100}%`}}
                            title={"Против — " + poll.votes.against}
                        />
                        <div
                            className="vote-card__stack-abstain"
                            style={{width: `${(poll.votes.abstain / poll.votes.total) * 100}%`}}
                            title={"Воздерж. — " + poll.votes.abstain}
                        />
                    </div>
                    <div className="vote-card__legend">
                        <span className="vote-card__legend-item">
                            <span className="vote-card__legend-dot" style={{background: "#10b981"}}/>
                            За <b className="tnum">{poll.votes.for}</b>
                        </span>
                        <span className="vote-card__legend-item">
                            <span className="vote-card__legend-dot" style={{background: "#ef4444"}}/>
                            Против <b className="tnum">{poll.votes.against}</b>
                        </span>
                        <span className="vote-card__legend-item">
                            <span className="vote-card__legend-dot" style={{background: "#f59e0b"}}/>
                            Воздержались <b className="tnum">{poll.votes.abstain}</b>
                        </span>
                        <span className="vote-card__legend-item vote-card__legend-item--right">
                            Не голосовали <b className="tnum">{notVoted}</b>
                        </span>
                    </div>
                </div>

                <div className="vote-card__actions">
                    <button className="btn btn--sm" onClick={handleOpen}>Открыть</button>
                    <button className="btn btn--sm btn--ghost" onClick={handleRemind}>Напомнить · {notVoted}</button>
                    <button className="btn btn--sm btn--ghost" onClick={handleProtocol}>Протокол</button>
                    <span className="vote-card__spacer"/>
                    <span className="tnum vote-card__support">Поддержка: {supportPct}%</span>
                </div>
            </div>
        </div>
    );
}
