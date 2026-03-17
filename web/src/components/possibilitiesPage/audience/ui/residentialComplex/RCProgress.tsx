import {PROGRESS_BARS} from "../../model/data.ts";

interface RCProgressProps {
    inView: boolean;
}

export default function RCProgress({inView}: RCProgressProps) {
    return (
        <div className="audience-rc-dashboard__progress-wrap">
            {PROGRESS_BARS.map((bar) => (
                <div key={bar.label} className="audience-rc-progress">
                    <div className="audience-rc-progress__header">
                        <span className="audience-rc-progress__label">{bar.label}</span>
                        <span className="audience-rc-progress__value">{bar.value}%</span>
                    </div>
                    <div className="audience-rc-progress__track">
                        {/* width анимируется через CSS transition когда inView true */}
                        <div
                            className="audience-rc-progress__fill"
                            style={{width: inView ? `${bar.value}%` : "0%"}}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}