// plugins
import {useState, type FormEvent, type JSX} from "react";
import {Link} from "react-router-dom";
import {
    HelpCircle, Search, MessageCircle, Phone, Send, Sparkles, Wallet, ClipboardList, Droplet, Vote, Store, User,
    AlertTriangle, ChevronRight
} from "lucide-react";

// hooks
import {useHelpPage} from "../hooks/useHelpPage.ts";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui-components
import ResidentTopBar from "@/apps/resident/_shared/ResidentTopBar.tsx";

// styles
import "./HelpPage.css";

const HERO_TAGS = ["Сдать показания", "Автоплатёж", "Сменить контакт", "Открыть спор по счёту", "Пригласить семью"];

const KB_CATEGORIES = [
    {icon: Wallet, title: "Оплата ЖКУ", count: 18, sub: "Способы, автоплатёж, квитанции, споры", fg: "#047857"},
    {icon: ClipboardList, title: "Заявки", count: 14, sub: "Создание, сроки, статусы, отмена", fg: "#0369a1"},
    {icon: Droplet, title: "Показания", count: 9, sub: "Когда передавать, ошибки, ИПУ", fg: "#6d28d9"},
    {icon: Vote, title: "Голосования", count: 11, sub: "Кворум, как голосовать, протоколы", fg: "#b45309"},
    {icon: Store, title: "Маркетплейс", count: 16, sub: "Заказ, оплата, отмена, споры", fg: "#334155"},
    {icon: User, title: "Профиль и семья", count: 12, sub: "Контакты, доступ, приглашение", fg: "#ef4444"},
] as const;

const STATUS_ITEMS = [
    {name: "Кабинет", ok: true},
    {name: "Платежи СберPay", ok: true},
    {name: "Чаты", ok: true},
    {name: "Маркетплейс", ok: false},
] as const;

