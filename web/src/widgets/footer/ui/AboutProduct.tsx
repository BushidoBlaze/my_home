import {FOOTER_TECH_CHIPS} from "@/widgets/footer/model/data.ts";
import TechChip from "@/widgets/footer/ui/TechChip.tsx";

export default function AboutProduct() {
    return (
        <div className="footer__col">
            <p className="footer__col-label">Продукт</p>
            <h2 className="footer__brand-name">Мой Дом</h2>
            <p className="footer__brand-sub">
                Центр управления вашим домом. Объединяем жильцов и управляющие компании.
            </p>
            <ul className="footer__tech-stack">
                {FOOTER_TECH_CHIPS.map((chip) => (
                    <TechChip key={chip.label} {...chip} />
                ))}
            </ul>
        </div>
    )
}