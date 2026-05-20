import type {JSX} from "react";
import {MoreHorizontal} from "lucide-react";
import {Donut} from "@/shared/ui/Donut/Donut.tsx";
import {Spark} from "@/shared/ui/Spark/Spark.tsx";
import {COLLECTIONS} from "../model/data.ts";

export default function CollectionsCard(): JSX.Element {
    const remaining = 100 - COLLECTIONS.actualPct;

    return (
        <div className="card home-collections">
            <div className="home-collections__head">
                <div>
                    <div className="t-h3">Сборы за май</div>
                    <div className="home-section-sub">Начисления / поступления</div>
                </div>
                <button className="btn btn--sm btn--ghost btn--icon">
                    <MoreHorizontal size={14}/>
                </button>
            </div>

            <div className="home-collections__body">
                <Donut
                    segments={[
                        {value: COLLECTIONS.actualPct, color: "#10b981"},
                        {value: remaining, color: "#f1f5f9"},
                    ]}
                    center={{value: `${COLLECTIONS.actualPct}%`, label: `ПЛАН ${COLLECTIONS.plan}%`}}
                    size={130}
                    thickness={14}
                />

                <div className="home-collections__rows">
                    <div className="home-collections__row">
                        <span className="home-collections__label">Начислено</span>
                        <span className="tnum home-collections__value">{COLLECTIONS.accrued}</span>
                    </div>
                    <div className="home-collections__row">
                        <span className="home-collections__label">Поступило</span>
                        <span
                            className="tnum home-collections__value"
                            style={{color: "#047857"}}
                        >
                            {COLLECTIONS.received}
                        </span>
                    </div>
                    <div className="home-collections__row">
                        <span className="home-collections__label">Задолженность</span>
                        <span
                            className="tnum home-collections__value"
                            style={{color: "#ef4444"}}
                        >
                            {COLLECTIONS.debt}
                        </span>
                    </div>
                    <div className="home-collections__spark">
                        <Spark data={COLLECTIONS.trend} w={220} h={28}/>
                    </div>
                </div>
            </div>
        </div>
    );
}
