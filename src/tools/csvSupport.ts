/**
 * Two possible CSV value separators: comma (,) and semicolon (;).
 */
export type CsvValueSeparatorChar = "," | ";";

export function findValueSeparatorChar(str: string): string | undefined {
    for (let i = 0; i < str.length; ++i) {
        const char: string = str.charAt(i);
        if (char === ",") {
            return ",";
        }
        if (char === ";") {
            return ";";
        }
    }
    return undefined;
}