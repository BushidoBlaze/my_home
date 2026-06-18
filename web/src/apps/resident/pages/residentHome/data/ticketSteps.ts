import type {TicketStep} from "../model/types.ts";

// Этапы жизненного цикла заявки в порядке прохождения. Используется в Stepper.
export const TICKET_STEPS: readonly TicketStep[] = [
    {key: "New", label: "Принята"},
    {key: "Assigned", label: "Назначена"},
    {key: "InProgress", label: "В работе"},
    {key: "Review", label: "Проверка"},
    {key: "Done", label: "Закрыта"},
] as const;
