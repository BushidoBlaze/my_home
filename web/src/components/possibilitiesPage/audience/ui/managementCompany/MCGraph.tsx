import {PieChart, Pie, Cell, Tooltip, ResponsiveContainer} from "recharts";
import {DONUT_DATA} from "../../model/data.ts";

interface MCGraphProps {
    inView: boolean; // управляет запуском анимации диаграммы
}

export default function MCGraph({inView}: MCGraphProps) {
    return (
        <div className="audience-mc-dashboard__chart-wrap">
            <p className="audience-dashboard__chart-title">Заявки по статусам</p>
            <ResponsiveContainer width={300} height={230}>
                <PieChart>
                    <Pie
                        data={DONUT_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={55} // радиус отверстия — увеличь чтобы кольцо стало тоньше
                        outerRadius={85}
                        paddingAngle={1.6} // зазор между сегментами в градусах
                        dataKey="value"
                        animationBegin={inView ? 0 : 99999} // 99999 = анимация не запускается
                        animationDuration={1200}
                    >
                        {/* Cell задаёт цвет каждого сегмента из DONUT_DATA */}
                        {DONUT_DATA.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="none"/>
                        ))}
                    </Pie>

                    <Tooltip
                        contentStyle={{
                            color: "#ffffff",
                            background: "rgba(255,255,255,0.08)",
                            fontSize: "14px",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "8px",
                        }}
                        itemStyle={{
                            color: "#ffffff",
                            fontFamily: "Inter",
                            fontSize: "14px"
                    }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Легенда под графиком — рендерится из тех же данных что и Pie */}
            <div className="audience-mc-dashboard__legend">
                {DONUT_DATA.map((d) => (
                    <div key={d.name} className="audience-mc-dashboard__legend-item">
                        <span className="audience-mc-dashboard__legend-dot" style={{background: d.color}}/>
                        <span className="audience-mc-dashboard__legend-label">{d.name}</span>
                        <span className="audience-mc-dashboard__legend-value">{d.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}