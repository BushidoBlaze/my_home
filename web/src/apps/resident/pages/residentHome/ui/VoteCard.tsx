import type {JSX} from "react";
import {Link} from "react-router-dom";
import {Check, Vote} from "lucide-react";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import type {PollItem} from "@/api/polls.api.ts";

interface VoteCardProps {
    // null = нет активного голосования, показываем empty state.
    activeVote: PollItem | null;
}

// Карточка активного голосования. Показывает описание опроса и текущий кворум
// (сколько проголосовало из тех, кто имеет право). Если активных опросов нет — empty state.
export function VoteCard({activeVote}: VoteCardProps): JSX.Element {
    // Считаем кворум как % от eligible. Math.max(eligible, 1) защищает от деления на 0,
    // если в доме внезапно не оказалось ни одного голосующего жителя.
    const quorum = activeVote
        ? Math.round((activeVote.totalVoters / Math.max(activeVote.totalEligible, 1)) * 100)
        : 0;

    return (
        <div className="card resident-home__vote">
            <div className="resident-home__section-head">
                <div>
                    <div className="t-h3">Голосование</div>
                    <div className="resident-home__section-sub">
                        {activeVote ? activeVote.title : "сейчас нет активных голосований"}
                    </div>
                </div>
                {/* Чип "идёт" — только когда есть активное голосование */}
                {activeVote && (
                    <span className="chip chip--violet">
                        <span className="chip__dot"/> идёт
                    </span>
                )}
            </div>

            {activeVote ? (
                <div className="resident-home__vote-body">
                    {/* Описание может быть пустым в БД — fallback "Описание не указано" */}
                    <p className="resident-home__vote-desc">{activeVote.description || "Описание не указано."}</p>

                    <div className="resident-home__vote-quorum">
                        <div className="resident-home__vote-quorum-row">
                            <span className="resident-home__vote-quorum-label">Текущий кворум</span>
                            <span className="tnum resident-home__vote-quorum-value">
                                {quorum}%
                                {/* Дробь "N из M" приглушённым цветом — детализация к проценту */}
                                <span className="resident-home__vote-quorum-fraction">
                                    {" "}· {activeVote.totalVoters} из {activeVote.totalEligible}
                                </span>
                            </span>
                        </div>
                        <Progress value={quorum} color="#10b981" h={5}/>
                    </div>

                    <Link to="/resident/voting" className="btn btn--primary resident-home__vote-action">
                        <Check size={14}/> Перейти к голосованию
                    </Link>
                </div>
            ) : (
                <div className="resident-home__empty">
                    <Vote size={28} strokeWidth={1.5}/>
                    <div className="resident-home__empty-text">Сейчас нет голосований</div>
                </div>
            )}
        </div>
    );
}
