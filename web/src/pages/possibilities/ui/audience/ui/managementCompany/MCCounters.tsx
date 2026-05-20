interface MCCountersProps {
    economy: number;
    satisfaction: number;
}

export default function MCCounters({economy, satisfaction}: MCCountersProps) {
    return (
        <div className="audience-mc-dashboard__counters">
            <div className="audience-mc-dashboard__counter">
                <span className="audience-mc-dashboard__counter-value">
                    {economy.toLocaleString("ru-RU")} ₽
                </span>
                <span className="audience-mc-dashboard__counter-label">экономия в год</span>
            </div>

            <div className="audience-mc-dashboard__counter">
                <span className="audience-mc-dashboard__counter-value">{satisfaction} %</span>
                <span className="audience-mc-dashboard__counter-label">довольных клиентов</span>
            </div>
        </div>
    );
}