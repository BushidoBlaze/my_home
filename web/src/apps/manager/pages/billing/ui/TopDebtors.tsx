import type {JSX} from "react";
import {Send} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {DEBTORS} from "../model/data.ts";

export default function TopDebtors(): JSX.Element {
    return (
        <div className="card billing-debtors">
            <div className="billing-debtors__head">
                <div>
                    <div className="t-h3">Топ должников</div>
                    <div className="billing-debtors__sub">Долг более 30 дней</div>
                </div>
                <button className="btn btn--sm btn--primary">Отправить уведомления</button>
            </div>

            <div className="billing-debtors__list">
                {DEBTORS.map((d, i) => (
                    <div key={i} className="billing-debtors__item">
                        <Avatar name={d.name} size={32}/>
                        <div className="billing-debtors__main">
                            <div className="billing-debtors__name">{d.name}</div>
                            <div className="billing-debtors__addr">{d.addr}</div>
                        </div>
                        <div className="billing-debtors__amount">
                            <div className="tnum billing-debtors__debt">{d.debt}</div>
                            <div className="billing-debtors__months">{d.months} мес.</div>
                        </div>
                        <button className="btn btn--icon btn--sm">
                            <Send size={13}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
