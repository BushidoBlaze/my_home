import type {JSX} from "react";
import {Link} from "react-router-dom";
import {CheckCircle2, ChevronRight, MessageCircle, Phone} from "lucide-react";
import {categoryIcon} from "../lib/categoryIcon.ts";
import {ticketStepIndex} from "../lib/ticketStepIndex.ts";
import {formatDayMonth} from "../lib/formatDate.ts";
import {getCategoryLabel, getProgress, getStatusLabel} from "../lib/ticketLabels.ts";
import {Stepper} from "./Stepper.tsx";
import type {ResidentRequest} from "../model/types.ts";

interface ActiveTicketCardProps {
    active: ResidentRequest[];
    done: ResidentRequest[];
    loading: boolean;
    error: string;
    onRetry: () => void;
}

// Карточка "Ваши заявки": показывает ПЕРВУЮ активную заявку детально (со степпером
// и описанием) и список из 3 недавно закрытых внизу. Если активных нет — empty state
// с CTA "Подать обращение". Полный список — на отдельной странице /resident/requests.
export function ActiveTicketCard({active, done, loading, error, onRetry}: ActiveTicketCardProps): JSX.Element {
    // Берём только первую заявку из активных — остальные доступны на /resident/requests.
    const firstActive = active[0];
    const FirstActiveIcon = firstActive ? categoryIcon(firstActive.category) : null;

    return (
        <div className="card resident-home__ticket">
            <div className="resident-home__section-head">
                <div>
                    <div className="t-h3">Ваши заявки</div>
                    <div className="resident-home__section-sub">
                        {active.length} в работе · {done.length} закрыты
                    </div>
                </div>
                <Link to="/resident/requests" className="btn btn--sm btn--ghost">
                    Все заявки <ChevronRight size={12}/>
                </Link>
            </div>

            {/* Три взаимоисключающих состояния: loading / error / content.
                error может прийти от загрузки заявок (см. useResidentHome.loadData). */}
            {loading && <div className="resident-home__loading">Загружаем заявки…</div>}

            {!loading && error && (
                <div className="resident-home__inline-error">
                    <span>{error}</span>
                    <button className="btn btn--sm" type="button" onClick={onRetry}>Повторить</button>
                </div>
            )}

            {/* Empty state — когда нет активных заявок. Стимулируем создать новую. */}
            {!loading && !error && !firstActive && (
                <div className="resident-home__empty">
                    <CheckCircle2 size={28} strokeWidth={1.5}/>
                    <div className="resident-home__empty-text">Активных заявок нет</div>
                    <Link to="/resident/requests" className="btn btn--sm btn--primary resident-home__empty-action">
                        Подать обращение
                    </Link>
                </div>
            )}

            {/* Активная заявка: иконка категории + статус-чипы + степпер + описание + действия */}
            {!loading && !error && firstActive && FirstActiveIcon && (
                <div className="resident-home__ticket-active">
                    <div className="resident-home__ticket-row">
                        <div className="resident-home__ticket-icon">
                            <FirstActiveIcon size={20}/>
                        </div>
                        <div className="resident-home__ticket-main">
                            <div className="resident-home__ticket-meta">
                                {/* Короткий ID — первые 6 символов UUID, в верхнем регистре.
                                    Полный UUID жителю показывать неудобно и не нужно. */}
                                <span className="mono resident-home__ticket-id">
                                    {firstActive.id.slice(0, 6).toUpperCase()}
                                </span>
                                <span className={"chip" + (firstActive.status === "InProgress" ? " chip--info" : "")}>
                                    <span className="chip__dot"/> {getStatusLabel(firstActive.status)}
                                </span>
                                <span className="chip">{getCategoryLabel(firstActive.category)}</span>
                            </div>
                            <div className="resident-home__ticket-title">{firstActive.title}</div>
                        </div>
                        <div className="resident-home__ticket-progress">
                            <div className="resident-home__ticket-progress-label">Готовность</div>
                            {/* Прогресс мокаем через getProgress (см. lib/ticketLabels.ts) —
                                реальный % появится в API ServiceRequest позже. */}
                            <div className="tnum resident-home__ticket-progress-value">
                                {getProgress(firstActive.status)}%
                            </div>
                        </div>
                    </div>

                    <Stepper currentStep={ticketStepIndex(firstActive.status)}/>

                    {/* Описание показываем только если жилец что-то написал при создании */}
                    {firstActive.description && (
                        <div className="resident-home__ticket-update">
                            <div className="resident-home__ticket-update-text">
                                <div className="resident-home__ticket-update-meta">Описание заявки</div>
                                <div className="resident-home__ticket-update-msg">{firstActive.description}</div>
                            </div>
                        </div>
                    )}

                    <div className="resident-home__ticket-actions">
                        <Link to="/resident/chats" className="btn btn--sm btn--primary">
                            <MessageCircle size={14}/> Чат с УК
                        </Link>
                        {/* Кнопка "Позвонить" отключена — телефонии в проекте пока нет, заглушка */}
                        <button className="btn btn--sm" type="button" disabled>
                            <Phone size={14}/> Позвонить
                        </button>
                        <span className="resident-home__spacer"/>
                        <Link to="/resident/requests" className="btn btn--sm btn--ghost">
                            Подробнее <ChevronRight size={12}/>
                        </Link>
                    </div>
                </div>
            )}

            {/* Блок "Недавно закрыты" — компактный, максимум 3 записи, остальное на странице заявок */}
            {done.length > 0 && (
                <div className="resident-home__done">
                    <div className="t-eyebrow resident-home__done-title">Недавно закрыты</div>
                    <ul className="resident-home__done-list">
                        {done.slice(0, 3).map(t => (
                            <li key={t.id} className="resident-home__done-item">
                                <CheckCircle2 size={14} className="resident-home__done-item-check"/>
                                <span className="resident-home__done-item-title">{t.title}</span>
                                <span className="mono resident-home__done-item-id">
                                    {t.id.slice(0, 6).toUpperCase()}
                                </span>
                                <span className="resident-home__done-item-date">
                                    {formatDayMonth(t.createdAt)}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
