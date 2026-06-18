import {useState, type FormEvent, type JSX} from "react";
import {X} from "lucide-react";
import {managerBuildingsApi} from "@/api/managerBuildings.api.ts";

interface Props {
    onClose: () => void;
    onCreated: (id: string) => void;
}

// Числовое поле приходит строкой из инпута — превращаем в number | undefined.
function num(v: string): number | undefined {
    const t = v.trim();
    if (!t) return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
}

export default function CreateBuildingModal({onClose, onCreated}: Props): JSX.Element {
    const [city, setCity] = useState("Москва");
    const [street, setStreet] = useState("");
    const [house, setHouse] = useState("");
    const [block, setBlock] = useState("");
    const [year, setYear] = useState("");
    const [series, setSeries] = useState("");
    const [cadastre, setCadastre] = useState("");
    const [floors, setFloors] = useState("");
    const [entrances, setEntrances] = useState("");
    const [lifts, setLifts] = useState("");
    const [apartmentsTotal, setApartmentsTotal] = useState("");
    const [areaTotal, setAreaTotal] = useState("");
    const [chairmanName, setChairmanName] = useState("");
    const [chairmanApartment, setChairmanApartment] = useState("");
    const [note, setNote] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!street.trim() || !house.trim()) {
            setError("Укажите улицу и номер дома");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const created = await managerBuildingsApi.create({
                city: city.trim() || undefined,
                street: street.trim(),
                house: house.trim(),
                block: block.trim() || undefined,
                year: num(year),
                series: series.trim() || undefined,
                cadastre: cadastre.trim() || undefined,
                floors: num(floors),
                entrances: num(entrances),
                lifts: num(lifts),
                apartmentsTotal: num(apartmentsTotal),
                areaTotal: num(areaTotal),
                chairmanName: chairmanName.trim() || undefined,
                chairmanApartment: chairmanApartment.trim() || undefined,
                note: note.trim() || undefined,
            });
            onCreated(created.id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Не удалось создать дом");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="bd-modal-overlay" onClick={onClose}>
            <form className="bd-modal" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
                <div className="bd-modal__head">
                    <h2 className="bd-modal__title">Новый дом</h2>
                    <button type="button" className="bd-modal__close" onClick={onClose} aria-label="Закрыть">
                        <X size={18}/>
                    </button>
                </div>

                <div className="bd-modal__body">
                    {error && <div className="bd-modal__error">{error}</div>}

                    <div className="bd-modal__grid">
                        <label className="bd-modal__field bd-modal__field--wide">
                            <span>Город</span>
                            <input value={city} onChange={e => setCity(e.target.value)} placeholder="Москва"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Улица *</span>
                            <input value={street} onChange={e => setStreet(e.target.value)} placeholder="Рябинина"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Дом *</span>
                            <input value={house} onChange={e => setHouse(e.target.value)} placeholder="8"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Корпус</span>
                            <input value={block} onChange={e => setBlock(e.target.value)} placeholder="к1"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Год постройки</span>
                            <input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="2019"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Серия / тип</span>
                            <input value={series} onChange={e => setSeries(e.target.value)} placeholder="Монолит"/>
                        </label>
                        <label className="bd-modal__field bd-modal__field--wide">
                            <span>Кадастровый номер</span>
                            <input value={cadastre} onChange={e => setCadastre(e.target.value)} placeholder="77:01:000000:0000"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Этажей</span>
                            <input type="number" value={floors} onChange={e => setFloors(e.target.value)} placeholder="25"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Подъездов</span>
                            <input type="number" value={entrances} onChange={e => setEntrances(e.target.value)} placeholder="6"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Лифтов</span>
                            <input type="number" value={lifts} onChange={e => setLifts(e.target.value)} placeholder="12"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Квартир</span>
                            <input type="number" value={apartmentsTotal} onChange={e => setApartmentsTotal(e.target.value)} placeholder="312"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Площадь общая, м²</span>
                            <input type="number" value={areaTotal} onChange={e => setAreaTotal(e.target.value)} placeholder="21800"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Председатель</span>
                            <input value={chairmanName} onChange={e => setChairmanName(e.target.value)} placeholder="ФИО"/>
                        </label>
                        <label className="bd-modal__field">
                            <span>Кв. председателя</span>
                            <input value={chairmanApartment} onChange={e => setChairmanApartment(e.target.value)} placeholder="41"/>
                        </label>
                        <label className="bd-modal__field bd-modal__field--wide">
                            <span>Примечание</span>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Например: в программе кап. ремонта"/>
                        </label>
                    </div>
                </div>

                <div className="bd-modal__foot">
                    <button type="button" className="btn btn--sm" onClick={onClose}>Отмена</button>
                    <button type="submit" className="btn btn--sm btn--primary" disabled={saving}>
                        {saving ? "Сохраняем…" : "Создать дом"}
                    </button>
                </div>
            </form>
        </div>
    );
}
