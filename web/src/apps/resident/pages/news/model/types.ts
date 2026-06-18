// Вложение к новости (фото, документ)
export interface NewsAttachment {
    fileUrl: string;
    mimeType: string;
    fileName?: string;
    name?: string;
}

// Новость в списке
export interface NewsItem {
    id: string;
    title: string;
    content: string;
    publishedAt: string;
    isPinned: boolean;
    commentsCount: number;
    attachments: NewsAttachment[];
}

// Комментарий к новости
export interface NewsComment {
    id: string;
    content: string;
    createdAt: string;
    user: {
        fullName: string;
        avatarUrl?: string;
    };
}