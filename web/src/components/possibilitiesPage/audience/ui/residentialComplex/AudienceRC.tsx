import {useInView} from "../../hooks/useInView.ts";
import RCContent from "./RCContent.tsx";
import RCGraph from "./RCGraph.tsx";
import RCProgress from "./RCProgress.tsx";

export default function AudienceRC() {
    // inView пробрасывается в граф и прогресс-бары для запуска анимаций
    const [ref, inView] = useInView<HTMLDivElement>();

    return (
        <div className="possibilities-audience__block possibilities-audience__block--light" ref={ref}>
            <RCContent/>
            <div className="audience-rc-dashboard">
                <RCGraph inView={inView}/>
                <RCProgress inView={inView}/>
            </div>
        </div>
    );
}