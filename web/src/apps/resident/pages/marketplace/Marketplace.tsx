// plugins
import {useState, type JSX} from "react";
import {Search, SlidersHorizontal, ClipboardList, Loader2, Star, ShieldCheck, Wallet, MapPin} from "lucide-react";

// data
import {SORT_OPTIONS} from "./model/data.ts";

// hooks
import {useMarketplace} from "./hooks/useMarketplace.ts";
import {useServiceDetail} from "./hooks/useServiceDetail.ts";
import {useOrders} from "./hooks/useOrders.ts";
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import {CategoryFilter} from "./ui/CategoryFilter.tsx";
import {ServiceCard} from "./ui/ServiceCard.tsx";
import {ServiceModal} from "./ui/ServiceModal.tsx";
import {OrderHistory} from "./ui/OrderHistory.tsx";
import {MyServicesModal} from "./ui/MyServicesModal.tsx";
import ResidentTopBar from "@/apps/resident/_shared/ResidentTopBar.tsx";

// styles
import "./Marketplace.css";

const QUICK_TAGS = ["Клининг", "Мастер на час", "Сборка мебели", "Доставка воды", "Окна", "Прочистка засора"];

export default function Marketplace(): JSX.Element {
    useDocumentTitle('Сервисы и услуги');

    const {
        services, loading, error,
        category, setCategory,
        search, setSearch,
        sort, setSort,
    } = useMarketplace();

    const {service, open, close, createOrder, addReview} = useServiceDetail();
    const {orders, loading: ordersLoading, cancel, reload: reloadOrders} = useOrders();

    const [showOrders, setShowOrders] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showMyServices, setShowMyServices] = useState(false);

    async function handleOrder(scheduledAt: Date, comment: string) {
        if (!service) return;
        await createOrder(service.id, scheduledAt, comment);
        await reloadOrders();
    }

    async function handleReview(rating: number, comment: string) {
        if (!service) return;
        await addReview(service.id, rating, comment);
        await open(service.id);
    }

    const activeOrders = orders.filter(o => o.status === "Pending" || o.status === "Confirmed").length;

    return (
        <div className="r-market">
            <ResidentTopBar
                title="Маркетплейс услуг"
                subtitle="Проверенные мастера и сервисы для вашего дома"
                right={
                    <>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setShowMyServices(true)}
                        >
                            <Star size={14}/> Мои услуги
                        </button>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setShowOrders(true)}
                        >
                            <ClipboardList size={14}/>
                            Мои заказы
                            {activeOrders > 0 && (
                                <span className="r-market__orders-badge">{activeOrders}</span>
                            )}
                        </button>
                    </>
                }
            />

            <div className="r-market__content">

                {/* Hero search */}
                <section className="r-market__hero">
                    <div className="r-market__hero-text">
                        <h2 className="r-market__hero-title">Что нужно сделать дома?</h2>
                        <p className="r-market__hero-sub">
                            Проверенные мастера и сервисы · средний рейтинг 4.8
                        </p>

                        <div className="r-market__search-bar">
                            <Search size={17} style={{color: "#64748b"}}/>
                            <input
                                className="r-market__search-input"
                                placeholder="Уборка после ремонта, доставка воды, мастер на час…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <button type="button" className="btn btn--primary">Найти</button>
                        </div>

                        <div className="r-market__quick-tags">
                            <span className="r-market__quick-tags-label">Часто ищут:</span>
                            {QUICK_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className="r-market__quick-tag"
                                    onClick={() => setSearch(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Карточка-преимущества справа — заполняет свободную половину hero */}
                    <aside className="r-market__hero-aside" aria-hidden="true">
                        <span className="r-market__hero-aside-eyebrow">Сервис для жильцов</span>
                        <ul className="r-market__hero-benefits">
                            <li className="r-market__hero-benefit">
                                <span className="r-market__hero-benefit-ic"><ShieldCheck size={15}/></span>
                                Проверенные исполнители
                            </li>
                            <li className="r-market__hero-benefit">
                                <span className="r-market__hero-benefit-ic"><Wallet size={15}/></span>
                                Прозрачные цены без доплат
                            </li>
                            <li className="r-market__hero-benefit">
                                <span className="r-market__hero-benefit-ic"><MapPin size={15}/></span>
                                Мастера из вашего района
                            </li>
                        </ul>
                    </aside>
                </section>

                {/* Toolbar: categories + sort */}
                <div className="r-market__toolbar">
                    <CategoryFilter active={category} onChange={setCategory}/>

                    <div className="r-market__sort-wrap">
                        <button
                            type="button"
                            className="btn btn--sm btn--ghost"
                            onClick={() => setShowSort(v => !v)}
                        >
                            <SlidersHorizontal size={13}/>
                            {SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Сортировка"}
                        </button>

                        {showSort && (
                            <div className="r-market__sort-dropdown">
                                {SORT_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        className={"r-market__sort-option" + (sort === opt.value ? " r-market__sort-option--active" : "")}
                                        onClick={() => {
                                            setSort(opt.value);
                                            setShowSort(false);
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* States */}
                {loading && (
                    <div className="r-market__state">
                        <Loader2 className="r-market__spinner" size={24}/>
                        Загружаем услуги…
                    </div>
                )}

                {error && (
                    <div className="r-market__state r-market__state--error">{error}</div>
                )}

                {!loading && !error && services.length === 0 && (
                    <div className="r-market__empty">
                        <Search size={48} strokeWidth={1.5}/>
                        <p className="r-market__empty-text">Услуги не найдены</p>
                        <p className="r-market__empty-sub">Попробуйте другой запрос или категорию</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && services.length > 0 && (
                    <div className="r-market__grid">
                        {services.map(s => (
                            <ServiceCard key={s.id} service={s} onOpen={open}/>
                        ))}
                    </div>
                )}
            </div>

            {service && (
                <ServiceModal
                    service={service}
                    onClose={close}
                    onOrder={handleOrder}
                    onReview={handleReview}
                />
            )}

            {showOrders && (
                <OrderHistory
                    orders={orders}
                    loading={ordersLoading}
                    onCancel={cancel}
                    onClose={() => setShowOrders(false)}
                />
            )}

            {showMyServices && (
                <MyServicesModal onClose={() => setShowMyServices(false)}/>
            )}
        </div>
    );
}
