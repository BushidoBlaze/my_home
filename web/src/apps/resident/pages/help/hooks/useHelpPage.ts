import {useCallback, useEffect, useState} from "react";
import {helpApi} from "../model/helpApi.ts";
import {fallbackHelpContent} from "../model/content.ts";
import type {BugReportPayload, HelpContentResponse, SupportRequestPayload} from "../model/types.ts";

const EMPTY_SUPPORT_FORM: SupportRequestPayload = {
    subject: "",
    message: "",
    contactEmail: "",
    contactPhone: "",
};

const EMPTY_BUG_FORM: BugReportPayload = {
    title: "",
    description: "",
    stepsToReproduce: "",
    contactEmail: "",
};

export function useHelpPage() {
    const [content, setContent] = useState<HelpContentResponse>(fallbackHelpContent);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [supportForm, setSupportForm] = useState<SupportRequestPayload>(EMPTY_SUPPORT_FORM);
    const [bugForm, setBugForm] = useState<BugReportPayload>(EMPTY_BUG_FORM);
    const [supportSubmitting, setSupportSubmitting] = useState(false);
    const [bugSubmitting, setBugSubmitting] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState<string | null>(null);
    const [bugSuccess, setBugSuccess] = useState<string | null>(null);

    const loadContent = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await helpApi.getContent();
            setContent(response);
        } catch (e) {
            setError("Не удалось загрузить справочную информацию. Показываем базовую версию.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadContent();
    }, [loadContent]);

    const submitSupportRequest = useCallback(async () => {
        setSupportSubmitting(true);
        setSupportSuccess(null);
        try {
            await helpApi.sendSupportRequest(supportForm);
            setSupportSuccess("Обращение отправлено. Мы ответим в ближайшее время.");
            setSupportForm(EMPTY_SUPPORT_FORM);
        } finally {
            setSupportSubmitting(false);
        }
    }, [supportForm]);

    const submitBugReport = useCallback(async () => {
        setBugSubmitting(true);
        setBugSuccess(null);
        try {
            await helpApi.sendBugReport(bugForm);
            setBugSuccess("Спасибо! Репорт об ошибке передан команде разработки.");
            setBugForm(EMPTY_BUG_FORM);
        } finally {
            setBugSubmitting(false);
        }
    }, [bugForm]);

    return {
        content,
        loading,
        error,
        loadContent,
        supportForm,
        setSupportForm,
        bugForm,
        setBugForm,
        supportSubmitting,
        bugSubmitting,
        supportSuccess,
        bugSuccess,
        submitSupportRequest,
        submitBugReport,
    };
}
