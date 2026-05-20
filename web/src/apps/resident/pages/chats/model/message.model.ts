import type {ChatMessageUi} from "./types.ts";

export function shouldShowDateDivider(messagesList: ChatMessageUi[], index: number) {
    if (index === 0) return true;
    const prev = new Date(messagesList[index - 1].createdAt).toDateString();
    const curr = new Date(messagesList[index].createdAt).toDateString();
    return prev !== curr;
}