import {FileDialog} from "../tools/fileDialog";
import {
    CsvValueSeparatorChar,
    findValueSeparatorChar
} from "../tools/csvSupport";
import {StoredRelation} from "./storedRelation";
import {SupportedColumnType} from "./columnType";
import {saveAs} from "file-saver";
import JSZip from "jszip";
import Parser from "../tools/parser";

/**
 * Class for loading and saving relation definitions.
 */
export class RelationStoreManager {

    /**
     * Loads textual relation representations from multiple csv files selected by the user. If the csv does not have
     * valid stricture, it is skipped. Loaded csv are parsed to StoredRelations and returned in a promise.
     *
     * @param nullValuesSupport null values support to set in created StoredRelations
     */
    public static load(nullValuesSupport: boolean): Promise<{relations: StoredRelation[], skipped: number}> {
        return new Promise<{relations: StoredRelation[], skipped: number}>(resolve => {
            FileDialog.openFiles(".csv").then(files => {
                let relations: StoredRelation[] = [];
                let skipped: number = 0;
                files.forEach(file => {
                    if (file.name.match(/\.csv$/)) {
                        try {
                            relations.push(this.csvToRelation(RelationStoreManager.createValidName(file.name.slice(0, -4)),
                                file.text, nullValuesSupport));
                        }
                        catch (err) {
                            console.log('File ' + file.name + ' skipped for bad format of csv');
                            skipped += 1;
                        }
                    }
                    else {
                        console.log('Unsupported filetype: ' + file.name);
                        skipped += 1;
                    }
                });
                resolve({relations: relations, skipped: skipped});
            });
        });
    }

    /**
     * Saves given relations into csv files (in one csv file each relation). Uses given value separator.
     *
     * @param relations map of the relations to be saved
     * @param filename name of the downloaded file (without .zip/.csv extension)
     * @param valueSeparator the separator of values
     */
    public static save(relations: StoredRelation[], filename: string, valueSeparator: CsvValueSeparatorChar): void {
        if (relations.length === 0) {
            return;
        }
        if (relations.length === 1) {
            const blob = new Blob([this.relationToCsv(relations[0], valueSeparator)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, relations[0].getName() + '.csv');
            return;
        }
        const zip: JSZip = JSZip();
        relations.forEach(relation => {
            zip.file(relation.getName() + '.csv', this.relationToCsv(relation, valueSeparator));
        });
        zip.generateAsync({type: "blob"}).then(content => {
            saveAs(content, filename + ".zip");
        }).catch(err => {
            throw err;
        });
    }

    /**
     * Parses a StoredRelation from given csv text. If the text is invalid, throws error.
     *
     * @param name name of the relation
     * @param text csv content to parse a relation from
     * @param nullValuesSupport null values support to set in created StoredRelation
     */
    private static csvToRelation(name: string, text: string | null, nullValuesSupport: boolean): StoredRelation {
        if (text === null || text === "") {
            console.log("null or empty string read from file " + name);
            throw Error();
        }

        text = text.trim().replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n').replace(/\t/g, "    ");

        const lines: string[] = text.split('\n');

        if (lines.length < 2) {
            console.log("file " + name + " has only one line");
            throw Error();  // at least two lines are expected (names and types)
        }

        lines[0] = lines[0].replace(/\s/g, '');
        lines[1] = lines[1].replace(/\s/g, '');

        let separator = findValueSeparatorChar(lines[1]);
        // if no separator is found, only one column is expected - sets separator to not defined value to unify the
        // following process
        if (separator === undefined) {
            separator = ';';
        }

        const columnNames: string[] = lines[0].split(separator);
        const columnTypes: SupportedColumnType[] = lines[1].split(separator).map(str => {
            const lower = str.toLowerCase();
            if (lower === "string" || lower === "str" || lower === "s") {
                return "string";
            }
            else if (lower === "number" || lower === "num" || lower === "n") {
                return "number";
            }
            return "boolean";
        });
        const rows: string[][] = lines.slice(2).map(line => {
            const row: string[] = []
            line = line.trim();
            while (true) {
                // @ts-ignore - separator cannot be undefined now
                const split = RelationStoreManager.nextRowInput(line, separator);
                row.push(split.input);
                if (split.rest === undefined) {
                    break;
                }
                line = split.rest;
            }
            return row;
        });

        // all rows must have equal column count
        const columnCount = columnNames.length;
        if (columnTypes.length !== columnCount || rows.some(row => row.length !== columnCount)) {
            console.log("rows in file " + name + " do not have the same number of columns");
            throw new Error();
        }

        return new StoredRelation(name, columnNames, columnTypes, rows, nullValuesSupport);
    }

    /**
     * Removes invalid characters for name. If the filtered name is empty, returns string "relation".
     */
    private static createValidName(name: string): string {
        name = name.split('').filter(char => Parser.isNameChar(char)).join('');
        if (name === "") {
            return "relation";
        }
        return name;
    }

    /**
     * Returns next part of the line before separator. Separators in string literals are ignored.
     */
    private static nextRowInput(line: string, separator: string): {input: string, rest: string | undefined} {
        let inString = false;
        let backslashes = 0;
        let i = 0;
        while (i < line.length) {
            const char = line.charAt(i);
            // separator found not in the string literal
            if (!inString && char === separator) {
                return {input: line.slice(0, i), rest: line.slice(i + 1)};
            }
            // next backslash found in a row
            if (char === '\\') {
                ++backslashes;
            }
            // resets backslashes in a row
            else {
                backslashes = 0;
            }
            // not escaped quotes found
            if (char === '"' && (backslashes % 2) === 0) {
                inString = !inString;
            }
            ++i;
        }
        return {input: line, rest: undefined}
    }

    /**
     * Creates a csv representation for the given relation.
     */
    private static relationToCsv(relation: StoredRelation, valueSeparator: CsvValueSeparatorChar): string {
        const names: string = relation.getColumnNames().join(valueSeparator);
        const types: string = relation.getColumnTypes().join(valueSeparator);
        const rows: string[] = relation.getRows().map(row => row.join(valueSeparator));
        return [names, types, ...rows].join('\n');
    }
}