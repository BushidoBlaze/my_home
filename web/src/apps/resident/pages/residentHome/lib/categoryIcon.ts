import {Brush, Droplet, Leaf, Wind, Wrench} from "lucide-react";
import type {IconComponent} from "../model/types.ts";

// Маппинг категории заявки на иконку. Используется в карточке заявки на главной.
export function categoryIcon(category: string): IconComponent {
    const c = category.toLowerCase();
    if (c.includes("plumb") || c.includes("сан") || c.includes("вод")) return Droplet;
    if (c.includes("clean") || c.includes("убор")) return Brush;
    if (c.includes("yard") || c.includes("двор")) return Leaf;
    if (c.includes("vent") || c.includes("дым")) return Wind;
    return Wrench;
}
