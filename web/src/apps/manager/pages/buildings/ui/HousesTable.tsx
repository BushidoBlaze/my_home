import type {JSX} from "react";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import type {House} from "../model/types.ts";
import {HOUSES} from "../model/data.ts";

const TONE_COLOR: Record<House["tone"], string> = {
    danger: "#ef4444",
    warning: "#f59e0b",
    ok: "#10b981",
};

const TONE_LABEL: Record<House["tone"], string> = {
    danger: "Авария",
    warning: "Внимание",
    ok: "Норма",
};

const TONE_CHIP: Record<House["tone"], string> = {
    danger: "danger",
    warning: "warning",
    ok: "emerald",
};

function flagChipClass(flag: string): string {
    if (flag === "авария") return "chip--danger";
    if (flag === "лифт") return "chip--warning";
    if (flag === "новый") return "chip--emerald";
    return "";
}

export default function HousesTable(): JSX.Element {
    return (
        <div className="bd-table-wrap">
            <table className="bd-table">
                <thead>
                    <tr>
                        <th>Адрес</th>
                        <th>Серия / год</th>
                        <th>Кв.</th>
                        <th>Площадь</th>
                        <th>Долг</th>
                        <th>Открытые</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    {HOUSES.map(h => (
                        <tr key={h.id} className={h.selected ? "bd-table__row bd-table__row--selected" : "bd-table__row"}>
                            <td>
                                <div className="bd-table__addr">
                                    <BuildingSwatch size={32} color={TONE_COLOR[h.tone]}/>
                                    <div>
                                        <div className="bd-table__addr-text">{h.addr}</div>
                                        <div className="bd-table__flags">
                                            {h.flags.map((f, i) => (
                                                <span key={i} className={"chip bd-table__flag " + flagChipClass(f)}>
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span className="bd-table__series">П-44Т</span>
                                <span className="bd-table__year">· {h.year}</span>
                            </td>
                            <td className="tnum">{h.apts}</td>
                            <td>{h.area}</td>
                            <td>
                                <span
                                    className="tnum bd-table__debt"
                                    style={{
                                        color: h.debt === "0 ₽" ? "#64748b" : "#ef4444",
                                        fontWeight: h.debt === "0 ₽" ? 400 : 600,
                                    }}
                                >
                                    {h.debt}
                                </span>
                            </td>
                            <td><span className="tnum">{h.open}</span></td>
                            <td>
                                <span className={"chip chip--" + TONE_CHIP[h.tone]}>
                                    <span className="chip__dot"/>{TONE_LABEL[h.tone]}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
