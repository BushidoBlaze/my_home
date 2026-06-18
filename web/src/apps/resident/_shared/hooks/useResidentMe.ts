import {useEffect, useState} from "react";
import {usersApi, type User} from "@/api/users.api.ts";

// Модульный кеш профиля. ResidentTopBar монтируется на каждой странице кабинета —
// если бы каждый монтаж дёргал /api/users/me, мы бы получали по 6–10 запросов
// при навигации между страницами. Один промис на сессию решает проблему.
let cachedUser: User | null = null;
let pending: Promise<User> | null = null;

function fetchMe(): Promise<User> {
    if (cachedUser) return Promise.resolve(cachedUser);
    if (pending) return pending;
    pending = usersApi.getMe()
        .then(u => {
            cachedUser = u;
            return u;
        })
        .finally(() => {
            pending = null;
        });
    return pending;
}

// Дёргается из других мест после обновления профиля (например со страницы Account),
// чтобы при следующем монтировании топбара подгрузились новые данные.
export function invalidateResidentMeCache(): void {
    cachedUser = null;
}

export function useResidentMe(): User | null {
    const [user, setUser] = useState<User | null>(cachedUser);

    useEffect(() => {
        let alive = true;
        fetchMe()
            .then(u => {
                if (alive) setUser(u);
            })
            .catch(() => {
                // /me падает только если токен невалиден — в этом случае ProtectedRoute
                // уже редиректит на /login, нам тут делать нечего.
            });
        return () => {
            alive = false;
        };
    }, []);

    return user;
}
