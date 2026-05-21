import {useEffect, useRef, useState} from "react";
import {NavLink, useNavigate} from "react-router";
import {
    ChevronLeft, ChevronDown, House, Search, Settings as SettingsIcon,
    User as UserIcon, LogOut,
} from "lucide-react";
import {Avatar} from "@/shared/ui/Avatar/Avatar.tsx";
import {MANAGER_MENU_GROUPS, MANAGER_BRAND, MANAGER_USER} from "../model/data.ts";
import "./ManagerSidebar.css";

export default function ManagerSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState("");
    const [profileOpen, setProfileOpen] = useState(false);
    const navigate = useNavigate();
    const footerRef = useRef<HTMLDivElement | null>(null);

    // Закрываем dropdown при клике вне его.
    useEffect(() => {
        if (!profileOpen) return;
        const onClickOutside = (e: MouseEvent) => {
            if (footerRef.current && !footerRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [profileOpen]);

    // Фильтрация пунктов меню по тексту поиска.
    const q = search.trim().toLowerCase();
    const filteredGroups = q
        ? MANAGER_MENU_GROUPS
            .map(g => ({...g, items: g.items.filter(i => i.label.toLowerCase().includes(q))}))
            .filter(g => g.items.length > 0)
        : MANAGER_MENU_GROUPS;

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    return (
        <aside className={collapsed ? "msb msb--collapsed" : "msb"}>
            <div className="msb__inner">
                <button
                    type="button"
                    className="msb__brand msb__brand--btn"
                    onClick={() => navigate("/manager/buildings")}
                    title="Переключить дом"
                >
                    <div className="msb__brand-logo">
                        <House size={20} style={{color: "#10b981"}}/>
                    </div>
                    <div className="msb__brand-text">
                        <div className="msb__brand-title">{MANAGER_BRAND.name}</div>
                        <div className="msb__brand-sub">{MANAGER_BRAND.subtitle}</div>
                    </div>
                    <ChevronDown size={14} style={{color: "#64748b"}}/>
                </button>

                <div className="msb__search">
                    <Search size={14} style={{color: "#64748b"}}/>
                    <input
                        type="text"
                        className="msb__search-input"
                        placeholder="Поиск…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <nav className="msb__nav">
                    {filteredGroups.length === 0 ? (
                        <div className="msb__empty">Ничего не найдено</div>
                    ) : (
                        filteredGroups.map(group => (
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
                        ))
                    )}
                </nav>

                <div className="msb__footer" ref={footerRef}>
                    <button
                        type="button"
                        className="msb__user msb__user--btn"
                        onClick={() => setProfileOpen(v => !v)}
                    >
                        <Avatar name={MANAGER_USER.name} size={32}/>
                        <div className="msb__user-text">
                            <div className="msb__user-name">{MANAGER_USER.name}</div>
                            <div className="msb__user-role">{MANAGER_USER.role}</div>
                        </div>
                        <SettingsIcon size={16} style={{color: "#64748b"}}/>
                    </button>

                    {profileOpen && (
                        <div className="msb__menu">
                            <button
                                type="button"
                                className="msb__menu-item"
                                onClick={() => {
                                    setProfileOpen(false);
                                    navigate("/manager/account");
                                }}
                            >
                                <UserIcon size={14}/> Профиль
                            </button>
                            <button
                                type="button"
                                className="msb__menu-item msb__menu-item--danger"
                                onClick={handleLogout}
                            >
                                <LogOut size={14}/> Выход
                            </button>
                        </div>
                    )}
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
