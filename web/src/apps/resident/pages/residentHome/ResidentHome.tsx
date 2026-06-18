//plugins
import {useEffect, useState, type JSX} from "react";

//api
import {newsApi, type NewsItem} from "@/api/news.api.ts";
import {pollsApi, type PollItem} from "@/api/polls.api.ts";
import {usersApi, type User} from "@/api/users.api.ts";

//hooks
import {useResidentHome} from "./hooks/useResidentHome.ts";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

//lib
import {formatDateRu} from "./lib/formatDate.ts";
import {getGreeting} from "./lib/getGreeting.ts";
import {getGivenName} from "./lib/getGivenName.ts";

//ui and ui-components
import {ActiveTicketCard} from "./ui/ActiveTicketCard.tsx";
import {ApartmentBlock} from "./ui/ApartmentBlock.tsx";
import {NewsCard} from "./ui/NewsCard.tsx";
import {PaymentCard} from "./ui/PaymentCard.tsx";
import {SmartActionsRow} from "./ui/SmartActionsRow.tsx";
import {VoteCard} from "./ui/VoteCard.tsx";
import {WeekTimeline} from "./ui/WeekTimeline.tsx";
import ResidentTopBar from "@/apps/resident/_shared/ResidentTopBar.tsx";

// styles
import "./ResidentHome.css";

// Главная страница жителя — слой композиции. Сама не дергает API напрямую для заявок —
// это уносится в useResidentHome. Здесь подтягиваются легковесные дополнительные данные
// (профиль, активное голосование, последние новости) и собирается макет.
export default function ResidentHome(): JSX.Element {
    useDocumentTitle('Домашняя страница жителя');

    // ФИО хранится после логина в localStorage одним полем в порядке
    // "Фамилия Имя Отчество". Для приветствия нужно только имя (второе слово) —
    // getGivenName разбирает строку и корректно отдаёт fallback для одного слова.
    const fullName = localStorage.getItem("fullName") || "Житель";
    const firstName = getGivenName(fullName);

    // Заявки + уведомления — берём из общего хука, чтобы потом их можно было
    // легко переиспользовать в других компонентах главной без дублирующих запросов.
    const {active, done, loading, error, loadData} = useResidentHome();

    // Локальный стейт для второстепенных данных: профиль, активное голосование, новости.
    // Все три запроса опциональны для рендера — если упадут, страница всё равно покажется.
    const [me, setMe] = useState<User | null>(null);
    const [activeVote, setActiveVote] = useState<PollItem | null>(null);
    const [news, setNews] = useState<NewsItem[]>([]);

    useEffect(() => {
        // Запросы независимы — пускаем параллельно, ошибки глушим (опциональные данные).
        usersApi.getMe().then(setMe).catch(() => {});

        // Бэкенд возвращает все опросы пользователя — на главной показываем только
        // первый активный (если есть), остальные — на /resident/voting.
        pollsApi.getPolls()
            .then(list => setActiveVote(list.find(p => p.status === "Active") ?? null))
            .catch(() => {});

        // Превью: 3 последних объявления УК, полный список — на /resident/news.
        newsApi.list({pageSize: 3})
            .then(r => setNews(r.items))
            .catch(() => {});
    }, []);

    // Подзаголовок топбара: при ошибке — нейтральный текст, иначе сводка по активным заявкам.
    // Русская плюрализация только для 1/many — для главной этого достаточно.
    const subtitle = error
        ? "не удалось загрузить данные"
        : active.length > 0
            ? `${active.length} ${active.length === 1 ? "заявка в работе" : "заявок в работе"}`
            : "в вашем доме всё спокойно";

    return (
        <div className="resident-home">
            <ResidentTopBar
                title={`${getGreeting()}, ${firstName}`}
                subtitle={`${formatDateRu(new Date())} · ${subtitle}`}
            />

            <div className="resident-home__content">
                {/* HERO: блок квартиры (слева) + карточка платежа (справа) */}
                <section className="resident-home__hero">
                    <ApartmentBlock user={me}/>
                    <PaymentCard/>
                </section>

                {/* 4 быстрых действия: показания, заявка, голосование, маркетплейс */}
                <SmartActionsRow activeVote={activeVote}/>

                {/* Левая колонка — заявки жителя, правая — лента событий дома */}
                <section className="resident-home__split">
                    <ActiveTicketCard
                        active={active}
                        done={done}
                        loading={loading}
                        error={error}
                        onRetry={() => void loadData()}
                    />
                    <WeekTimeline/>
                </section>

                {/* Левая колонка — активное голосование, правая — последние объявления УК */}
                <section className="resident-home__split">
                    <VoteCard activeVote={activeVote}/>
                    <NewsCard news={news}/>
                </section>
            </div>
        </div>
    );
}
