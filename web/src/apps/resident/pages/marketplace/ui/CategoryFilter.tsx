import { Store } from "lucide-react";
import { CATEGORIES } from "../model/data.ts";

interface Props {
    active: string | null;
    onChange: (cat: string | null) => void;
}

export function CategoryFilter({ active, onChange }: Props) {
    return (
        <div className="mp-categories">
            <button
                type="button"
                className={`mp-categories__item ${!active ? "mp-categories__item--active" : ""}`}
                onClick={() => onChange(null)}
            >
        <span className="mp-categories__icon">
          <Store size={18} />
        </span>
                <span>Все</span>
            </button>

            {CATEGORIES.map((cat) => {
                const Icon = cat.icon;

                return (
                    <button
                        type="button"
                        key={cat.id}
                        className={`mp-categories__item ${active === cat.id ? "mp-categories__item--active" : ""}`}
                        onClick={() => onChange(cat.id)}
                    >
            <span className="mp-categories__icon">
              <Icon size={18} />
            </span>
                        <span>{cat.label}</span>
                    </button>
                );
            })}
        </div>
    );
}