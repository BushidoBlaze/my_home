import {LIST_ITEMS} from "../model/data.ts";

export default function DevicesDescription() {
    return (
        <div className="possibilities-devices__info">
            <h2 className="possibilities-devices__title">
                Работает на<br/>любом устройстве
            </h2>
            <p className="possibilities-devices__description">
                Доступно как на телефоне, так и на компьютере.<br/>
                Всё для жильцов и управляющих компаний.
                Синхронизация в реальном времени.
            </p>

            <ul className="possibilities-devices__list">
                {LIST_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                        <li key={item.text} className="possibilities-devices__list-item">
                            <Icon
                                className="possibilities-devices__list-icon"
                                size={16}
                                strokeWidth={1.5}
                            />
                            {item.text}
                        </li>
                    );
                })}
            </ul>
        </div>
    )
}