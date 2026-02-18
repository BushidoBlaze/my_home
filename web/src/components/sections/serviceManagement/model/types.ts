import React from "react";

export interface ServiceManagementContentProps {
    id: number;
    title: string;
    description: string;
    button?: {
        component: React.ElementType;
        text: string;
        className?: string;
    };
}

export interface ServiceManagementDetailProps {
    id: number;
    title: string;
    detail: string;
}