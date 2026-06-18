import type {JSX} from "react";
import {Link} from "react-router-dom";
import {Building2, Key, MapPinHouse, Users} from "lucide-react";
import type {User} from "@/api/users.api.ts";
import {ApartmentStat} from "./ApartmentStat.tsx";

interface ApartmentBlockProps {
    // user может быть null до первого ответа API — компонент должен корректно отрисоваться
    // с прочерками и заглушкой "Адрес не указан".
    user: User | null;
}

// Зелёная карточка-герой с информацией о квартире пользователя.
// Полностью статична по бизнес-логике: данные приходят из профиля, действия — заглушки-навигация.
export function ApartmentBlock({user}: ApartmentBlockProps): JSX.Element {
    // Адрес показываем только когда заполнены и улица, и дом — иначе плейсхолдер,
    // чтобы не было кривых строк вроде ", 14" или "Улица, ".
    const address = user?.street && user?.house
        ? `${user.street}, ${user.house}`
        : "Адрес не указан";

    // Площадь — опциональная часть строки. Не показываем " · undefined м²", если её нет.
    const info = user?.apartmentNumber
        ? `Квартира ${user.apartmentNumber}${user.area ? ` · ${user.area} м²` : ""}`
        : "Квартира не привязана";

    return (
        <div className="resident-home__apartment">
            {/* Декоративная иконка в правом углу карточки — фоновый паттерн, не интерактивна */}
            <MapPinHouse className="resident-home__apartment-pattern" size={48} strokeWidth={0.5}/>

            <div className="resident-home__apartment-inner">
                <div className="resident-home__apartment-eyebrow">
                    <span className="t-eyebrow resident-home__apartment-label">Ваша квартира</span>
                </div>

                <div>
                    <div className="resident-home__apartment-address">{address}</div>
                    <div className="resident-home__apartment-info">{info}</div>
                </div>

                {/* 4 статистики через вертикальные сепараторы. "—" — fallback для пустых значений */}
                <div className="resident-home__apartment-stats">
                    <ApartmentStat label="Подъезд" value={user?.entrance || "—"}/>
                    <span className="resident-home__apartment-separator"/>
                    <ApartmentStat label="Этаж" value={user?.floor || "—"}/>
                    <span className="resident-home__apartment-separator"/>
                    <ApartmentStat label="Жильцов" value={user?.residents?.toString() || "—"}/>
                    <span className="resident-home__apartment-separator"/>
                    <ApartmentStat label="Комнат" value={user?.rooms?.toString() || "—"}/>
                </div>

                {/* Кнопки-ссылки. "Соседи" и "Документы" ведут на /account (раздел в профиле),
                    "О доме" — на /help (статья FAQ). Бэкенда для соседей/документов пока нет. */}
                <div className="resident-home__apartment-actions">
                    <Link to="/resident/account"
                          className="resident-home__apartment-button resident-home__apartment-button--primary">
                        <Users size={14}/> Соседи
                    </Link>
                    <Link to="/resident/account" className="resident-home__apartment-button">
                        <Key size={14}/> Документы
                    </Link>
                    <Link to="/resident/help" className="resident-home__apartment-button">
                        <Building2 size={14}/> О доме
                    </Link>
                </div>
            </div>
        </div>
    );
}
