// Сегмент donut-диаграммы заявок
export interface DonutSegment {
    name: string;
    value: number;
    color: string;
}

// Столбец bar-чарта расходов ЖКХ
export interface BarItem {
    month: string;
    value: number;
}

// Строка прогресс-бара
export interface ProgressBar {
    label: string;
    value: number;
}
