import {useEffect, useState} from "react";
import {requestsApi} from "@/api/requests.api.ts";
import {pollsApi} from "@/api/polls.api.ts";

// Реальные счётчики-бейджи для сайдбара управляющего.
// Ключ — path пункта меню, значение — число «требует внимания».
// Запросы независимы и необязательны: если что-то упало, бейдж просто не показываем.
const REFRESH_MS = 60_000;

export function useManagerBadges(): Record<string, number> {
    const [badges, setBadges] = useState<Record<string, number>>({});

    useEffect(() => {
        let alive = true;

        async function load() {
            const [requests, polls] = await Promise.allSettled([
                requestsApi.getAllRequests(),
                pollsApi.getPolls(),
            ]);
            if (!alive) return;

            const next: Record<string, number> = {};

            // Открытые заявки (не закрытые) — то, что в работе на доске.
            if (requests.status === "fulfilled") {
                const open = requests.value.filter(r => r.status !== "Done").length;
                if (open > 0) next["/manager/tickets"] = open;
            }

            // Активные голосования.
            if (polls.status === "fulfilled") {
                const active = polls.value.filter(p => p.status === "Active").length;
                if (active > 0) next["/manager/vote"] = active;
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
