import type {JSX, ReactNode} from "react";
import {Search, Bell} from "lucide-react";
import "./TopBar.css";

interface TopBarProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    action?: ReactNode;
}

export default function TopBar({title, subtitle, children, action}: TopBarProps): JSX.Element {
    return (
        <header className="tbar">
            <div className="tbar__title-wrap">
                <div className="tbar__title">{title}</div>
                {subtitle && <div className="tbar__subtitle">{subtitle}</div>}
            </div>

            {children}

            <div className="tbar__actions">
                <button className="btn btn--icon btn--ghost">
                    <Search size={17}/>
                </button>
                <button className="btn btn--icon btn--ghost tbar__bell">
                    <Bell size={17}/>
                    <span className="tbar__bell-dot"/>
                </button>
                <div className="tbar__divider"/>
                {action}
            </div>
        </header>
    );
}
