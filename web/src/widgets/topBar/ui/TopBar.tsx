import {useEffect, useRef, useState, type JSX, type ReactNode} from "react";
import {useNavigate} from "react-router-dom";
import {Search, Bell, X, ChevronRight} from "lucide-react";
import "./TopBar.css";

interface TopBarProps {
    title: string;
    subtitle?: string;
    children?: ReactNode;
    action?: ReactNode;
}

/** Демо-уведомления — позже заменим на API. */
const DEMO_NOTIFICATIONS = [
    {id: 1, time: "11:42", title: "Заявка Т-4458 закрыта", desc: "Светильник в подъезде, Лесная 2", tone: "ok"},
    {id: 2, time: "11:31", title: "Оплата 4 320 ₽", desc: "Е. Соколова · Содержание · апрель", tone: "info"},
    {id: 3, time: "10:58", title: "Авария Т-4471", desc: "Течь стояка ХВС, Берёзовая 14", tone: "danger"},
    {id: 4, time: "10:02", title: "Голосование", desc: "«Шлагбаум во дворе» — 67% кворум", tone: "info"},
] as const;

const TONE_COLOR: Record<string, string> = {
    ok: "#047857",
    info: "#0ea5e9",
    danger: "#ef4444",
};

export default function TopBar({title, subtitle, children, action}: TopBarProps): JSX.Element {
    const [searchOpen, setSearchOpen] = useState(false);
    const [bellOpen, setBellOpen] = useState(false);
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    const searchRef = useRef<HTMLDivElement | null>(null);
    const bellRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    // Закрытие popover-ов при клике снаружи.
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
            }
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setBellOpen(false);
            }
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    // Автофокус инпута при открытии поиска.
    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus();
    }, [searchOpen]);

    const submitSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const q = query.trim();
        if (!q) return;
        // Поиск пока ведёт на список заявок с query-параметром.
        navigate(`/manager/tickets?q=${encodeURIComponent(q)}`);
        setSearchOpen(false);
        setQuery("");
    };

    return (
        <header className="tbar">
            <div className="tbar__title-wrap">
                <div className="tbar__title">{title}</div>
                {subtitle && <div className="tbar__subtitle">{subtitle}</div>}
            </div>

            {children}

            <div className="tbar__actions">
                <form
                    ref={searchRef}
                    onSubmit={submitSearch}
                    className={"tbar__search-box" + (searchOpen ? " tbar__search-box--open" : "")}
                >
                    <input
                        ref={searchInputRef}
                        className="tbar__search-input"
                        type="text"
                        value={query}
                        placeholder="Поиск по заявкам, домам, жильцам…"
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => { if (e.key === "Escape") setSearchOpen(false); }}
                        tabIndex={searchOpen ? 0 : -1}
                        aria-hidden={!searchOpen}
                    />
                    <button
                        type="button"
                        className="btn btn--icon btn--ghost tbar__search-btn"
                        onClick={() => { setSearchOpen(v => !v); setBellOpen(false); }}
                        aria-label="Поиск"
                    >
                        {searchOpen ? <X size={17}/> : <Search size={17}/>}
                    </button>
                </form>

                <div className="tbar__pop-wrap" ref={bellRef}>
                    <button
                        className="btn btn--icon btn--ghost tbar__bell"
                        onClick={() => { setBellOpen(v => !v); setSearchOpen(false); }}
                        aria-label="Уведомления"
                    >
                        <Bell size={17}/>
                        <span className="tbar__bell-dot"/>
                    </button>
                    {bellOpen && (
                        <div className="tbar__pop tbar__pop--bell">
                            <div className="tbar__pop-head">
                                <div className="tbar__pop-title">Уведомления</div>
                                <button type="button" className="tbar__pop-close" onClick={() => setBellOpen(false)}>
                                    <X size={14}/>
                                </button>
                            </div>
                            <ul className="tbar__notifs">
                                {DEMO_NOTIFICATIONS.map(n => (
                                    <li key={n.id} className="tbar__notif">
                                        <span className="tbar__notif-dot" style={{background: TONE_COLOR[n.tone]}}/>
                                        <div className="tbar__notif-main">
                                            <div className="tbar__notif-title">{n.title}</div>
                                            <div className="tbar__notif-desc">{n.desc}</div>
                                        </div>
                                        <div className="tbar__notif-time">{n.time}</div>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                className="tbar__pop-foot"
                                onClick={() => { setBellOpen(false); navigate("/manager/chat"); }}
                            >
                                Открыть журнал <ChevronRight size={12}/>
                            </button>
                        </div>
                    )}
                </div>

                <div className="tbar__divider"/>
                {action}
            </div>
        </header>
    );
}
