import {requestJson} from "@/api/httpClient.ts";

/* ============================================================
   Manager dashboard API contracts (/manager/home)
   ============================================================
   Endpoints are independent per block so each can be cached,
   refreshed, and authorized separately.
   ------------------------------------------------------------ */

/* ---------- 1. KPI strip (StatRow, 5 cards) ---------- */

export type DeltaDirection = "up" | "down" | "flat";
export type StatAccent = "emerald" | "info" | "warning" | "danger" | "violet";

export interface KpiCard {
    /** Stable identifier — used for ordering and client-side mapping. */
    id: "tickets" | "unassigned" | "alerts" | "collection" | "meters";
    label: string;
    value: string;
    /** Pre-formatted delta, e.g. "+12%", "−2", "+1.8 пп". Empty if no comparison available. */
    delta: string;
    deltaDir: DeltaDirection;
    /** Short context line under the value. */
    sub: string;
    accent: StatAccent;
}

export interface KpiResponse {
    /** ISO 8601, UTC. */
    asOf: string;
    cards: KpiCard[];
}

/* ---------- 2. Priority tickets ---------- */

export type TicketCategory = "plumbing" | "electric" | "heating" | "lift" | "repair" | "cleaning" | "yard" | "security" | "other";
export type ChipTone = "" | "emerald" | "info" | "warning" | "danger" | "violet";

export interface PriorityTicket {
    id: string;
    title: string;
    /** Sub-label: "Аварийная", "Жалоба", "Плановая", etc. */
    subTitle: string;
    category: TicketCategory;
    addr: string;
    /** Human-readable assignee name, or null when unassigned. */
    assignee: string | null;
    /** SLA hint: "−2 ч", "0:42", "сегодня", "завтра", "1д" — formatted server-side. */
    sla: string;
    slaTone: ChipTone;
    status: string;
    statusTone: ChipTone;
}

export interface PriorityTicketsResponse {
    asOf: string;
    items: PriorityTicket[];
    /** Total open priority tickets — for "ещё N" link. */
    total: number;
}

/* ---------- 3. Collections (current month) ---------- */

export interface CollectionsResponse {
    /** Plan percent, e.g. 92. */
    plan: number;
    /** Actual collection percent, e.g. 91.4. */
    actualPct: number;
    /** Pre-formatted money strings — server controls localization. */
    accrued: string;
    received: string;
    debt: string;
    /** Up to 12 monthly points, oldest → newest, percent values. */
    trend: number[];
    /** Period label, e.g. "май 2026". */
    periodLabel: string;
}

/* ---------- 4. Regulatory compliance deadlines ---------- */

export type ComplianceCategory = "lift" | "gas" | "fire" | "duct";
export type ComplianceStatus = "burning" | "soon" | "ok";

export interface ComplianceDeadline {
    id: string;
    category: ComplianceCategory;
    title: string;
    addr: string;
    /** ISO 8601 date of the deadline. */
    dueAt: string;
    /** Pre-formatted relative label: "через 3 дня", "сегодня", "просрочено". */
    dueLabel: string;
    /** Whole days remaining. Negative if overdue. */
    daysLeft: number;
    status: ComplianceStatus;
}

export interface ComplianceResponse {
    asOf: string;
    items: ComplianceDeadline[];
    /** Total upcoming deadlines for "Все" link. */
    total: number;
}

/* ---------- 5. Activity feed (compact, important only) ---------- */

export type ActivityIcon = "check" | "send" | "alert" | "vote" | "gauge" | "info";

export interface ActivityTextPart {
    text: string;
    bold?: boolean;
    muted?: boolean;
}

export interface ActivityEvent {
    id: string;
    /** ISO 8601 timestamp. */
    at: string;
    /** Local time label, e.g. "11:42". */
    time: string;
    icon: ActivityIcon;
    /** Mapped server-side to category color. */
    accent: StatAccent;
    /** Rich text with emphasis markers. */
    textParts: ActivityTextPart[];
}

export interface ActivityResponse {
    asOf: string;
    items: ActivityEvent[];
}

/* ---------- 6. Active votings ---------- */

export interface ActiveVote {
    id: string;
    title: string;
    /** Quorum reached, percent. */
    quorum: number;
    /** Required quorum percent (usually 50). */
    goal: number;
    /** Votes cast / total eligible, pre-formatted: "142 / 212". */
    votes: string;
    /** Hex color reflecting quorum status. */
    tone: string;
    /** ISO 8601 deadline. */
    endsAt: string;
}

export interface ActiveVotesResponse {
    asOf: string;
    items: ActiveVote[];
}

/* ============================================================
   Client
   ============================================================ */

const BASE = "/manager/dashboard";

export const managerDashboardApi = {
    getKpi: () => requestJson<KpiResponse>(`${BASE}/stats`),

    getPriorityTickets: (limit = 6) =>
        requestJson<PriorityTicketsResponse>(`${BASE}/priority-tickets?limit=${limit}`),

    getCollections: () => requestJson<CollectionsResponse>(`${BASE}/collections`),

    getCompliance: (limit = 5) =>
        requestJson<ComplianceResponse>(`${BASE}/compliance?limit=${limit}`),

    getActivity: (limit = 6) =>
        requestJson<ActivityResponse>(`${BASE}/activity?limit=${limit}`),

    getActiveVotes: (limit = 5) =>
        requestJson<ActiveVotesResponse>(`${BASE}/active-votes?limit=${limit}`),
};
