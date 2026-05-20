import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

/* ================================================================
   SettingRow — строка с лейблом, описанием и правым слотом
================================================================ */
interface SettingRowProps {
    icon?: React.ReactNode;
    label: string;
    description?: string;
    right?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
}

export function SettingRow({
                               icon,
                               label,
                               description,
                               right,
                               onClick,
                               danger,
                           }: SettingRowProps) {
    return (
        <div
            className={`set-row${onClick ? " set-row--clickable" : ""}${danger ? " set-row--danger" : ""}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => e.key === "Enter" && onClick?.()}
        >
            {icon && <span className="set-row__icon">{icon}</span>}
            <div className="set-row__body">
                <span className="set-row__label">{label}</span>
                {description && (
                    <span className="set-row__desc">{description}</span>
                )}
            </div>
            {right && <div className="set-row__right">{right}</div>}
        </div>
    );
}

/* ================================================================
   Toggle
================================================================ */
interface ToggleProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
    return (
        <button
            className={`set-toggle${checked ? " set-toggle--on" : ""}${disabled ? " set-toggle--disabled" : ""}`}
            onClick={() => !disabled && onChange(!checked)}
            aria-checked={checked}
            role="switch"
            type="button"
        >
            <span className="set-toggle__thumb" />
        </button>
    );
}

/* ================================================================
   SectionCard — обёртка секции
================================================================ */
interface SectionCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function SectionCard({
                                title,
                                icon,
                                children,
                                defaultOpen = false,
                            }: SectionCardProps) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className={`set-card${open ? " set-card--open" : ""}`}>
            <button
                className="set-card__head"
                onClick={() => setOpen((o) => !o)}
                type="button"
            >
        <span className="set-card__head-left">
          <span className="set-card__icon">{icon}</span>
          <span className="set-card__title">{title}</span>
        </span>
                <ChevronDown size={18} className={`set-card__chevron${open ? " set-card__chevron--open" : ""}`} />
            </button>
            {open && <div className="set-card__body">{children}</div>}
        </div>
    );
}

/* ================================================================
   Select pill — для выбора одного из нескольких вариантов
================================================================ */
interface SelectPillProps<T extends string> {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}

export function SelectPill<T extends string>({
                                                 value,
                                                 options,
                                                 onChange,
                                             }: SelectPillProps<T>) {
    return (
        <div className="set-pills">
            {options.map((o) => (
                <button
                    key={o.value}
                    className={`set-pill${value === o.value ? " set-pill--active" : ""}`}
                    onClick={() => onChange(o.value)}
                    type="button"
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}

/* ================================================================
   ConfirmModal
================================================================ */
interface ConfirmModalProps {
    title: string;
    description: string;
    confirmLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    children?: React.ReactNode;
}

export function ConfirmModal({
                                 title,
                                 description,
                                 confirmLabel = "Подтвердить",
                                 danger,
                                 onConfirm,
                                 onCancel,
                                 children,
                             }: ConfirmModalProps) {
    return (
        <div className="set-modal-overlay" onClick={onCancel}>
            <div
                className="set-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="set-modal__title">{title}</h3>
                <p className="set-modal__desc">{description}</p>
                {children}
                <div className="set-modal__actions">
                    <button className="set-modal__cancel" onClick={onCancel} type="button">
                        Отмена
                    </button>
                    <button
                        className={`set-modal__confirm${danger ? " set-modal__confirm--danger" : ""}`}
                        onClick={onConfirm}
                        type="button"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
