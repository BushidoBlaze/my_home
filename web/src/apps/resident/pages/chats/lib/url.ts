import {API_ORIGIN} from "../data/constants.ts";

export function toApiFileUrl(path?: string) {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_ORIGIN}${path}`;
}