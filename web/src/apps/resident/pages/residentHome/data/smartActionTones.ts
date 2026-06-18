import type {SmartActionTone} from "../model/types.ts";

// Палитра пар "фон / основной цвет" для смарт-карточек. Tailwind-стиль: 100-й/700-й тоны.
export const SMART_ACTION_TONE_MAP: Record<SmartActionTone, { bg: string; fg: string }> = {
    emerald: {bg: "#d1fae5", fg: "#047857"},
    info: {bg: "#e0f2fe", fg: "#0369a1"},
    warning: {bg: "#fef3c7", fg: "#b45309"},
    violet: {bg: "#ede9fe", fg: "#6d28d9"},
};
