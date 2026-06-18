import type {JSX} from "react";
import {BuildingSwatch} from "@/shared/ui/BuildingSwatch/BuildingSwatch.tsx";
import type {BuildingListItem, HouseTone} from "@/api/managerBuildings.api.ts";

const TONE_COLOR: Record<HouseTone, string> = {
    danger: "#ef4444",
    warning: "#f59e0b",
    ok: "#10b981",
};

const TONE_LABEL: Record<HouseTone, string> = {
    danger: "Авария",
    warning: "Внимание",
    ok: "Норма",
};

const TONE_CHIP: Record<HouseTone, string> = {
    danger: "danger",
    warning: "warning",
    ok: "emerald",
};

function flagChipClass(flag: string): string {
    if (flag === "долг") return "chip--danger";
    if (flag === "заявки") return "chip--warning";
    if (flag === "новый") return "chip--emerald";
    return "";
}

interface Props {
    houses: BuildingListItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    formatMoney: (amount: number) => string;
    formatArea: (m2: number) => string;
}

export default function HousesTable({houses, selectedId, onSelect, formatMoney, formatArea}: Props): JSX.Element {
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
                    {houses.map(h => (
                        <tr
                            key={h.id}
                            className={h.id === selectedId ? "bd-table__row bd-table__row--selected" : "bd-table__row"}
                            onClick={() => onSelect(h.id)}
                            style={{cursor: "pointer"}}
                        >
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
                                <span className="bd-table__series">{h.series ?? "—"}</span>
                                <span className="bd-table__year">· {h.year}</span>
                            </td>
                            <td className="tnum">{h.apartmentsTotal}</td>
                            <td>{formatArea(h.areaTotal)}</td>
                            <td>
                                <span
                                    className="tnum bd-table__debt"
                                    style={{
                                        color: h.debt === 0 ? "#64748b" : "#ef4444",
                                        fontWeight: h.debt === 0 ? 400 : 600,
                                    }}
                                >
                                    {formatMoney(h.debt)}
                                </span>
                            </td>
                            <td><span className="tnum">{h.openTickets}</span></td>
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
