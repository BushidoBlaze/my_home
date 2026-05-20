import {useState} from "react";
import {NavLink} from "react-router";
import {ChevronLeft, ChevronDown, House, Search, Settings as SettingsIcon} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {MANAGER_MENU_GROUPS, MANAGER_BRAND, MANAGER_USER} from "../model/data.ts";
import "./ManagerSidebar.css";

export default function ManagerSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside className={collapsed ? "msb msb--collapsed" : "msb"}>
            <div className="msb__inner">
                <div className="msb__brand">
                    <div className="msb__brand-logo">
                        <House size={20} style={{color: "#10b981"}}/>
                    </div>
                    <div className="msb__brand-text">
                        <div className="msb__brand-title">{MANAGER_BRAND.name}</div>
                        <div className="msb__brand-sub">{MANAGER_BRAND.subtitle}</div>
                    </div>
                    <ChevronDown size={14} style={{color: "#64748b"}}/>
                </div>

                <div className="msb__search">
                    <Search size={14} style={{color: "#64748b"}}/>
                    <span className="msb__search-placeholder">Поиск…</span>
                </div>

                <nav className="msb__nav">
                    {MANAGER_MENU_GROUPS.map(group => (
                        <div key={group.title} className="msb__group">
                            <div className="t-eyebrow msb__group-title">{group.title}</div>
                            {group.items.map(item => {
                                const ItemIcon = item.icon;
                                return (
                                    <NavLink
                                        key={item.id}
                                        to={item.path}
                                        data-tooltip={item.label}
                                        className={({isActive}) =>
                                            isActive ? "msb__item msb__item--active" : "msb__item"
                                        }
                                    >
                                        {({isActive}) => (
                                            <>
                                                <ItemIcon
                                                    size={17}
                                                    style={{color: isActive ? "#10b981" : "#64748b"}}
                                                />
                                                <span className="msb__item-label">{item.label}</span>
                                                {item.badge === "new" ? (
                                                    <span className="chip chip--emerald msb__item-badge-new">NEW</span>
                                                ) : typeof item.badge === "number" ? (
                                                    <span className="msb__item-badge">{item.badge}</span>
                                                ) : null}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="msb__footer">
                    <div className="msb__user">
                        <Avatar name={MANAGER_USER.name} size={32}/>
                        <div className="msb__user-text">
                            <div className="msb__user-name">{MANAGER_USER.name}</div>
                            <div className="msb__user-role">{MANAGER_USER.role}</div>
                        </div>
                        <SettingsIcon size={16} style={{color: "#64748b"}}/>
                    </div>
                </div>
            </div>

            <button
                className="msb__toggle"
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
