// plugins
import {useCallback, useEffect, useState, type JSX} from "react";
import {Upload, Plus} from "lucide-react";

// api
import {
    managerMeterApi,
    type MeterSummary, type MeterHouseRow, type MeterRecentItem, type MeterApartmentItem
} from "@/api/managerMeter.api.ts";

// hooks
import {useDocumentTitle} from "@/shared/hooks/useDocumentTitle.ts";

// ui
import TopBar from "@/widgets/topBar/ui/TopBar.tsx";
import MetersHero from "./ui/MetersHero.tsx";
import MetersFilters from "./ui/MetersFilters.tsx";
import MetersTable from "./ui/MetersTable.tsx";
import ApartmentGrid from "./ui/ApartmentGrid.tsx";
import RecentSubmissions from "./ui/RecentSubmissions.tsx";
import {DataError, DataLoading} from "@/apps/manager/pages/home/ui/DataState.tsx";

// styles
import "./Meters.css";

export default function Meters(): JSX.Element {
    useDocumentTitle('Показания счётчиков');

    const [summary, setSummary] = useState<MeterSummary | null>(null);
    const [houses, setHouses] = useState<MeterHouseRow[] | null>(null);
    const [recent, setRecent] = useState<MeterRecentItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [selectedHouse, setSelectedHouse] = useState<MeterHouseRow | null>(null);
    const [apartments, setApartments] = useState<MeterApartmentItem[]>([]);
    const [aptsLoading, setAptsLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [s, h, r] = await Promise.all([
                managerMeterApi.summary(),
                managerMeterApi.houses(),
                managerMeterApi.recent(20),
            ]);
            setSummary(s);
            setHouses(h);
            setRecent(r);
            // По умолчанию открываем первый дом, который в реестре.
            if (h.length > 0 && !selectedHouse) setSelectedHouse(h[0]);
        } catch (e) {
            setError(e instanceof Error ? e : new Error(String(e)));
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { void fetchAll(); }, [fetchAll]);

    useEffect(() => {
        if (!selectedHouse) { setApartments([]); return; }
        setAptsLoading(true);
        managerMeterApi.apartments(selectedHouse.id)
            .then(setApartments)
            .catch(() => setApartments([]))
            .finally(() => setAptsLoading(false));
    }, [selectedHouse]);

    return (
        <>
            <TopBar
                title="Показания счётчиков"
                subtitle={summary
                    ? `Период: ${summary.periodLabel} · до 25-го числа осталось ${summary.daysLeft} дн.`
                    : (loading ? "загрузка…" : "ошибка загрузки")}
                action={
                    <button className="btn" disabled>
                        <Upload size={13}/>
                        Загрузить отчёт в Excel
                    </button>
                }
            />

            {loading && <div style={{padding: 24}}><DataLoading label="Загружаем показания…"/></div>}

            {!loading && error && (
                <div style={{padding: 24}}>
                    <DataError
                        title="Не удалось загрузить данные"
                        message="Бэкенд недоступен. Попробуйте обновить страницу."
                        onRetry={fetchAll}
                    />
                </div>
            )}

            {!loading && !error && summary && houses && recent && (
                <div className="meters">
                    <MetersHero summary={summary}/>
                    <MetersFilters/>
                    <MetersTable houses={houses} selectedId={selectedHouse?.id ?? null} onSelect={setSelectedHouse}/>

                    <div className="meters-bottom">
                        <div className="card meters-apts">
                            <div className="meters-apts__head-row">
                                <div>
                                    <div className="t-h3">
                                        {selectedHouse?.addr ?? "Выберите дом"} · квартиры
                                    </div>
                                    <div className="meters-apts__sub">
                                        {selectedHouse
                                            ? `${selectedHouse.done} из ${selectedHouse.apartments} сдали`
                                            : "Кликните на строку дома в таблице выше"}
                                    </div>
                                </div>
                                <div className="meters-apts__actions">
                                    <button className="btn btn--sm" disabled>Напомнить всем</button>
                                    <button className="btn btn--sm btn--primary" disabled>
                                        <Plus size={12}/>Внести вручную
                                    </button>
                                </div>
                            </div>
                            <ApartmentGrid apartments={apartments} loading={aptsLoading}/>
                        </div>

                        <RecentSubmissions items={recent}/>
                    </div>
                </div>
            )}
        </>
    );
}
