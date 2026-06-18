import {TICKET_STEPS} from "../data/ticketSteps.ts";

// Возвращает 0-based индекс статуса в массиве TICKET_STEPS — нужен Stepper'у,
// чтобы понять до какого шага подсвечивать линию.
// Неизвестный статус трактуем как первый шаг ("Принята"), а не -1 — иначе
// Stepper решит, что всё в будущем, и не подсветит ничего.
export function ticketStepIndex(status: string): number {
    const i = TICKET_STEPS.findIndex(s => s.key === status);
    return i >= 0 ? i : 0;
}
