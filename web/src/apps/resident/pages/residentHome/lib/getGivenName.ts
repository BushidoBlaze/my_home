// Достаёт имя из ФИО, которое хранится одним полем в порядке
// «Фамилия Имя Отчество» (Атласов Раян … → «Раян»).
// Имя — второе слово; если слово одно (или поле пустое) — возвращаем его целиком.
export function getGivenName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return fullName.trim();
    return parts[1] ?? parts[0];
}
