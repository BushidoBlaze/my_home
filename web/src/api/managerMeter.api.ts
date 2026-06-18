import {requestJson} from "@/api/httpClient.ts";

export interface MeterTypeStat {
    code: string;
    label: string;
    color: string;
    n: number;
    t: number;
}

export interface MeterSummary {
    periodLabel: string;
    apartmentsTotal: number;
    delivered: number;
    pct: number;
    dueDay: number;
    daysLeft: number;
    meterTypes: MeterTypeStat[];
}

export interface MeterHouseRow {
    id: string;
    addr: string;
    apartments: number;
    done: number;
    hot: number;
    cold: number;
    el: number;
    pct: number;
    tone: string;
    flag?: string | null;
}

export interface MeterRecentItem {
    id: string;
    createdAt: string;
    meterType: string;
    value: number;
    fullName: string;
    avatarUrl?: string | null;
    addr: string;
}

export interface MeterApartmentItem {
    userId: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    fullName: string;
    delivered: boolean;
    lastAt?: string | null;
}

export const managerMeterApi = {
    summary: () => requestJson<MeterSummary>("/manager/meter/summary"),
    houses: () => requestJson<MeterHouseRow[]>("/manager/meter/houses"),
    recent: (limit = 20) => requestJson<MeterRecentItem[]>(`/manager/meter/recent?limit=${limit}`),
    apartments: (buildingId: string) =>
        requestJson<MeterApartmentItem[]>(`/manager/meter/apartments/${buildingId}`),
};
