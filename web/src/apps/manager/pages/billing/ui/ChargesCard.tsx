import type {JSX} from "react";
import BillingChart from "./BillingChart.tsx";
import type {BillingChartPoint} from "@/api/managerBilling.api.ts";

interface Props {
    data: BillingChartPoint[];
}

export default function ChargesCard({data}: Props): JSX.Element {
    return (
        <div className="card billing-charges">
            <div className="billing-charges__head">
                <div>
                    <div className="t-h3">Начислено / поступило по месяцам</div>
                    <div className="billing-charges__sub">Последние {data.length} мес.</div>
                </div>
                <div className="billing-charges__legend">
                    <div className="billing-charges__legend-item">
                        <span className="billing-charges__legend-swatch" style={{background: "#0ea5e9"}}/>
                        Начислено
                    </div>
                    <div className="billing-charges__legend-item">
                        <span className="billing-charges__legend-swatch" style={{background: "#10b981"}}/>
                        Поступило
                    </div>
                </div>
            </div>
            <BillingChart data={data}/>
        </div>
    );
}
