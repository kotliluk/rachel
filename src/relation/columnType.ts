/**
 * Specifies supported column types in the application. When changed, update the keywords.ts file.
 */

/**
 * Supported string names of types of columns for a relational schema.
 */
export type SupportedColumnType = "string" | "number" | "boolean";

/**
 * Possible types of the content of columns (null values included).
 */
export type ColumnContent = string | number | boolean | null;

/**
 * Returns true if the given obj is string with value SupportedColumnType value.
 */
export function isSupportedColumnType(obj: any): boolean {
    if (typeof obj !== "string") {
        return false;
    }
    return obj === "string" || obj === "number" || obj === "boolean";
}