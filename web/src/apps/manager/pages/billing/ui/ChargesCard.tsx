import type {JSX} from "react";
import BillingChart from "./BillingChart.tsx";

export default function ChargesCard(): JSX.Element {
    return (
        <div className="card billing-charges">
            <div className="billing-charges__head">
                <div>
                    <div className="t-h3">Начислено / поступило по месяцам</div>
                    <div className="billing-charges__sub">Последние 12 месяцев</div>
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
            <BillingChart/>
        </div>
    );
}
