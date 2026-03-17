import {BarChart, Bar, XAxis, ResponsiveContainer, Tooltip} from "recharts";
import {BAR_DATA} from "../../model/data.ts";

interface RCGraphProps {
    inView: boolean; // управляет запуском анимации столбцов
}

export default function RCGraph({inView}: RCGraphProps) {
    return (
        <div className="audience-rc-dashboard__chart-wrap">
            <p className="audience-dashboard__chart-title">Расходы ЖКХ, ₽</p>
            <ResponsiveContainer width={310} height={230}>
                <BarChart
                    data={BAR_DATA}
                    barSize={24}
                    margin={{
                        top: 4,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }}>

                    <XAxis
                        dataKey="month"
                        tick={{
                            fontFamily: "Inter",
                            fontSize: 13,
                            fill: "rgba(255, 255, 255, 0.8)"
                        }}
                    />

                    <Tooltip
                        contentStyle={{
                            width: "100px",

                            fontFamily: "Inter",
                            fontSize: "12px",

                            background: "#f5f5f5",

                            border: "1px solid rgba(0,0,0,0.08)",
                            borderRadius: "8px",

                            outline: "none"
                        }}
                        itemStyle={{
                            color: "#000000",
                            fontFamily: "Inter",
                            fontSize: "14px"
                        }}

                        // formatter: [отображаемое значение, название серии (пустая строка = скрыть)]
                        formatter={(v) => v != null ? [`${Number(v).toLocaleString("ru-RU")} ₽`, ""] : ["", ""]}
                        cursor={{
                            fill: "none"
                        }}
                    />

                    <Bar
                        dataKey="value"
                        radius={[4, 4, 0, 0]}
                        fill="rgba(245,245,245,0.3)"
                        animationBegin={inView ? 0 : 99999}
                        animationDuration={800}
                        activeBar={{
                            fill: "rgba(245,245,245,0.6)"
                        }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}