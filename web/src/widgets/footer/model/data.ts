import {SiReact, SiTypescript, SiVite, SiCss3, SiDotnet, SiPostgresql,} from "react-icons/si";
import {TbApi} from "react-icons/tb";
import {TbBrandSocketIo} from "react-icons/tb";

import type {FooterNavItemProps, FooterContactItemProps, FooterTechChipProps} from "./types.ts";

export const FOOTER_NAV_LINKS: FooterNavItemProps[] = [
    {
        label: "Главная",
        to: "/"
    },
    {
        label: "Возможности",
        to: "/features"
    },
    {
        label: "Тарифы",
        to: "/pricing"
    },
    {
        label: "Маркетплейс",
        to: "/marketplace"
    },
    {
        label: "О проекте",
        to: "/about"
    }
];

export const FOOTER_CONTACTS: FooterContactItemProps[] = [
    {
        label: "Телефон",
        value: "+7 (912) 664-93-93",
        href: "tel:+78001234567"
    },
    {
        label: "Рабочий",
        value: "atlasov.ryan.developer@gmail.com",
        href: "atlasov.ryan.developer@gmail.com"
    },
    {
        label: "Личный",
        value: "dotarayanru03@gmail.com",
        href: "dotarayanru03@gmail.com"
    },
    {
        label: "Локация",
        value: "РФ, Марий Эл, Йошкар-Ола ..."
    }
];

export const FOOTER_TECH_CHIPS: FooterTechChipProps[] = [
    {
        label: "React",
        icon: SiReact,
        color: "#61dafb"
    },
    {
        label: "TypeScript",
        icon: SiTypescript,
        color: "#3178c6"
    },
    {
        label: "Vite",
        icon: SiVite,
        color: "#bd34fe"
    },
    {
        label: "CSS",
        icon: SiCss3,
        color: "#264de4"
    },
    {
        label: ".NET 10",
        icon: SiDotnet,
        color: "#512bd4"
    },
    {
        label: "PostgreSQL",
        icon: SiPostgresql,
        color: "#336791"
    },
    {
        label: "REST API",
        icon: TbApi,
        color: "#ff6b35"
    },
    {
        label: "SOAP API",
        icon: TbApi,
        color: "#f0a500"
    },
    {
        label: "WebSocket",
        icon: TbBrandSocketIo,
        color: "#010101"
    }
];