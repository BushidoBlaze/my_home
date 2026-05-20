import {Smartphone, Monitor, Wifi, Bell} from "lucide-react";
import type {ListItemProps} from './types.ts';

export const LIST_ITEMS: ListItemProps[] = [
    {
        icon: Smartphone,
        text: "Веб-приложение мобильной версии для ЖК"
    },
    {
        icon: Monitor,
        text: "Веб-портал для диспетчеров УК"
    },
    {
        icon: Wifi,
        text: "Синхронизация в реальном времени"
    },
    {
        icon: Bell,
        text: "Push-уведомления"
    }
];

import type {DevicesProps} from './types.ts';
import laptopImage from "@/shared/assets/images/devices/laptop.png";
import tabletImage from "@/shared/assets/images/devices/tablet.png";
import phoneImage from "@/shared/assets/images/devices/smartphone.png";

export const DEVICES: DevicesProps[] = [
    {
        name: "Ноутбук",
        type: "laptop",
        imageUrl: laptopImage
    },
    {
        name: "Планшет",
        type: "tablet",
        imageUrl: tabletImage
    },
    {
        name: "Смартфон",
        type: "phone",
        imageUrl: phoneImage
    }
];

import type {TagsProps} from './types.ts';
import {
    ClipboardList, CreditCard, Vote, ShieldCheck,
    BarChart2, Zap, Users, Wrench, MessageSquare,
    FileText, MapPin, Calendar, Percent
} from "lucide-react";

export const TAGS: TagsProps[] = [
    {icon: ClipboardList, text: "Заявки онлайн"},
    {icon: CreditCard, text: "Оплата ЖКХ"},
    {icon: Bell, text: "Push-уведомления"},
    {icon: Vote, text: "Голосования жильцов"},
    {icon: ShieldCheck, text: "Безопасность данных"},
    {icon: BarChart2, text: "Аналитика и отчёты"},
    {icon: Wifi, text: "Синхронизация онлайн"},
    {icon: Zap, text: "Автоматизация задач"},
    {icon: Users, text: "База жильцов"},
    {icon: Wrench, text: "Назначение мастеров"},
    {icon: MessageSquare, text: "Чат с УК"},
    {icon: FileText, text: "Квитанции и акты"},
    {icon: MapPin, text: "Карта объектов"},
    {icon: Calendar, text: "Плановые работы"},
    {icon: Percent, text: "Без комиссии"},
];