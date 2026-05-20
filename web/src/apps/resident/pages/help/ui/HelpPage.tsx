import type {FormEvent, ReactNode} from "react";
import {
    AlertTriangle, BotMessageSquare, Bug, ClipboardList,
    Info, LifeBuoy, Mail, MessageSquare, Newspaper,
    Phone, Receipt, Settings2, ShoppingBag,
} from "lucide-react";
import {Link} from "react-router-dom";
import {useHelpPage} from "../hooks/useHelpPage.ts";
import "./HelpPage.css";

const FEATURE_ICONS: Record<string, ReactNode> = {
    requests: <ClipboardList size={18}/>,
    chats:    <MessageSquare size={18}/>,
    expenses: <Receipt size={18}/>,
    market:   <ShoppingBag size={18}/>,
    news:     <Newspaper size={18}/>,
    settings: <Settings2 size={18}/>,
};

export default function HelpPage() {
    const {
        content,
        loading,
        error,
        loadContent,
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

    const onSupportSubmit = (event: FormEvent) => {
        event.preventDefault();
        void submitSupportRequest();
    };

    const onBugSubmit = (event: FormEvent) => {
        event.preventDefault();
        void submitBugReport();
    };

    return (
        <div className="help-page">

            {/* Шапка */}
            <header className="help-page__header">
                <h1 className="help-page__title">Центр помощи</h1>
                <p className="help-page__subtitle">
                    Поддержка, возможности платформы и связь с командой Мой Дом
                </p>
            </header>

            {/* Состояния загрузки / ошибки */}
            {loading && <p className="help-page__loading">Загрузка справочного центра…</p>}
            {!loading && error && (
                <div className="help-page__error">
                    <span>{error}</span>
                    <button onClick={() => void loadContent()} className="help-page__retry">
                        Обновить
                    </button>
                </div>
            )}

            {/* Поддержка */}
            <section className="help-page__section">
                <div className="help-page__section-head">
                    <div className="help-page__section-icon"><LifeBuoy size={16}/></div>
                    <h2 className="help-page__section-title">Поддержка</h2>
                </div>

                <div className="help-page__cards help-page__cards--three">
                    <article className="help-page__card help-page__card--contact">
                        <div className="help-page__card-icon">
                            <BotMessageSquare size={20}/>
                        </div>
                        <h3 className="help-page__card-title">{content.contacts.operatorChatTitle}</h3>
                        <p className="help-page__card-desc">{content.contacts.operatorChatDescription}</p>
                        <span className="help-page__card-hours">{content.contacts.operatorChatHours}</span>
                        <Link to="/app/chats" className="help-page__link-btn">
                            Перейти в чат
                        </Link>
                    </article>

                    <article className="help-page__card help-page__card--contact">
                        <div className="help-page__card-icon">
                            <Mail size={20}/>
                        </div>
                        <h3 className="help-page__card-title">Email поддержки</h3>
                        <p className="help-page__card-desc">
                            Напишите нам, если вопрос требует деталей или скриншотов.
                        </p>
                        <a
                            href={`mailto:${content.contacts.supportEmail}`}
                            className="help-page__card-contact"
                        >
                            {content.contacts.supportEmail}
                        </a>
                    </article>

                    <article className="help-page__card help-page__card--contact">
                        <div className="help-page__card-icon">
                            <Phone size={20}/>
                        </div>
                        <h3 className="help-page__card-title">Горячая линия</h3>
                        <p className="help-page__card-desc">
                            Для срочных вопросов по безопасности и доступу в аккаунт.
                        </p>
                        <a
                            href={`tel:${content.contacts.hotlinePhone}`}
                            className="help-page__card-contact"
                        >
                            {content.contacts.hotlinePhone}
                        </a>
                    </article>
                </div>
            </section>

            {/* Возможности */}
            <section className="help-page__section">
                <div className="help-page__section-head">
                    <div className="help-page__section-icon"><Info size={16}/></div>
                    <h2 className="help-page__section-title">Возможности Мой Дом</h2>
                </div>

                <div className="help-page__cards help-page__cards--features">
                    {content.features.map(feature => (
                        <article className="help-page__card help-page__card--feature" key={feature.id}>
                            <div className="help-page__card-icon help-page__card-icon--sm">
                                {FEATURE_ICONS[feature.id] ?? <Info size={18}/>}
                            </div>
                            <h3 className="help-page__card-title">{feature.title}</h3>
                            <p className="help-page__card-desc">{feature.description}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Формы обращений */}
            <div className="help-page__forms-grid">
                <section className="help-page__section help-page__section--form">
                    <div className="help-page__section-head">
                        <div className="help-page__section-icon"><Mail size={16}/></div>
                        <h2 className="help-page__section-title">Форма обращения</h2>
                    </div>

                    <form className="help-page__form" onSubmit={onSupportSubmit}>
                        <label className="help-page__label">
                            Тема
                            <input
                                className="help-page__input"
                                value={supportForm.subject}
                                onChange={e => setSupportForm(prev => ({...prev, subject: e.target.value}))}
                                required
                                minLength={3}
                                maxLength={120}
                                placeholder="Кратко опишите тему"
                            />
                        </label>
                        <label className="help-page__label">
                            Сообщение
                            <textarea
                                className="help-page__input help-page__textarea"
                                value={supportForm.message}
                                onChange={e => setSupportForm(prev => ({...prev, message: e.target.value}))}
                                required
                                minLength={10}
                                maxLength={2000}
                                placeholder="Опишите ситуацию подробнее…"
                            />
                        </label>
                        <div className="help-page__form-row">
                            <label className="help-page__label">
                                Email для ответа
                                <input
                                    className="help-page__input"
                                    type="email"
                                    value={supportForm.contactEmail}
                                    onChange={e => setSupportForm(prev => ({...prev, contactEmail: e.target.value}))}
                                    required
                                    placeholder="you@example.com"
                                />
                            </label>
                            <label className="help-page__label">
                                <span>Телефон <span className="help-page__optional">(необязательно)</span></span>
                                <input
                                    className="help-page__input"
                                    value={supportForm.contactPhone ?? ""}
                                    onChange={e => setSupportForm(prev => ({...prev, contactPhone: e.target.value}))}
                                    placeholder="+7 (___) ___-__-__"
                                />
                            </label>
                        </div>
                        <button className="help-page__submit-btn" type="submit" disabled={supportSubmitting}>
                            {supportSubmitting ? "Отправляем…" : "Отправить обращение"}
                        </button>
                        {supportSuccess && <p className="help-page__success">{supportSuccess}</p>}
                    </form>
                </section>

                <section className="help-page__section help-page__section--form">
                    <div className="help-page__section-head">
                        <div className="help-page__section-icon help-page__section-icon--warn">
                            <Bug size={16}/>
                        </div>
                        <h2 className="help-page__section-title">Сообщить об ошибке</h2>
                    </div>

                    <form className="help-page__form" onSubmit={onBugSubmit}>
                        <label className="help-page__label">
                            Краткий заголовок проблемы
                            <input
                                className="help-page__input"
                                value={bugForm.title}
                                onChange={e => setBugForm(prev => ({...prev, title: e.target.value}))}
                                required
                                minLength={3}
                                maxLength={120}
                                placeholder="Например: не загружается раздел Расходы"
                            />
                        </label>
                        <label className="help-page__label">
                            Что произошло
                            <textarea
                                className="help-page__input help-page__textarea"
                                value={bugForm.description}
                                onChange={e => setBugForm(prev => ({...prev, description: e.target.value}))}
                                required
                                minLength={10}
                                maxLength={2000}
                                placeholder="Опишите ошибку как можно подробнее…"
                            />
                        </label>
                        <label className="help-page__label">
                            <span>Шаги для воспроизведения <span className="help-page__optional">(необязательно)</span></span>
                            <textarea
                                className="help-page__input help-page__textarea help-page__textarea--sm"
                                value={bugForm.stepsToReproduce ?? ""}
                                onChange={e => setBugForm(prev => ({...prev, stepsToReproduce: e.target.value}))}
                                placeholder="1. Открыть раздел…&#10;2. Нажать на…"
                            />
                        </label>
                        <label className="help-page__label">
                            <span>Контактный email <span className="help-page__optional">(необязательно)</span></span>
                            <input
                                className="help-page__input"
                                type="email"
                                value={bugForm.contactEmail ?? ""}
                                onChange={e => setBugForm(prev => ({...prev, contactEmail: e.target.value}))}
                                placeholder="you@example.com"
                            />
                        </label>
                        <button className="help-page__submit-btn" type="submit" disabled={bugSubmitting}>
                            {bugSubmitting ? "Отправляем…" : "Отправить баг-репорт"}
                        </button>
                        {bugSuccess && <p className="help-page__success">{bugSuccess}</p>}
                    </form>

                    <p className="help-page__hint">
                        <AlertTriangle size={14}/>
                        Если ошибка критическая — продублируйте сообщение на горячую линию.
                    </p>
                </section>
            </div>

            {/* О платформе */}
            <section className="help-page__about">
                <div className="help-page__about-inner">
                    <div className="help-page__about-text">
                        <p className="help-page__about-badge">О платформе</p>
                        <h3 className="help-page__about-title">{content.about.title}</h3>
                        <p className="help-page__about-desc">{content.about.description}</p>
                        <p className="help-page__about-desc">{content.about.mission}</p>
                    </div>
                    <span className="help-page__version">{content.about.version}</span>
                </div>
            </section>

        </div>
    );
}
