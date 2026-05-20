// plugins
import {useState} from "react";
import {Search, SlidersHorizontal, ClipboardList, Loader2} from "lucide-react";

// hooks
import {useMarketplace} from "./hooks/useMarketplace.ts";
import {useServiceDetail} from "./hooks/useServiceDetail.ts";
import {useOrders} from "./hooks/useOrders.ts";

// ui
import {CategoryFilter} from "./ui/CategoryFilter.tsx";
import {ServiceCard} from "./ui/ServiceCard.tsx";
import {ServiceModal} from "./ui/ServiceModal.tsx";
import {OrderHistory} from "./ui/OrderHistory.tsx";
import {MyServicesModal} from "./ui/MyServicesModal.tsx";

// data
import {SORT_OPTIONS} from "./model/data.ts";

// styles
import "./Marketplace.css";

// Страница маркетплейса услуг
export default function Marketplace() {
    const {
        services,
        loading,
        error,
        category,
        setCategory,
        search,
        setSearch,
        sort,
        setSort,
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
        await open(service.id); // Перезагружаем детали чтобы показать новый отзыв
    }

    return (
        <div className="marketplace">

            {/* Шапка */}
            <div className="marketplace__header">
                <div>
                    <h1 className="marketplace__title">Маркетплейс</h1>
                    <p className="marketplace__subtitle">Услуги для вашего дома</p>
                </div>
                <div className="marketplace__header-actions">
                    <button
                        className={`marketplace__action-btn marketplace__my-services-btn ${showMyServices ? "marketplace__my-services-btn--active" : ""}`}
                        onClick={() => setShowMyServices(true)}
                    >
                        Мои услуги
                    </button>

                    <button
                        className="marketplace__action-btn marketplace__orders-btn"
                        onClick={() => setShowOrders(true)}
                    >
                        <ClipboardList size={18}/>
                        Мои заказы
                        {orders.filter(o => o.status === "Pending" || o.status === "Confirmed").length > 0 && (
                            <span className="marketplace__orders-badge">
                                {orders.filter(o => o.status === "Pending" || o.status === "Confirmed").length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Поиск и сортировка */}
            <div className="marketplace__toolbar">
                <div className="marketplace__search">
                    <Search size={16} className="marketplace__search-icon"/>
                    <input
                        className="marketplace__search-input"
                        placeholder="Поиск услуг..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="marketplace__sort-wrap">
                    <button
                        className="marketplace__sort-btn"
                        onClick={() => setShowSort(v => !v)}
                    >
                        <SlidersHorizontal size={16}/>
                        {SORT_OPTIONS.find(o => o.value === sort)?.label ?? "Сортировка"}
                    </button>

                    {showSort && (
                        <div className="marketplace__sort-dropdown">
                            {SORT_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    className={`marketplace__sort-option ${sort === opt.value ? "marketplace__sort-option--active" : ""}`}
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

            {/* Категории */}
            <CategoryFilter active={category} onChange={setCategory}/>

            {/* Состояния */}
            {loading && (
                <div className="marketplace__loading">
                    <Loader2 className="marketplace__spinner" size={24}/>
                    Загрузка услуг...
                </div>
            )}

            {error && <div className="marketplace__error">{error}</div>}

            {!loading && services.length === 0 && (
                <div className="marketplace__empty">
                    <span><Search size={64} strokeWidth={1.75}/></span>
                    <p>Услуги не найдены</p>
                </div>
            )}

            {/* Сетка услуг */}
            <div className="marketplace__grid">
                {services.map(service => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onOpen={open}
                    />
                ))}
            </div>

            {/* Детали услуги */}
            {service && (
                <ServiceModal
                    service={service}
                    onClose={close}
                    onOrder={handleOrder}
                    onReview={handleReview}
                />
            )}

            {/* История заказов */}
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