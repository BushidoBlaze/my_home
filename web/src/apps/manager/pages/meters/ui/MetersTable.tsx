import type {JSX} from "react";
import {ChevronRight} from "lucide-react";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import type {MeterHouseRow} from "@/api/managerMeter.api.ts";

function flagChipClass(flag?: string | null): string {
    if (flag === "риск") return "chip--danger";
    if (flag === "медленно") return "chip--warning";
    return "";
}

interface Props {
    houses: MeterHouseRow[];
    selectedId: string | null;
    onSelect: (house: MeterHouseRow) => void;
}

export default function MetersTable({houses, selectedId, onSelect}: Props): JSX.Element {
    return (
        <div className="card meters-table-wrap">
            <table className="meters-table">
                <thead>
                    <tr>
                        <th>Дом</th>
                        <th>Квартир</th>
                        <th>Передано</th>
                        <th>ХВС</th>
                        <th>ГВС</th>
                        <th>Эл-во</th>
                        <th>Прогресс</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {houses.map(h => (
                        <tr
                            key={h.id}
                            onClick={() => onSelect(h)}
                            style={{
                                cursor: "pointer",
                                background: h.id === selectedId ? "#f8fafc" : undefined
                            }}
                        >
                            <td>
                                <div className="meters-table__addr">
                                    <BuildingSwatch size={26} color={h.tone}/>
                                    <span className="meters-table__addr-text">{h.addr}</span>
                                    {h.flag && (
                                        <span className={"chip meters-table__flag " + flagChipClass(h.flag)}>
                                            {h.flag}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="tnum">{h.apartments}</td>
                            <td>
                                <span className="tnum meters-table__done">{h.done}</span>
                            </td>
                            <td className="tnum meters-table__cell">{h.cold}</td>
                            <td className="tnum meters-table__cell">{h.hot}</td>
                            <td className="tnum meters-table__cell">{h.el}</td>
                            <td>
                                <div className="meters-table__bar">
                                    <div className="meters-table__bar-fill">
                                        <Progress value={h.pct} color={h.tone} h={4}/>
                                    </div>
                                    <span className="tnum meters-table__pct">{h.pct}%</span>
                                </div>
                            </td>
                            <td>
                                <button className="btn btn--sm btn--ghost">
                                    квартиры <ChevronRight size={11}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
