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
    totalVoters: number;
    hasVoted: boolean;
    myOptionId?: string;
    options: PollOptionItem[];
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
};
