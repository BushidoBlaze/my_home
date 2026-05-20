import type {JSX} from "react";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {TOP_BUILDINGS} from "../model/data.ts";

export default function TopBuildings(): JSX.Element {
    return (
        <div className="card home-top-buildings">
            <div className="home-top-buildings__head">
                <div className="t-h3">Топ домов по обращениям</div>
                <span className="home-top-buildings__period">7 дней</span>
            </div>

            <div className="home-top-buildings__list">
                {TOP_BUILDINGS.map((h, i) => (
                    <div key={i}>
                        <div className="home-top-buildings__row">
                            <div className="home-top-buildings__addr">
                                <BuildingSwatch size={22} color={h.tone}/>
                                <span>{h.addr}</span>
                            </div>
                            <span className="tnum home-top-buildings__count">{h.count}</span>
                        </div>
                        <Progress value={h.count} max={h.max} color={h.tone} h={4}/>
                    </div>
                ))}
            </div>
        </div>
    );
}
