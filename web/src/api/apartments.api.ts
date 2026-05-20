import {requestJson} from "@/api/httpClient.ts";

export interface Apartment {
    id: string;
    number: string;
    floor: number;
}

export const apartmentsApi = {
    getMyApartment: () =>
        requestJson<Apartment>("/apartments/my"),
};
