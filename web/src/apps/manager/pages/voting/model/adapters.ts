import type {Poll, PollCover} from "./types.ts";
import type {PollItem} from "@/api/polls.api.ts";
import type {ChipTone} from "@/apps/manager/pages/home/model/types.ts";

const CATEGORY_LABEL: Record<string, string> = {
    improvement: "Благоустройство",
    tariff: "Тариф",
    repair: "Ремонт",
    security: "Безопасность",
    general: "Общее собрание",
};

/** Считает кворум в процентах. */
function quorumPercent(voted: number, eligible: number): number {
    if (eligible <= 0) return 0;
    return Math.round((voted / eligible) * 100);
}

/** Человечески читаемое «осталось N» по endsAt. */
function endsInLabel(endsAtIso: string): string {
    const ms = new Date(endsAtIso).getTime() - Date.now();
    if (ms <= 0) return "завершено";
    const days = Math.floor(ms / 86_400_000);
    if (days >= 1) return `${days} ${pluralRu(days, "день", "дня", "дней")}`;
    const hours = Math.floor(ms / 3_600_000);
    if (hours >= 1) return `${hours} ${pluralRu(hours, "час", "часа", "часов")}`;
    const minutes = Math.floor(ms / 60_000);
    return `${minutes} мин`;
}

function pluralRu(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}

/** Короткая дата в формате «14 мая». */
function shortDateRu(iso: string): string {
    return new Date(iso).toLocaleDateString("ru-RU", {day: "numeric", month: "long"});
}

/** Полная дата + время «14 мая 18:00». */
function dateTimeRu(iso: string): string {
    const d = new Date(iso);
    const date = d.toLocaleDateString("ru-RU", {day: "numeric", month: "long"});
    const time = d.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"});
    return `${date} ${time}`;
}

/** Маппинг приоритета на цветовой ton карточки и chip. */
function deriveStatusVisual(
    quorum: number,
    goal: number,
    daysLeft: number,
    backendStatus: string,
): {status: string; tone: ChipTone; cover: PollCover} {
    if (backendStatus === "Closed") {
        return {status: "завершено", tone: "", cover: "emerald"};
    }
    if (quorum >= goal) {
        return {status: "идёт", tone: "emerald", cover: "emerald"};
    }
    // Если осталось мало времени и кворум близко — оранжевый
    if (daysLeft <= 2 && quorum < goal / 2) {
        return {status: "не наберёт кворум", tone: "danger", cover: "danger"};
    }
    return {status: "идёт", tone: "warning", cover: "warning"};
}

/**
 * Превращает ответ API в локальную модель Poll.
 *
 * Голоса «За/Против/Воздержался» матчим по ТЕКСТУ варианта, а не по индексу:
 * бэкенд может вернуть варианты в произвольном порядке, и подсчёт по позиции
 * приводил к путанице (голос «За» показывался как «Против»).
 */
export function adaptPoll(api: PollItem): Poll {
    const goal = 50; // ЖК РФ: для большинства решений требуется 50%

    const votesByText = (match: (text: string) => boolean) =>
        api.options.find(o => match(o.text.trim().toLowerCase()))?.votes ?? 0;

    const forVotes = votesByText(t => t === "за");
    const againstVotes = votesByText(t => t === "против");
    const abstainVotes = votesByText(t => t.startsWith("воздерж"));

    const quorum = quorumPercent(api.totalVoters, api.totalEligible);
    const daysLeft = Math.floor((new Date(api.endsAt).getTime() - Date.now()) / 86_400_000);
    const visual = deriveStatusVisual(quorum, goal, daysLeft, api.status);

    return {
        id: api.id,
        title: api.title,
        description: api.description || undefined,
        house: "Все дома ЖК", // TODO: добавим поле HouseId на бэке
        type: CATEGORY_LABEL[api.category] ?? "Опрос",
        status: visual.status,
        statusTone: visual.tone,
        quorum,
        quorumGoal: goal,
        votes: {
            for: forVotes,
            against: againstVotes,
            abstain: abstainVotes,
            total: api.totalEligible,
        },
        endsIn: endsInLabel(api.endsAt),
        cover: visual.cover,
        author: api.authorName,
        createdAt: shortDateRu(api.createdAt),
        openedAt: dateTimeRu(api.createdAt),
        endsAt: dateTimeRu(api.endsAt),
    };
}

export function adaptPolls(api: PollItem[]): Poll[] {
    return api.map(adaptPoll);
}
