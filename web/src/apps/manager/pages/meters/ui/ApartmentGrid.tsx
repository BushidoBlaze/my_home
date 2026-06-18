import type {JSX} from "react";
import {Check} from "lucide-react";
import type {MeterApartmentItem} from "@/api/managerMeter.api.ts";

function Legend({swatch, label}: {swatch: string; label: string}): JSX.Element {
    return (
        <span className="meters-apts__legend-item">
            <span className="meters-apts__legend-swatch" style={{background: swatch}}/>
            {label}
        </span>
    );
}

interface Props {
    apartments: MeterApartmentItem[];
    loading: boolean;
}

export default function ApartmentGrid({apartments, loading}: Props): JSX.Element {
    if (loading) {
        return <div style={{padding: 24, color: "#64748b", fontSize: 13}}>Загружаем квартиры…</div>;
    }
    if (apartments.length === 0) {
        return (
            <div style={{padding: 24, color: "#64748b", fontSize: 13}}>
                В этом доме нет зарегистрированных жильцов в системе.
            </div>
        );
    }

    // Группируем по подъезду; внутри — сортируем по этажу и номеру квартиры.
    const byEntrance = new Map<string, MeterApartmentItem[]>();
    for (const a of apartments) {
        const e = a.entrance || "—";
        if (!byEntrance.has(e)) byEntrance.set(e, []);
        byEntrance.get(e)!.push(a);
    }

    return (
        <div>
            <div className="meters-apts__legend">
                <Legend swatch="#10b981" label="передано"/>
                <Legend swatch="#f1f5f9" label="не передано"/>
            </div>

            {Array.from(byEntrance.entries()).map(([entrance, list]) => (
                <div key={entrance} style={{marginTop: 16}}>
                    <div style={{fontSize: 12, color: "#64748b", marginBottom: 8}}>
                        Подъезд {entrance} · {list.length} {pluralRu(list.length, "квартира", "квартиры", "квартир")}
                    </div>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(56px, 1fr))",
                        gap: 6
                    }}>
                        {list.map(a => (
                            <div
                                key={a.userId}
                                title={`${a.fullName} · кв. ${a.apartment ?? "—"}${a.lastAt ? ` · сдано ${new Date(a.lastAt).toLocaleString("ru-RU", {day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"})}` : ""}`}
                                style={{
                                    background: a.delivered ? "#10b981" : "#f1f5f9",
                                    color: a.delivered ? "#ffffff" : "#64748b",
                                    borderRadius: 6,
                                    padding: "8px 4px",
                                    textAlign: "center",
                                    fontSize: 11,
                                    fontWeight: 600,
                                    position: "relative",
                                    minHeight: 32,
                                }}
                            >
                                кв. {a.apartment ?? "?"}
                                {a.delivered && (
                                    <Check size={9} strokeWidth={3} style={{position: "absolute", top: 4, right: 4}}/>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="meters-apts__foot">
                <span>{apartments.length} {pluralRu(apartments.length, "квартира", "квартиры", "квартир")} показано</span>
                <span>{apartments.filter(a => a.delivered).length} сдали</span>
            </div>
        </div>
    );
}

function pluralRu(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}
