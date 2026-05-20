export interface HelpContactInfo {
    operatorChatTitle: string;
    operatorChatDescription: string;
    operatorChatHours: string;
    supportEmail: string;
    hotlinePhone: string;
}

export interface HelpFeatureItem {
    id: string;
    title: string;
    description: string;
}

export interface HelpAboutInfo {
    title: string;
    description: string;
    mission: string;
    version: string;
}

export interface HelpContentResponse {
    contacts: HelpContactInfo;
    features: HelpFeatureItem[];
    about: HelpAboutInfo;
}

export interface SupportRequestPayload {
    subject: string;
    message: string;
    contactEmail: string;
    contactPhone?: string;
}

export interface BugReportPayload {
    title: string;
    description: string;
    stepsToReproduce?: string;
    contactEmail?: string;
}
