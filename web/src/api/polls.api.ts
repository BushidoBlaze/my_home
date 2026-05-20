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

export const pollsApi = {
    getPolls: () =>
        requestJson<PollItem[]>("/polls"),

    vote: (pollId: string, optionId: string) =>
        requestJson<{ ok: boolean }>(`/polls/${pollId}/vote`, {
            method: "POST",
            body: JSON.stringify({optionId}),
        }),
};
