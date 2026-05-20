import type {JSX} from "react";
import {Stat} from "@/shared/ui/Stat/Stat.tsx";
import {HOME_STATS} from "../model/data.ts";

export default function StatRow(): JSX.Element {
    return (
        <div className="home-stats">
            {HOME_STATS.map(stat => (
                <Stat
                    key={stat.id}
                    icon={stat.icon}
                    accent={stat.accent}
                    label={stat.label}
                    value={stat.value}
                    delta={stat.delta}
                    deltaDir={stat.deltaDir}
                    sub={stat.sub}
                />
            ))}
        </div>
    );
}
