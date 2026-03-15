import {DEVICES} from "../model/data.ts";

export default function DevicesMockups() {
    return (
        <div className="possibilities-devices__mockups">
            {/*Уствойства*/}
            {DEVICES.map((device) => (
                <div
                    key={device.name}
                    className={`possibilities-devices__device possibilities-devices__device--${device.type}`}
                >
                    <img
                        src={device.imageUrl}
                        alt={device.name}
                        className="possibilities-devices__device-images"
                    />
                </div>
            ))}
        </div>
    )
}