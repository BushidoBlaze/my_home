import { useEffect } from 'react';

const SITE_NAME = 'Мой Дом';

export function useDocumentTitle(title: string) {
    useEffect(() => {
        document.title = `${SITE_NAME} — ${title}`;
        return () => {
            document.title = SITE_NAME;
        };
    }, [title]);
}