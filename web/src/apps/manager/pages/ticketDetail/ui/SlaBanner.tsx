import type {JSX} from "react";
import {AlertTriangle} from "lucide-react";
import {TICKET_INFO} from "../model/data.ts";

export default function SlaBanner(): JSX.Element {
    return (
        <div className="td-sla">
            <div className="td-sla__icon">
                <AlertTriangle size={18}/>
            </div>
            <div className="td-sla__text">
                <div className="td-sla__title">{TICKET_INFO.slaBreach}</div>
                <div className="td-sla__sub">{TICKET_INFO.slaNote}</div>
            </div>
            <button className="btn btn--sm">Продлить SLA</button>
        </div>
    );
}
