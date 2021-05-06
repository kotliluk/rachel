/**
 * Two possible CSV value separators: comma (,) and semicolon (;).
 * @typedef {("," | ";")} CsvValueSeparator
 */
export type CsvValueSeparator = "," | ";";

/**
 * Returns the first found value separator character: (,) or (;). If no separator is found, returns undefined.
 *
 * @param str string to search in {@type string}
 * @return found separator or undefined {@type CsvValueSeparator?}
 * @public
 */
export function findValueSeparator(str: string): CsvValueSeparator | undefined {
    for (let i = 0; i < str.length; ++i) {
        const char: string = str.charAt(i);
        if (char === "," || char === ";") {
            return char;
        }
    }
    return undefined;
}