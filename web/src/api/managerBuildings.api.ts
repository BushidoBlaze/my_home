import {requestJson, requestVoid} from "@/api/httpClient.ts";

export type HouseTone = "ok" | "warning" | "danger";

export interface BuildingListItem {
    id: string;
    addr: string;
    city: string;
    street: string;
    house: string;
    block?: string | null;
    year: number;
    series?: string | null;
    apartmentsTotal: number;
    areaTotal: number;
    residentsCount: number;
    debt: number;
    openTickets: number;
    tone: HouseTone;
    flags: string[];
}

export interface BuildingResident {
    id: string;
    fullName: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    area?: number | null;
    residents?: number | null;
    debt: number;
}

export interface BuildingFinance {
    charged: number;
    paid: number;
    debt: number;
    collectionPct: number;
}

export interface BuildingStatusSegment {
    label: string;
    count: number;
    tone: "ok" | "warning" | "danger" | "muted";
}

export interface BuildingDetail {
    id: string;
    addr: string;
    city: string;
    street: string;
    house: string;
    block?: string | null;
    year: number;
    series?: string | null;
    cadastre?: string | null;
    floors: number;
    entrances: number;
    lifts: number;
    apartmentsTotal: number;
    areaTotal: number;
    chairmanName?: string | null;
    chairmanApartment?: string | null;
    note?: string | null;
    residentsCount: number;
    openTickets: number;
    finance: BuildingFinance;
    statusBreakdown: BuildingStatusSegment[];
    residents: BuildingResident[];
}

export interface CreateBuildingDto {
    city?: string;
    street: string;
    house: string;
    block?: string;
    year?: number;
    series?: string;
    cadastre?: string;
    floors?: number;
    entrances?: number;
    lifts?: number;
    apartmentsTotal?: number;
    areaTotal?: number;
    chairmanName?: string;
    chairmanApartment?: string;
    note?: string;
}

export const managerBuildingsApi = {
    list: () => requestJson<BuildingListItem[]>("/manager/buildings"),
    getById: (id: string) => requestJson<BuildingDetail>(`/manager/buildings/${id}`),
    create: (data: CreateBuildingDto) =>
        requestJson<{id: string; addr: string}>("/manager/buildings", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    remove: (id: string) =>
        requestVoid(`/manager/buildings/${id}`, {method: "DELETE"}),
};
