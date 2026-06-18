import type {JSX} from "react";
import {Droplet, Store, Vote, Wrench} from "lucide-react";
import {SmartAction} from "./SmartAction.tsx";
import type {PollItem} from "@/api/polls.api.ts";

interface SmartActionsRowProps {
    // Активное голосование передаём сюда из родителя, чтобы карточка "Голосование"
    // показывала реальное название и вела в актуальный опрос.
    activeVote: PollItem | null;
}

// Фиксированный ряд из 4 смарт-действий: показания, заявка, голосование, маркетплейс.
// Состав карточек захардкожен намеренно — это основной поток жителя, а не настраиваемая лента.
export function SmartActionsRow({activeVote}: SmartActionsRowProps): JSX.Element {
    return (
        <section className="resident-home__smart-actions">
            {/* Прогресс показаний — единственная карточка с прогрессом (3 из 5 счётчиков сдано).
                Дату ("до 25 числа") пока пишем словами, потом возьмём из tariff settings. */}
            <SmartAction
                icon={Droplet}
                tone="info"
                title="Сдать показания"
                sub="до 25 числа · осталось 3 дня"
                to="/resident/expenses"
                progress={{value: 3, max: 5}}
            />
            <SmartAction
                icon={Wrench}
                tone="emerald"
                title="Создать заявку"
                sub="ремонт, уборка, доступ"
                to="/resident/requests"
            />
            {/* Голосование меняет title/sub в зависимости от наличия активного опроса.
                Ссылка ведёт в /voting даже если опросов нет — там показывается общий список и архив. */}
            <SmartAction
                icon={Vote}
                tone="violet"
                title={activeVote ? "Голосование идёт" : "Голосований нет"}
                sub={activeVote ? activeVote.title : "активных голосований сейчас нет"}
                to="/resident/voting"
            />
            <SmartAction
                icon={Store}
                tone="warning"
                title="Услуги мастеров"
                sub="клининг, ремонт, доставка"
                to="/resident/marketplace"
            />
        </section>
    );
}