export default function HelpPage(): JSX.Element {
    useDocumentTitle('Поддержка');

    const {
        content,
        supportForm,
        setSupportForm,
        bugForm,
        setBugForm,
        supportSubmitting,
        bugSubmitting,
        supportSuccess,
        bugSuccess,
        submitSupportRequest,
        submitBugReport,
    } = useHelpPage();

    const [searchQuery, setSearchQuery] = useState("");
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [showBugForm, setShowBugForm] = useState(false);

    const onSupportSubmit = (e: FormEvent) => {
        e.preventDefault();
        void submitSupportRequest();
    };

    const onBugSubmit = (e: FormEvent) => {
        e.preventDefault();
        void submitBugReport();
    };

    const faqs = [
        {q: "Когда нужно передать показания счётчиков?", a: "Показания принимаются с 20-го по 25-е число каждого месяца. Если передадите позже — расчёт пройдёт по средним за полгода."},
        {q: "Как подключить автоплатёж?", a: "В разделе «Расходы» → вкладка «Автоплатёж». Можно настроить и по сумме, и по дате."},
        {q: "Что делать, если в счёте ошибка?", a: "Откройте спор в карточке счёта — кнопка «Сообщить об ошибке». УК ответит в течение 3 рабочих дней."},
        {q: "Как пригласить родственников в кабинет?", a: "Профиль → «Семья и доступ» → «Пригласить». Каждый член семьи получит свой логин и сможет видеть только нужные разделы."},
        {q: "Сколько хранится история?", a: "Все начисления, заявки и голосования — 5 лет. Квитанции — бессрочно."},
    ];
    const hotline = content?.contacts?.hotlinePhone ?? "+7 (800) 555-12-34";
    const supportEmail = content?.contacts?.supportEmail ?? "support@myhome.app";

    return (
        <div className="r-help">
            <ResidentTopBar
                title="Центр помощи"
                subtitle="Найдите ответ, напишите оператору или сообщите об ошибке"
            />

            <div className="r-help__content">

                {/* Hero search */}
                <div className="r-help__hero">
                    <svg className="r-help__hero-pattern" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                        <circle cx="50" cy="50" r="70" stroke="white" strokeWidth=".5"/>
                        <circle cx="50" cy="50" r="28" stroke="white" strokeWidth=".5"/>
                        <circle cx="50" cy="50" r="16" stroke="white" strokeWidth=".5"/>
                        <circle cx="50" cy="50" r="4" fill="white"/>
                    </svg>

                    <div className="r-help__hero-inner">
                        <div className="r-help__hero-eyebrow">
                            <HelpCircle size={14}/> Чем можем помочь?
                        </div>
                        <h2 className="r-help__hero-title">База знаний и поддержка «Мой Дом»</h2>
                        <p className="r-help__hero-sub">
                            Средний ответ оператора — 3 минуты. Большинство вопросов решает база знаний.
                        </p>

                        <form
                            className="r-help__search-bar"
                            onSubmit={e => e.preventDefault()}
                        >
                            <Search size={18} style={{color: "#64748b"}}/>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Как сдать показания счётчика?"
                            />
                            <button type="submit" className="btn btn--primary">Найти ответ</button>
                        </form>

                        <div className="r-help__hero-tags">
                            <span className="r-help__hero-tags-label">Популярно:</span>
                            {HERO_TAGS.map(tag => (
                                <button key={tag} type="button" className="r-help__hero-tag">{tag}</button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact lanes */}
                <div className="r-help__lanes">
                    <ContactLane
                        icon={MessageCircle}
                        bg="#d1fae5" fg="#047857"
                        title="Чат с оператором"
                        sub="Быстро · ежедневно 08:00–22:00"
                        hint="Сейчас отвечают за 2 минуты"
                        live
                        cta="Перейти в чат"
                        ctaIcon={ChevronRight}
                        to="/resident/chats"
                    />
                    <ContactLane
                        icon={Phone}
                        bg="#e0f2fe" fg="#0369a1"
                        title="Горячая линия"
                        sub="Срочные вопросы по доступу"
                        hint={`${hotline} · круглосуточно`}
                        cta="Позвонить"
                        ctaIcon={Phone}
                        href={`tel:${hotline.replace(/[^+\d]/g, "")}`}
                    />
                    <ContactLane
                        icon={Send}
                        bg="#ede9fe" fg="#6d28d9"
                        title="Email-обращение"
                        sub="Если нужны скриншоты или детали"
                        hint={`${supportEmail} · ответ 1 раб. день`}
                        cta="Написать"
                        ctaIcon={Send}
                        href={`mailto:${supportEmail}`}
                    />
                </div>

                {/* Knowledge base */}
                <section className="r-help__section">
                    <div className="r-help__section-head">
                        <div>
                            <h3 className="r-help__section-title">База знаний</h3>
                            <p className="r-help__section-sub">{KB_CATEGORIES.reduce((s, c) => s + c.count, 0)} статей · обновлено сегодня</p>
                        </div>
                    </div>

                    <div className="r-help__kb-grid">
                        {KB_CATEGORIES.map(cat => {
                            const Icon = cat.icon;
                            return (
                                <button key={cat.title} type="button" className="r-help__kb-item">
                                    <div
                                        className="r-help__kb-icon"
                                        style={{background: `color-mix(in srgb, ${cat.fg} 14%, transparent)`, color: cat.fg}}
                                    >
                                        <Icon size={18}/>
                                    </div>
                                    <div className="r-help__kb-body">
                                        <div className="r-help__kb-title">
                                            {cat.title}
                                            <span className="r-help__kb-count">· {cat.count}</span>
                                        </div>
                                        <div className="r-help__kb-sub">{cat.sub}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* FAQ + side */}
                <section className="r-help__split">

                    <div className="r-help__faq">
                        <div className="r-help__section-head">
                            <div>
                                <h3 className="r-help__section-title">Часто спрашивают</h3>
                                <p className="r-help__section-sub">Кликните на вопрос, чтобы развернуть ответ</p>
                            </div>
                        </div>

                        <ul className="r-help__faq-list">
                            {faqs.map((qa, i) => {
                                const open = openFaq === i;
                                return (
                                    <li key={i} className="r-help__faq-item">
                                        <button
                                            type="button"
                                            className="r-help__faq-q"
                                            onClick={() => setOpenFaq(open ? null : i)}
                                        >
                                            <HelpCircle size={15} style={{color: "#10b981", flexShrink: 0}}/>
                                            <span className="r-help__faq-q-text">{qa.q}</span>
                                            <ChevronRight
                                                size={14}
                                                style={{
                                                    color: "#94a3b8",
                                                    transform: open ? "rotate(90deg)" : undefined,
                                                    transition: "transform 0.12s",
                                                }}
                                            />
                                        </button>
                                        {open && (
                                            <div className="r-help__faq-a">{qa.a}</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Side: status + bug */}
                    <div className="r-help__side">
                        <div className="r-help__status">
                            <div className="r-help__status-head">
                                <span className="r-help__status-dot"/>
                                <span className="r-help__status-title">Все сервисы работают</span>
                            </div>
                            <ul className="r-help__status-list">
                                {STATUS_ITEMS.map(s => (
                                    <li key={s.name} className="r-help__status-row">
                                        <span
                                            className="r-help__status-dot-sm"
                                            style={{background: s.ok ? "#10b981" : "#f59e0b"}}
                                        />
                                        <span className="r-help__status-name">{s.name}</span>
                                        <span
                                            className="r-help__status-state"
                                            style={{color: s.ok ? "#64748b" : "#b45309"}}
                                        >
                                            {s.ok ? "норма" : "повышенные задержки"}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="r-help__bug">
                            <div className="r-help__bug-head">
                                <div className="r-help__bug-icon"><AlertTriangle size={16}/></div>
                                <div className="r-help__bug-title">Сообщить об ошибке</div>
                            </div>
                            <p className="r-help__bug-sub">
                                Заметили баг? Дайте знать — мы пришлём фикс в письме, как только починим.
                            </p>
                            <button
                                type="button"
                                className="btn btn--primary"
                                style={{width: "100%", justifyContent: "center"}}
                                onClick={() => setShowBugForm(v => !v)}
                            >
                                <Send size={14}/> {showBugForm ? "Закрыть форму" : "Открыть форму"}
                            </button>
                            {showBugForm && (
                                <form onSubmit={onBugSubmit} className="r-help__bug-form">
                                    <input
                                        type="text"
                                        className="r-help__input"
                                        placeholder="Короткое название проблемы"
                                        value={bugForm.title}
                                        onChange={e => setBugForm({...bugForm, title: e.target.value})}
                                        required
                                    />
                                    <input
                                        type="email"
                                        className="r-help__input"
                                        placeholder="Email для ответа"
                                        value={bugForm.contactEmail ?? ""}
                                        onChange={e => setBugForm({...bugForm, contactEmail: e.target.value})}
                                    />
                                    <textarea
                                        className="r-help__input r-help__textarea"
                                        placeholder="Что не работает? Что вы делали, что ожидали?"
                                        rows={4}
                                        value={bugForm.description}
                                        onChange={e => setBugForm({...bugForm, description: e.target.value})}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn--primary"
                                        disabled={bugSubmitting}
                                    >
                                        <Send size={13}/> {bugSubmitting ? "Отправляем…" : "Отправить"}
                                    </button>
                                    {bugSuccess && <div className="r-help__form-success">Спасибо! Мы получили ваше сообщение.</div>}
                                </form>
                            )}
                        </div>

                        <div className="r-help__about">
                            <div className="t-eyebrow">О платформе</div>
                            <div className="r-help__about-title">«Мой Дом» — единое цифровое пространство</div>
                            <p className="r-help__about-text">
                                Делаем управление домом прозрачным и удобным: меньше звонков, больше понятных действий.
                            </p>
                            <div className="r-help__about-meta">
                                <span>v 2.4.1</span>
                                <span>·</span>
                                <span>backend v1.0</span>
                                <span>·</span>
                                <Link to="/" className="r-help__about-link">Соглашение</Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Optional contact form below */}
                <section className="r-help__section">
                    <div className="r-help__section-head">
                        <div>
                            <h3 className="r-help__section-title">Связаться с поддержкой</h3>
                            <p className="r-help__section-sub">Опишите вопрос — оператор ответит на указанный email</p>
                        </div>
                        <Sparkles size={16} style={{color: "#10b981"}}/>
                    </div>

                    <form className="r-help__support-form" onSubmit={onSupportSubmit}>
                        <div className="r-help__support-grid">
                            <input
                                type="email"
                                className="r-help__input"
                                placeholder="Email для ответа"
                                value={supportForm.contactEmail}
                                onChange={e => setSupportForm({...supportForm, contactEmail: e.target.value})}
                                required
                            />
                            <input
                                type="tel"
                                className="r-help__input"
                                placeholder="Телефон (опционально)"
                                value={supportForm.contactPhone ?? ""}
                                onChange={e => setSupportForm({...supportForm, contactPhone: e.target.value})}
                            />
                        </div>
                        <input
                            type="text"
                            className="r-help__input"
                            placeholder="Тема"
                            value={supportForm.subject}
                            onChange={e => setSupportForm({...supportForm, subject: e.target.value})}
                            required
                        />
                        <textarea
                            className="r-help__input r-help__textarea"
                            placeholder="Опишите ваш вопрос…"
                            rows={4}
                            value={supportForm.message}
                            onChange={e => setSupportForm({...supportForm, message: e.target.value})}
                            required
                        />
                        <div className="r-help__support-actions">
                            <button type="submit" className="btn btn--primary" disabled={supportSubmitting}>
                                <Send size={14}/> {supportSubmitting ? "Отправляем…" : "Отправить обращение"}
                            </button>
                            {supportSuccess && (
                                <span className="r-help__form-success">Спасибо! Оператор свяжется в течение рабочего дня.</span>
                            )}
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}

interface ContactLaneProps {
    icon: typeof MessageCircle;
    bg: string;
    fg: string;
    title: string;
    sub: string;
    hint: string;
    cta: string;
    ctaIcon: typeof MessageCircle;
    live?: boolean;
    to?: string;
    href?: string;
    onClick?: () => void;
}

function ContactLane({icon: Icon, bg, fg, title, sub, hint, cta, ctaIcon: CtaIcon, live, to, href, onClick}: ContactLaneProps): JSX.Element {
    const ctaButton = (
        <button type="button" className="btn btn--primary" style={{width: "100%", justifyContent: "center"}} onClick={onClick}>
            <CtaIcon size={14}/> {cta}
        </button>
    );

    return (
        <div className="r-help__lane">
            <div className="r-help__lane-head">
                <div className="r-help__lane-icon" style={{background: bg, color: fg}}>
                    <Icon size={20}/>
                </div>
                <div className="r-help__lane-text">
                    <div className="r-help__lane-title">
                        {title}
                        {live && (
                            <span className="r-help__lane-live">
                                <span className="r-help__lane-live-dot"/> сейчас на связи
                            </span>
                        )}
                    </div>
                    <div className="r-help__lane-sub">{sub}</div>
                </div>
            </div>

            <div className="r-help__lane-hint">{hint}</div>

            {to
                ? <Link to={to} className="btn btn--primary" style={{width: "100%", justifyContent: "center"}}>
                    <CtaIcon size={14}/> {cta}
                </Link>
                : href
                    ? <a href={href} className="btn btn--primary" style={{width: "100%", justifyContent: "center"}}>
                        <CtaIcon size={14}/> {cta}
                    </a>
                    : ctaButton}
        </div>
    );
}
