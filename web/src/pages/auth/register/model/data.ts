import {SquareArrowOutUpRight} from "lucide-react";
import type {RegisterFeature} from "./types.ts";

// Преимущества для жителя (ЖК)
export const RESIDENT_FEATURES: RegisterFeature[] = [
    {id: 1, text: "Подача заявок онлайн", icon: SquareArrowOutUpRight},
    {id: 2, text: "Прозрачный учёт расходов", icon: SquareArrowOutUpRight},
    {id: 3, text: "Контроль статусов в реальном времени", icon: SquareArrowOutUpRight},
    {id: 4, text: "Голосования и опросы", icon: SquareArrowOutUpRight},
];

// Преимущества для управляющей компании (УК)
export const MANAGER_FEATURES: RegisterFeature[] = [
    {id: 1, text: "Единый портал для диспетчерской и бухгалтерии", icon: SquareArrowOutUpRight},
    {id: 2, text: "Автоматизация обработки заявок жителей", icon: SquareArrowOutUpRight},
    {id: 3, text: "Аналитика и дашборды в реальном времени", icon: SquareArrowOutUpRight},
    {id: 4, text: "Управление несколькими домами из одного окна", icon: SquareArrowOutUpRight},
];