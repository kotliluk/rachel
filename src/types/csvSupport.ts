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
 * @category Types
 * @public
 */
export function findValueSeparator(str: string): CsvValueSeparator | undefined {
    let inQuotes: boolean = false;
    for (let i = 0; i < str.length; ++i) {
        const char: string = str.charAt(i);
        // quotes found
        if (char === '"') {
            if (!inQuotes) {
                inQuotes = true;
            }
            else {
                const c2 = str.charAt(i + 1);
                if (c2 === "," || c2 === ";") {
                    return c2;
                }
                // double-quotes mean one quote in cell
                else if (c2 === '"') {
                    // skips second quote
                    ++i;
                }
                // error
                else {
                    return undefined;
                }
            }
        }
        if (!inQuotes && (char === "," || char === ";")) {
            return char;
        }
    }
    return undefined;
}

/**
 * Splits the given line using the given CSV separator. It follows CSV rules:
 * - a cell with a separator (as value) needs to be enclosed in quotes.
 * - a cell with a quote (as value) needs to be enclosed in additional quotes. The value quote needs to be typed twice.
 *
 * @param line line of CSV file to be split {@type string}
 * @param separator CSV separator to use {@type CsvValueSeparator}
 * @return split line to individual cells {@type string[]}
 * @category Types
 * @public
 */
export function splitCSVLine(line: string, separator: CsvValueSeparator): string[] {
    // adds separator to simply handle the last cell
    line += separator;
    const ret: string[] = [];
    let inQuotes: boolean = false;
    let partStart: number = 0;
    let i: number = 0;
    while (i < line.length) {
        const c = line.charAt(i);
        // quotes found
        if (c === '"') {
            // first quotes (after separator)
            if (!inQuotes) {
                inQuotes = true;
                partStart = i;
            }
            else {
                const c2 = line.charAt(i + 1);
                if (c2 === separator) {
                    ret.push(line.slice(partStart + 1, i).replace(/""/g, '"'));
                    inQuotes = false;
                    partStart = i + 2;
                }
                // double-quotes mean one quote in cell, else error
                else if (c2 !== '"') {
                    throw new Error();
                }
                i += 2;
                continue;
            }
        }
        else if (c === separator && !inQuotes) {
            ret.push(line.slice(partStart, i).replace('""', '"'));
            partStart = i + 1;
        }
        ++i;
    }
    return ret;
}