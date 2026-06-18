import {requestJson} from "@/api/httpClient.ts";

export interface PollOptionItem {
    id: string;
    text: string;
    votes: number;
}

export interface PollItem {
    id: string;
    title: string;
    description: string;
    category: string;
    status: "Active" | "Closed";
    endsAt: string;
    createdAt: string;
    /** Сколько уникальных жильцов проголосовало. */
    totalVoters: number;
    /** Сколько жильцов имеют право голоса (для расчёта кворума). */
    totalEligible: number;
    hasVoted: boolean;
    myOptionId?: string;
    /** Имя создателя голосования. */
    authorName?: string;
    options: PollOptionItem[];
}

export interface NonVoterItem {
    id: string;
    fullName: string;
    apartmentNumber: string;
    lastSeen: string;
}

export interface CreatePollDto {
    title: string;
    description?: string;
    category?: string;
    endsAt: string;        // ISO 8601, UTC
    options: string[];     // минимум 2 непустых варианта
}

export const pollsApi = {
    getPolls: () =>
        requestJson<PollItem[]>("/polls"),

    /** Создать голосование. Доступно только менеджеру (бэк проверяет роль). */
    createPoll: (data: CreatePollDto) =>
        requestJson<{id: string}>("/polls", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    vote: (pollId: string, optionId: string) =>
        requestJson<{ ok: boolean }>(`/polls/${pollId}/vote`, {
            method: "POST",
            body: JSON.stringify({optionId}),
        }),

    closePoll: (pollId: string) =>
        requestJson<{ ok: boolean }>(`/polls/${pollId}/close`, {method: "PATCH"}),

    deletePoll: (pollId: string) =>
        requestJson<{ ok: boolean }>(`/polls/${pollId}`, {method: "DELETE"}),

    /** Список жильцов, которые ещё не проголосовали. Только для Manager. */
    getNonVoters: (pollId: string) =>
        requestJson<NonVoterItem[]>(`/polls/${pollId}/non-voters`),

    /** Разослать напоминание всем не голосовавшим. */
    remindAll: (pollId: string) =>
        requestJson<{ ok: boolean; notified: number }>(`/polls/${pollId}/remind`, {method: "POST"}),

    /** Персональное напоминание одному жильцу. */
    remindOne: (pollId: string, userId: string) =>
        requestJson<{ ok: boolean }>(`/polls/${pollId}/remind/${userId}`, {method: "POST"}),
};
