// plugins
import {useCallback, useEffect, useState, type JSX} from "react";
import {Plus} from "lucide-react";

// api
import {managerBuildingsApi, type BuildingListItem, type BuildingDetail} from "@/api/managerBuildings.api.ts";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import BuildingsFilters from "./ui/BuildingsFilters.tsx";
import HousesTable from "./ui/HousesTable.tsx";
import HouseDetail from "./ui/HouseDetail.tsx";
import CreateBuildingModal from "./ui/CreateBuildingModal.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";

// styles
import "./Buildings.css";

function moneyShort(amount: number): string {
    if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} млн ₽`;
    if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(0)} тыс ₽`;
    return `${amount.toFixed(0)} ₽`;
}

function areaShort(m2: number): string {
    if (m2 >= 1_000) return `${m2.toLocaleString("ru-RU", {maximumFractionDigits: 0})} м²`;
    return `${m2.toFixed(0)} м²`;
}

export default function Buildings(): JSX.Element {
    useDocumentTitle('Дома и квартиры');

    const [houses, setHouses] = useState<BuildingListItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [detail, setDetail] = useState<BuildingDetail | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);

    const fetchHouses = useCallback(async (selectId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const list = await managerBuildingsApi.list();
            setHouses(list);
            if (selectId) {
                setSelectedId(selectId);
            } else if (list.length > 0 && !selectedId) {
                setSelectedId(list[0].id);
            } else if (list.length === 0) {
                setSelectedId(null);
            }
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
            setHouses(null);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { void fetchHouses(); }, [fetchHouses]);

    async function handleDelete(id: string) {
        if (!window.confirm("Удалить этот дом из реестра? Жильцов это не затронет.")) return;
        try {
            await managerBuildingsApi.remove(id);
            if (selectedId === id) setSelectedId(null);
            await fetchHouses();
        } catch (e) {
            alert(e instanceof Error ? e.message : "Не удалось удалить дом");
        }
    }

    useEffect(() => {
        if (!selectedId) { setDetail(null); return; }
        setDetailLoading(true);
        managerBuildingsApi.getById(selectedId)
            .then(setDetail)
            .catch(() => setDetail(null))
            .finally(() => setDetailLoading(false));
    }, [selectedId]);

    const subtitle = !houses
        ? (loading ? "загрузка…" : "ошибка загрузки")
        : (() => {
            const apts = houses.reduce((s, h) => s + h.apartmentsTotal, 0);
            const residents = houses.reduce((s, h) => s + h.residentsCount, 0);
            return `${houses.length} ${pluralRu(houses.length, "дом", "дома", "домов")} · ` +
                   `${apts.toLocaleString("ru-RU")} ${pluralRu(apts, "квартира", "квартиры", "квартир")} · ` +
                   `${residents.toLocaleString("ru-RU")} ${pluralRu(residents, "житель", "жителя", "жителей")}`;
        })();

    return (
        <>
            <TopBar
                title="Дома и квартиры"
                subtitle={subtitle}
                action={
                    <button className="btn btn--primary" onClick={() => setShowCreate(true)}>
                        <Plus size={13}/>
                        Добавить дом
                    </button>
                }
            />

            <BuildingsFilters/>

            {loading && (
                <div style={{padding: 24}}>
                    <DataLoading label="Загружаем дома…"/>
                </div>
            )}

            {!loading && error && (
                <div style={{padding: 24}}>
                    <DataError
                        title="Не удалось загрузить дома"
                        message="Бэкенд недоступен. Проверьте подключение и попробуйте снова."
                        onRetry={fetchHouses}
                    />
                </div>
            )}

            {!loading && !error && houses && (
                <div className="bd-layout">
                    <HousesTable
                        houses={houses}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                        formatMoney={moneyShort}
                        formatArea={areaShort}
                    />
                    <HouseDetail
                        detail={detail}
                        loading={detailLoading}
                        formatMoney={moneyShort}
                        formatArea={areaShort}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            {showCreate && (
                <CreateBuildingModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(id) => {
                        setShowCreate(false);
                        void fetchHouses(id);
                    }}
                />
            )}
        </>
    );
}

function pluralRu(n: number, one: string, few: string, many: string): string {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
    return many;
}
