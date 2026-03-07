import type {IconType} from "react-icons";

export interface FooterNavItemProps {
    label: string;
    to: string;
}

export interface FooterContactItemProps {
    label: string;
    value: string;
    href?: string;
}

export interface FooterTechChipProps {
    label: string;
    icon: IconType;
    color: string;
}


