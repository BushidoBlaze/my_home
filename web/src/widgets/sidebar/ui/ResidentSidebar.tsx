import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {ChevronLeft, House} from "lucide-react";
import {RESIDENT_MENU, RESIDENT_MENU_BOTTOM} from "../model/data.ts";
import type {SidebarItem} from "../model/types.ts";
import {useResidentBadges} from "../hooks/useResidentBadges.ts";
import "./ResidentSidebar.css";

// Сайдбар кабинета жителя. Сворачивается в узкую полоску с иконками по клику на круглую
// кнопку справа от панели — поведение идентично ManagerSidebar для единообразия UX.
// Состояние collapsed локальное: при перезагрузке возвращается развёрнутый вид.
export default function ResidentSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const badges = useResidentBadges();

    // Пункт "Выход" — единственный, у которого нет реального маршрута, он сбрасывает токен.
    // Остальные NavLink-и просто навигируют.
    const handleClick = (path: string) => {
        if (path === "/login") {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            navigate("/login");
        }
    };

    return (
        <aside className={collapsed ? "rsb rsb--collapsed" : "rsb"}>
            <div className="rsb__inner">
                {/* Brand */}
                <div className="rsb__brand">
                    <div className="rsb__brand-logo">
                        <House size={20} style={{color: "#047857"}}/>
                    </div>
                    <div className="rsb__brand-text">
                        <div className="rsb__brand-name">Мой Дом</div>
                        <div className="rsb__brand-sub">ЖК «Зелёный квартал»</div>
                    </div>
                </div>

                {/* Main nav */}
                <nav className="rsb__nav">
                    {RESIDENT_MENU.map(item => (
                        <NavItem key={item.path} item={item} badge={badges[item.path] ?? item.badge}/>
                    ))}
                </nav>

                <div className="rsb__divider"/>

                {/* Bottom nav: профиль, помощь, выход */}
                <nav className="rsb__nav rsb__nav--bottom">
                    {RESIDENT_MENU_BOTTOM.map(item => (
                        <NavItem
                            key={item.path}
                            item={item}
                            muted
                            onClick={() => handleClick(item.path)}
                        />
                    ))}
                </nav>
            </div>

            {/* Круглая кнопка-toggle, торчит на половину за правую границу панели */}
            <button
                type="button"
                className="rsb__toggle"
                onClick={() => setCollapsed(c => !c)}
                aria-label={collapsed ? "Развернуть меню" : "Свернуть меню"}
            >
                <ChevronLeft
                    size={14}
                    strokeWidth={2}
                    style={{
                        color: "#64748b",
                        transform: collapsed ? "rotate(180deg)" : "none",
                        transition: "transform 0.25s",
                    }}
                />
            </button>
        </aside>
    );
}

interface NavItemProps {
    item: SidebarItem;
    muted?: boolean;
    onClick?: () => void;
    // Бейдж может переопределяться реальным счётчиком из useResidentBadges;
    // если не передан — берём статический из самого пункта меню (например, "new").
    badge?: number | "new";
}

// Один пункт меню. В свёрнутом состоянии всплывающий тултип с label рендерится через
// data-tooltip + CSS ::after (без JS), см. .rsb--collapsed .rsb__item[data-tooltip]:hover.
function NavItem({item, muted, onClick, badge = item.badge}: NavItemProps) {
    const Icon = item.icon;
    return (
        <NavLink
            to={item.path}
            onClick={onClick}
            data-tooltip={item.label}
            className={({isActive}) =>
                "rsb__item" +
                (isActive ? " rsb__item--active" : "") +
                (muted ? " rsb__item--muted" : "")
            }
            // end={true} нужен только для "Главной", иначе её активный стиль остаётся
            // включённым на всех вложенных страницах /resident/*.
            end={item.path === "/resident/home"}
        >
            <Icon size={18} className="rsb__item-icon"/>
            <span className="rsb__item-label">{item.label}</span>
            {badge === "new" && <span className="rsb__item-badge rsb__item-badge--new">NEW</span>}
            {typeof badge === "number" && (
                <span className="rsb__item-badge rsb__item-badge--num">{badge}</span>
            )}
        </NavLink>
    );
}
