import type {TariffsPlansProps} from "./types.ts";
import type {TariffsPlansStateProps} from "./types.ts";

//Название тарифа / тип тарифа / цена
export const TARIFFS_PLANS_CONTENT: TariffsPlansProps[] = [
    {
        tariffName: "Базовый",
        tariffType: "base",
        tariffPrice: 30000
    },
    {
        tariffName: "Продвинутый",
        tariffType: "medium",
        tariffPrice: 70000
    },
    {
        tariffName: "Бизнес Плюс",
        tariffType: "ultra",
        tariffPrice: 100000
    }
];

// Функции и возможности тарифов
export const TARIFFS_POSSIBILITIES: TariffsPlansStateProps[] = [
    // Безопасность
    {
        title: "Безопасность",
        possible: "Видеонаблюдение в реальном времени — просмотр камер внутри и снаружи дома, запись событий",
        available: {
            base: true,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Безопасность",
        possible: "Оповещения о вторжении — мгновенные уведомления при срабатывании датчиков движения/открытия дверей",
        available: {
            base: false,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Безопасность",
        possible: "Имитация присутствия — автоматическое включение света/музыки, когда вас нет дома",
        available: {
            base: false,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Безопасность",
        possible: "Контроль доступа — управление замками, электронные ключи для гостей, история входов",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },

    // Климат и комфорт
    {
        title: "Климат и комфорт",
        possible: "Умный термостат — управление отоплением и кондиционером, расписание по дням",
        available: {
            base: false,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Климат и комфорт",
        possible: "Контроль влажности — автоматическое включение увлажнителей или осушителей воздуха",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },
    {
        title: "Климат и комфорт",
        possible: "Качество воздуха — отслеживание CO2, пыльцы, аллергенов, проветривание",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },

    // Энергоэффективность
    {
        title: "Энергоэффективность",
        possible: "Управление освещением — сценарии (кино, ужин, утро), диммирование, датчики присутствия",
        available: {
            base: true,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Энергоэффективность",
        possible: "Энергомониторинг — статистика потребления электричества, советы по экономии",
        available: {
            base: false,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Энергоэффективность",
        possible: "Умные розетки — удаленное включение/выключение приборов, таймеры",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },

    // Быт и автоматизация
    {
        title: "Быт и автоматизация",
        possible: "Управление бытовой техникой — запуск робота-пылесоса, кофемашины по расписанию",
        available: {
            base: true,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Быт и автоматизация",
        possible: "Контроль протечек — датчики воды, автоматическое перекрытие кранов",
        available: {
            base: false,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Быт и автоматизация",
        possible: "Полив растений — автоматический полив по расписанию или влажности почвы",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },

    // Сценарии и интеграции
    {
        title: "Сценарии и интеграции",
        possible: "Голосовое управление — интеграция с Алисой, Салютом или другими ассистентами",
        available: {
            base: false,
            medium: true,
            ultra: true
        }
    },
    {
        title: "Сценарии и интеграции",
        possible: "Сценарии «одним касанием» — «Уехал» (выключить всё, закрыть окна), «Доброе утро» (открыть шторы, включить кофе)",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },

    // Бонус: премиум-функции
    {
        title: "Бонус: премиум-функции",
        possible: "Распознавание лиц — камера узнает членов семьи и гостей",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },
    {
        title: "Бонус: премиум-функции",
        possible: "Умный шлагбаум/ворота — автоматическое открытие при подъезде автомобиля",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    },
    {
        title: "Бонус: премиум-функции",
        possible: "Аналитика сна — датчики в спальне отслеживают температуру, шум, освещение для лучшего отдыха",
        available: {
            base: false,
            medium: false,
            ultra: true
        }
    }
];