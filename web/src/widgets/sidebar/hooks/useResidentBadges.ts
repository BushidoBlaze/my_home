import {useEffect, useState} from "react";
import {requestsApi} from "@/api/requests.api.ts";
import {pollsApi} from "@/api/polls.api.ts";

// Реальные счётчики-бейджи для сайдбара жителя.
// Ключ — path пункта меню, значение — число «требует внимания».
// Запросы независимы и необязательны: если что-то упало, просто не показываем бейдж.
const REFRESH_MS = 60_000;

export function useResidentBadges(): Record<string, number> {
    const [badges, setBadges] = useState<Record<string, number>>({});

    useEffect(() => {
        let alive = true;

        async function load() {
            const [requests, polls] = await Promise.allSettled([
                requestsApi.getMyRequests(),
                pollsApi.getPolls(),
            ]);
            if (!alive) return;

            const next: Record<string, number> = {};

            // Заявки в работе (не закрытые).
            if (requests.status === "fulfilled") {
                const open = requests.value.filter(r => r.status !== "Done" && r.status !== "Cancelled").length;
                if (open > 0) next["/resident/requests"] = open;
            }

            // Активные голосования, в которых житель ещё не голосовал.
            if (polls.status === "fulfilled") {
                const pending = polls.value.filter(p => p.status === "Active" && !p.hasVoted).length;
                if (pending > 0) next["/resident/voting"] = pending;
            }

            setBadges(next);
        }

        void load();
        const id = window.setInterval(() => void load(), REFRESH_MS);
        return () => {
            alive = false;
            window.clearInterval(id);
        };
    }, []);

    return badges;
}
