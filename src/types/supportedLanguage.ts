/**
 * Textual description of supported value separators.
 */
export type SupportedLanguage = "ENG" | "CZE";

export function isSupportedLanguage(x: any): boolean {
    return x === "ENG" || x === "CZE";
}