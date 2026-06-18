import type {ComponentType, SVGProps} from "react";
import type {ServiceRequest} from "@/api/requests.api.ts";

export type ResidentRequest = ServiceRequest;

// Цветовая тональность смарт-карточек на главной.
export type SmartActionTone = "emerald" | "info" | "warning" | "violet";

// Lucide-style иконка: принимает size + стандартные svg-пропсы.
export type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export type TicketStep = {
    key: "New" | "Assigned" | "InProgress" | "Review" | "Done";
    label: string;
};

export type WeekEvent = {
    icon: IconComponent;
    bg: string;
    fg: string;
    title: string;
    time: string;
};

export type WeekDay = {
    label: string;
    date: number;
    current?: boolean;
    events: WeekEvent[];
};
