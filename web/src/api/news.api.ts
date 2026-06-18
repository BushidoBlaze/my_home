import {requestJson, uploadFileJson} from "@/api/httpClient.ts";

// News API - объявления УК для жильцов

export interface NewsAuthor {
    id: string;
    fullName: string;
    avatarUrl?: string;
}

export interface NewsAttachment {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
}

export interface NewsItem {
    id: string;
    title: string;
    content: string;
    category: string;          // "Announcement" | "Emergency" | "Event" | ...
    importance: string;        // "Low" | "Normal" | "High"
    sourceType: string;        // "ManagementCompany" | "Chairman" | ...
    isPinned: boolean;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    author: NewsAuthor;
    attachments: NewsAttachment[];
    commentsCount: number;
}

export interface NewsListResponse {
    items: NewsItem[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface CreateNewsDto {
    title: string;
    content: string;
    category?: string;
    importance?: string;
    sourceType?: string;
    isPinned?: boolean;
    publishedAt?: string;
}

export interface UpdateNewsDto {
    title?: string;
    content?: string;
    category?: string;
    importance?: string;
    sourceType?: string;
    isPinned?: boolean;
    publishedAt?: string;
}

export interface NewsListFilters {
    category?: string;
    importance?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}

function buildQuery(filters: NewsListFilters = {}): string {
    const params = new URLSearchParams();
    if (filters.category) params.set("category", filters.category);
    if (filters.importance) params.set("importance", filters.importance);
    if (filters.search) params.set("search", filters.search);
    if (filters.page) params.set("page", filters.page.toString());
    if (filters.pageSize) params.set("pageSize", filters.pageSize.toString());
    const qs = params.toString();
    return qs ? `?${qs}` : "";
}

export const newsApi = {
    list: (filters?: NewsListFilters) =>
        requestJson<NewsListResponse>(`/news${buildQuery(filters)}`),

    getById: (id: string) =>
        requestJson<NewsItem>(`/news/${id}`),

    /** Создать объявление. Доступно только Manager/Admin/Chairman/HOA.
     *  При SourceType=ManagementCompany бэк рассылает push-уведомление всем жильцам. */
    create: (data: CreateNewsDto) =>
        requestJson<{id: string}>(`/news`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    update: (id: string, data: UpdateNewsDto) =>
        requestJson<{ok: boolean}>(`/news/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        requestJson<{ok: boolean}>(`/news/${id}`, {method: "DELETE"}),

    uploadAttachment: (id: string, file: File) =>
        uploadFileJson<{ok: boolean}>(`/news/${id}/attachments`, file),
};
