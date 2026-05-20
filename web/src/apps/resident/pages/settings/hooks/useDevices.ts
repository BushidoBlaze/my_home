import { useState, useEffect, useCallback } from "react";
import { devicesApi } from "../model/settingsApi";
import type { DeviceSession } from "../model/types";

export function useDevices() {
    const [sessions, setSessions] = useState<DeviceSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        devicesApi
            .getSessions()
            .then(setSessions)
            .catch(() => {
                // demo fallback — оставить пустой список
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const revoke = useCallback(
        async (id: string) => {
            setActionId(id);
            try {
                await devicesApi.revokeSession(id);
                setSessions((s) => s.filter((d) => d.id !== id));
            } finally {
                setActionId(null);
            }
        },
        []
    );

    const revokeAll = useCallback(async () => {
        setActionId("all");
        try {
            await devicesApi.revokeAllOthers();
            setSessions((s) => s.filter((d) => d.isCurrent));
        } finally {
            setActionId(null);
        }
    }, []);

    return { sessions, loading, actionId, revoke, revokeAll, reload: load };
}