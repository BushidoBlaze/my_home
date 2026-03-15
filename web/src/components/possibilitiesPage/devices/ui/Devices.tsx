import DevicesDescription from "./DevicesDescription.tsx";
import DevicesMockups from "./DevicesMockups.tsx";
import DevicesTags from "./DevicesTags.tsx";
import "./Devices.css";

export default function Devices() {
    return (
        <div className="possibilities-devices" data-reveal>
            {/* Верхняя часть — текст + устройства */}
            <div className="possibilities-devices__top">

                {/*Текст слева*/}
                <DevicesDescription/>

                {/*Устройства справа*/}
                <DevicesMockups/>
            </div>

            {/*Тэги*/}
            <DevicesTags/>
        </div>
    );
}