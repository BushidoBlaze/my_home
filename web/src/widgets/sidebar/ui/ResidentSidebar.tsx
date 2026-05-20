import {NavLink} from "react-router";
import {RESIDENT_MENU} from "../model/data";
import "./Sidebar.css";

export default function ResidentSidebar() {
    return (
        <aside className="sidebar">
            <nav className="sidebar__nav">
                {RESIDENT_MENU.map((item, i) => {
                    const Icon = item.icon;

                    return (
                        <div key={i} className="sidebar__item">
                            <NavLink
                                to={item.path}
                                className={({isActive}) =>
                                    isActive
                                        ? "sidebar__link sidebar__link--active"
                                        : "sidebar__link"
                                }
                            >
                                <Icon className="sidebar__icon" size={22}/>
                                <span className="sidebar__tooltip">
                                    {item.label}
                                </span>
                            </NavLink>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}