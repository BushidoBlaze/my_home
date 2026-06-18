import type {JSX} from "react";
import {Link} from "react-router-dom";
import {ArrowRight} from "lucide-react";
import {Progress} from "@/shared/ui/Progress/Progress.tsx";
import {SMART_ACTION_TONE_MAP} from "../data/smartActionTones.ts";
import type {IconComponent, SmartActionTone} from "../model/types.ts";

interface SmartActionProps {
    icon: IconComponent;
    tone: SmartActionTone;
    title: string;
    sub: string;
    to: string;
    // Прогресс-бар опционален и сейчас используется только в "Сдать показания" (3/5 счётчиков).
    // У остальных карточек его нет — поэтому undefined по дефолту.
    progress?: { value: number; max: number };
}

// Одна квадратная карточка с быстрым действием в ряду "Smart actions".
// Цвета берутся из палитры тонов — JSX никаких хексов не знает,
// меняешь тон — меняется иконка, прогресс-бар и CTA-стрелка одновременно.
export function SmartAction({icon: Icon, tone, title, sub, to, progress}: SmartActionProps): JSX.Element {
    const palette = SMART_ACTION_TONE_MAP[tone];

    return (
        <Link to={to} className="card resident-home__smart-action">
            <div className="resident-home__smart-action-top">
                {/* Цветной квадрат с иконкой — основной визуальный якорь карточки */}
                <div
                    className="resident-home__smart-action-icon"
                    style={{background: palette.bg, color: palette.fg}}
                >
                    <Icon size={18}/>
                </div>
                {/* "3/5" в углу — показываем только если задан progress */}
                {progress && (
                    <span className="tnum resident-home__smart-action-progress" style={{color: palette.fg}}>
                        {progress.value}/{progress.max}
                    </span>
                )}
            </div>

            <div className="resident-home__smart-action-text">
                <div className="resident-home__smart-action-title">{title}</div>
                <div className="resident-home__smart-action-sub">{sub}</div>
            </div>

            {progress && <Progress value={progress.value} max={progress.max} color={palette.fg} h={3}/>}

            {/* CTA-стрелка снизу для визуальной подсказки кликабельности */}
            <div className="resident-home__smart-action-cta" style={{color: palette.fg}}>
                Открыть <ArrowRight size={13}/>
            </div>
        </Link>
    );
}
