import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function ellipsisText(
    text: string,
    length: number,
    ellipsis: string = "...",
): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + ellipsis;
}