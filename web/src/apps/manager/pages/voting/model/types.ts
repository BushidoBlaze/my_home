import type {ChipTone} from "@/apps/manager/pages/home/model/types.ts";

export type PollCover = "emerald" | "warning" | "danger";

export type PollVotes = {
    for: number;
    against: number;
    abstain: number;
    total: number;
};

export type Poll = {
    id: string;
    title: string;
    house: string;
    type: string;
    status: string;
    statusTone: ChipTone;
    quorum: number;
    quorumGoal: number;
    votes: PollVotes;
    endsIn: string;
    cover: PollCover;
    /** Описание для детальной панели. */
    description?: string;
    /** Кем создано. */
    author?: string;
    /** Когда создано (короткое читаемое представление). */
    createdAt?: string;
    /** Открыто — детализированная дата. */
    openedAt?: string;
    /** До какой даты идёт. */
    endsAt?: string;
};

export type ArchivedPoll = {
    title: string;
    date: string;
    result: string;
    tone: "emerald" | "danger";
    q: number;
};

export type VoterEntry = {
    name: string;
    apt: string;
    last: string;
};

export type PollResultRow = {
    label: string;
    n: number;
    total: number;
    color: string;
};
