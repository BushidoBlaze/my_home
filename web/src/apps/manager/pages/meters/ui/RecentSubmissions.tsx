import type {JSX} from "react";
import {RECENT_SUBMISSIONS} from "../model/data.ts";

export default function RecentSubmissions(): JSX.Element {
    return (
        <div className="card meters-recent">
            <div className="meters-recent__head">
                <div className="t-h3">Последние показания</div>
                <div className="meters-recent__sub">За сегодня</div>
            </div>

            <div className="meters-recent__list">
                {RECENT_SUBMISSIONS.map((r, i) => {
                    const SubIcon = r.icon;
                    return (
                        <div key={i} className="meters-recent__item">
                            <div
                                className="meters-recent__icon"
                                style={{
                                    background: `rgba(${parseInt(r.color.slice(1, 3), 16)}, ${parseInt(r.color.slice(3, 5), 16)}, ${parseInt(r.color.slice(5, 7), 16)}, 0.12)`,
                                    color: r.color,
                                }}
                            >
                                <SubIcon size={15}/>
                            </div>
                            <div className="meters-recent__main">
                                <div className="tnum meters-recent__meta">{r.time} · {r.meter}</div>
                                <div className="meters-recent__apt">{r.apt}</div>
                            </div>
                            <div className="meters-recent__values">
                                <div className="tnum mono meters-recent__val">{r.val}</div>
                                <div
                                    className="tnum meters-recent__delta"
                                    style={{color: r.flag ? "#f59e0b" : "#64748b"}}
                                >
                                    {r.flag ? "⚠ " : ""}{r.delta}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
