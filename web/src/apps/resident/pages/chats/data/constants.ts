const API_URL = import.meta.env.VITE_API_URL ?? "";

export const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");
