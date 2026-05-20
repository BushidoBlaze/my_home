import { useState } from "react";
import { Check, ChevronRight, Globe, MoreHorizontal, Palette } from "lucide-react";
import {
    SectionCard,
    SettingRow,
    SelectPill,
    ConfirmModal
} from "./SettingsComponents";
import { accountApi } from "../model/settingsApi";
import type { Language, InterfaceSettings, Theme, FontSize } from "../model/types";

/* ================================================================
   LanguageSection
================================================================ */
const LANG_OPTIONS: { value: Language; label: string }[] = [
    { value: "ru", label: "🇷🇺 Русский" },
    { value: "en", label: "🇬🇧 English" },
];

interface LangProps {
    value: Language;
    onChange: (v: Language) => void;
}

export function LanguageSection({ value, onChange }: LangProps) {
    return (
        <SectionCard title="Язык" icon={<Globe size={20} />}>
            <div className="set-lang-list">
                {LANG_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        className={`set-lang-item${value === opt.value ? " set-lang-item--active" : ""}`}
                        onClick={() => onChange(opt.value)}
                        type="button"
                    >
                        {opt.label}
                        {value === opt.value && (
                            <Check size={16} />
                        )}
                    </button>
                ))}
            </div>
        </SectionCard>
    );
}

/* ================================================================
   InterfaceSection
================================================================ */
const THEME_OPTIONS: { value: Theme; label: string }[] = [
    { value: "light", label: "Светлая" },
    { value: "dark", label: "Тёмная" },
    { value: "system", label: "Авто" },
];

const FONT_OPTIONS: { value: FontSize; label: string }[] = [
    { value: "small", label: "S" },
    { value: "medium", label: "M" },
    { value: "large", label: "L" },
];

interface IFaceProps {
    value: InterfaceSettings;
    onChange: (patch: Partial<InterfaceSettings>) => void;
}

export function InterfaceSection({ value, onChange }: IFaceProps) {
    return (
        <SectionCard title="Интерфейс" icon={<Palette size={20} />}>
            <SettingRow
                label="Тема"
                right={
                    <SelectPill
                        value={value.theme}
                        options={THEME_OPTIONS}
                        onChange={(v) => onChange({ theme: v })}
                    />
                }
            />
            <SettingRow
                label="Размер шрифта"
                right={
                    <SelectPill
                        value={value.fontSize}
                        options={FONT_OPTIONS}
                        onChange={(v) => onChange({ fontSize: v })}
                    />
                }
            />
        </SectionCard>
    );
}

/* ================================================================
   OtherSection
================================================================ */
export function OtherSection() {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [password, setPassword] = useState("");
    const [exporting, setExporting] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handleClearCache = async () => {
        setClearing(true);
        await accountApi.clearCache().catch(() => {});
        setClearing(false);
        showToast("Кэш очищен");
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const blob = await accountApi.exportData();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "my-data-export.zip";
            a.click();
            URL.revokeObjectURL(url);
            showToast("Данные экспортированы");
        } finally {
            setExporting(false);
        }
    };

    const handleDelete = async () => {
        await accountApi.deleteAccount(password);
        window.location.href = "/logout";
    };

    return (
        <SectionCard title="Другое" icon={<MoreHorizontal size={20} />}>
            <div className="set-group">
                <SettingRow
                    label="Очистить кэш"
                    description="Удалить временные файлы"
                    right={<ChevronRight size={16} />}
                    onClick={handleClearCache}
                />
                {clearing && <div className="set-hint">Очистка…</div>}

                <SettingRow
                    label="Экспорт данных"
                    description="Скачать все ваши данные в ZIP"
                    right={<ChevronRight size={16} />}
                    onClick={handleExport}
                />
                {exporting && <div className="set-hint">Подготовка архива…</div>}
            </div>

            <div className="set-group">
                <SettingRow
                    label="Удалить аккаунт"
                    description="Необратимое действие"
                    danger
                    right={<ChevronRight size={16} />}
                    onClick={() => setConfirmDelete(true)}
                />
            </div>

            {confirmDelete && (
                <ConfirmModal
                    title="Удалить аккаунт?"
                    description="Все данные будут безвозвратно удалены. Введите пароль для подтверждения."
                    confirmLabel="Удалить навсегда"
                    danger
                    onConfirm={handleDelete}
                    onCancel={() => { setConfirmDelete(false); setPassword(""); }}
                >
                    <input
                        className="set-input"
                        type="password"
                        placeholder="Ваш пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </ConfirmModal>
            )}

            {toast && <div className="set-toast">{toast}</div>}
        </SectionCard>
    );
}