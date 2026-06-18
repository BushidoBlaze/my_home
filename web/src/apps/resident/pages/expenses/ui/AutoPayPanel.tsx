import type {FormEvent, JSX} from "react";
import {CreditCard, Save} from "lucide-react";
import type {AutoPaySettings} from "../model/types.ts";

interface AutoPayPanelProps {
    autoPay:     AutoPaySettings;
    setAutoPay:  React.Dispatch<React.SetStateAction<AutoPaySettings>>;
    submitting:  boolean;
    onSave:      () => void;
}

export function AutoPayPanel({autoPay, setAutoPay, submitting, onSave}: AutoPayPanelProps): JSX.Element {

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave();
    };

    return (
        <div className="expenses-page__card">
            <div className="expenses-page__card-header">
                <div>
                    <div className="expenses-page__card-title">
                        <CreditCard size={16} className="expenses-page__card-title-icon"/>
                        Автоплатёж
                    </div>
                    <div className="expenses-page__card-sub">
                        Платежи списываются автоматически в выбранный день при наличии непогашенных счетов.
                    </div>
                </div>
            </div>

            <form className="expenses-page__form" onSubmit={handleSubmit}>

                <div className="expenses-page__toggle-row">
                    <div>
                        <div className="expenses-page__toggle-label">Включить автоплатёж</div>
                        <div className="expenses-page__toggle-description">
                            Автоматическое списание при появлении счетов
                        </div>
                    </div>
                    <button
                        type="button"
                        className={`expenses-page__toggle${autoPay.enabled ? " expenses-page__toggle--enabled" : ""}`}
                        onClick={() => setAutoPay(prev => ({...prev, enabled: !prev.enabled}))}
                        aria-pressed={autoPay.enabled}
                    >
                        <span className="expenses-page__toggle-thumb"/>
                    </button>
                </div>

                <div className="expenses-page__form-grid">
                    <label className="expenses-page__field">
                        <span className="expenses-page__field-label">Карта (маска номера)</span>
                        <input
                            className="expenses-page__field-input"
                            value={autoPay.cardMask ?? ""}
                            onChange={e => setAutoPay(prev => ({...prev, cardMask: e.target.value}))}
                            placeholder="**** **** **** 1234"
                            disabled={!autoPay.enabled}
                        />
                    </label>
                    <label className="expenses-page__field">
                        <span className="expenses-page__field-label">День списания</span>
                        <input
                            className="expenses-page__field-input"
                            type="number"
                            min={1}
                            max={28}
                            value={autoPay.dayOfMonth}
                            onChange={e => setAutoPay(prev => ({...prev, dayOfMonth: Number(e.target.value)}))}
                            disabled={!autoPay.enabled}
                        />
                    </label>
                </div>

                <label className="expenses-page__field">
                    <span className="expenses-page__field-label">Лимит на списание, ₽</span>
                    <input
                        className="expenses-page__field-input"
                        type="number"
                        min={100}
                        value={autoPay.limitAmount}
                        onChange={e => setAutoPay(prev => ({...prev, limitAmount: Number(e.target.value)}))}
                        disabled={!autoPay.enabled}
                        placeholder="15000"
                    />
                </label>

                <div className="expenses-page__form-actions">
                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={submitting}
                    >
                        <Save size={14}/>
                        {submitting ? "Сохранение…" : "Сохранить настройки"}
                    </button>
                </div>
            </form>
        </div>
    );
}
