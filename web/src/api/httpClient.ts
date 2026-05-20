const API_URL = import.meta.env.VITE_API_URL ?? "";

type ProblemDetails = {
    title?: string;
    detail?: string;
    errors?: Record<string, string[]>;
};

function getToken(): string | null {
    return localStorage.getItem("token");
}

async function readErrorMessage(response: Response): Promise<string> {
    const fallback = `HTTP ${response.status}`;
    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/problem+json") || contentType.includes("application/json")) {
        const payload = (await response.json()) as ProblemDetails;
        if (payload.detail) return payload.detail;
        if (payload.title) return payload.title;

        const firstError = payload.errors
            ? Object.values(payload.errors).flat().find(Boolean)
            : null;
        if (firstError) return firstError;
    }

    const text = await response.text();
    return text || fallback;
}

export async function requestJson<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
            ...(options.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json() as Promise<T>;
}

export async function uploadFileJson<T>(url: string, file: File): Promise<T> {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}${url}`, {
        method: "POST",
        headers: {
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json() as Promise<T>;
}
