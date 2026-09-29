interface ApartmentStatProps {
    label: string; // название - Подъезд / Этаж / Жильцы / Комнаты*/
    value: string; // значение - N / N / N / N
}

// Статистика жил. площади - Подъезд / Этаж / Жильцы / Комнаты*/
export function ApartmentStat({label, value}: ApartmentStatProps) {
    return (
        <div className="resident-home__apartment-stat">
            <div className="resident-home__apartment-stat-label">
                {label}
            </div>
            <div className="resident-home__apartment-stat-value">
                {value}
            </div>
        </div>
    );
}
