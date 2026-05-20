import type {JSX} from "react";
import {Pencil} from "lucide-react";
import {TICKET_INFO} from "../model/data.ts";

export default function Description(): JSX.Element {
    return (
        <section>
            <div className="td-section__head">
                <div className="t-eyebrow">Описание</div>
                <button className="btn btn--sm btn--ghost btn--icon">
                    <Pencil size={12}/>
                </button>
            </div>
            <div className="td-description">{TICKET_INFO.description}</div>

            <div className="td-photos">
                {Array.from({length: TICKET_INFO.photos}, (_, i) => i + 1).map(i => (
                    <div
                        key={i}
                        className="td-photo"
                        style={{
                            background: `repeating-linear-gradient(45deg, rgba(100, 116, 139, ${0.05 + i * 0.03}) 0 8px, #f8fafc 8px 16px)`,
                        }}
                    >
                        <span className="mono td-photo__name">фото-{i}.jpg</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
