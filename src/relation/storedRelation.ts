import {isSupportedColumnType, SupportedColumnType} from "./columnType";
import StringUtils from "../utils/stringUtils";
import {NNToSMap} from "../types/nnToSMap";
import Relation from "./relation";
import Row from "./row";
import {isForbiddenColumnName} from "../utils/keywords";

/**
 * Plain object representation of the stored relation.
 */
export interface StoredRelationData {
    name: string;
    columnNames: string[];
    columnTypes: SupportedColumnType[];
    rows: string[][];
    columnCount: number;
    rowCount: number;
}

/**
 * Creates a copy of the given stored relation data.
 */
export function copyStoredRelationData(data: StoredRelationData): StoredRelationData {
    return {
        name: data.name,
        columnNames: [...data.columnNames],
        columnTypes: [...data.columnTypes],
        rows: data.rows.map(row => [...row]),
        columnCount: data.columnCount,
        rowCount: data.rowCount
    }
}

/**
 * String representation of the relation for its storing. The relation may happen to be in inconsistent state.
 */
export class StoredRelation {

    /**
     * Creates a new stored relation with given name, one column and no rows.
     */
    static new(name: string, nullValuesSupport: boolean): StoredRelation {
        return new StoredRelation(name, ["Column1"], ["number"], [], nullValuesSupport);
    }

    /**
     * Creates a new stored relation from given plain relation object. If the object is not a valid StoredRelationData,
     * throws error.
     */
    static fromData(data: any, nullValuesSupport: boolean): StoredRelation {
        if (isStoredRelationData(data)) {
            const d: StoredRelationData = data as StoredRelationData;
            return new StoredRelation(d.name, d.columnNames, d.columnTypes, d.rows, nullValuesSupport);
        }
        throw new Error("Given object is not a valid relation.");
    }

    /**
     * Creates a new stored relation from given full relation representation.
     */
    static fromRelation(name: string, relation: Relation, nullValuesSupport: boolean): StoredRelation {
        const columnNames: string[] = [];
        const columnTypes: SupportedColumnType[] = [];
        relation.getColumns().forEach((type, name) => {
            columnNames.push(name);
            columnTypes.push(type);
        });
        const rows: string[][] = relation.getRows().map(row => {
            return row.getOrderedPrintValues(columnNames);
        });
        return new StoredRelation(name, columnNames, columnTypes, rows, nullValuesSupport);
    }

    /**
     * Creates a new relation with the same name, columns, rows a null values support.
     */
    static copy(relation: StoredRelation): StoredRelation {
        const name = relation.name;
        const columnNames = [...relation.columnNames];
        const columnTypes = [...relation.columnTypes];
        const rows = relation.rows.map(row => [...row]);
        const nullValuesSupport = relation.nullValuesSupport;
        return new StoredRelation(name, columnNames, columnTypes, rows, nullValuesSupport);
    }

    /**
     * Returns formatted string representation of StoredRelation or StoredRelationData.
     */
    static format(rel: StoredRelation | StoredRelationData): string {
        // finds longest inputs in each column
        const longest = rel.columnNames.map(n => n.length);
        rel.columnTypes.forEach((t, i) => {
            if (longest[i] < t.length) {
                longest[i] = t.length;
            }
        });
        rel.rows.forEach(r => {
            r.forEach((d, i) => {
                if (longest[i] < d.length) {
                    longest[i] = d.length;
                }
            });
        });
        // function for end-padding strings with spaces
        const pad = (ss: string[]) => ss.map((s, i) => s.padEnd(longest[i], " ")).join(' | ');
        return pad(rel.columnNames) + '\n' +
            pad(rel.columnTypes) + '\n' +
            longest.map(n => "-".repeat(n)).join("-+-") + '\n' +
            rel.rows.map(r => pad(r)).join('\n') + '\n\n';
    }

    private name: string;
    columnNames: string[];
    columnTypes: SupportedColumnType[];
    rows: string[][];
    private columnCount: number;
    private rowCount: number;
    private readonly errors: NNToSMap;
    private nullValuesSupport: boolean;
    private actual: boolean;
    private revertState: StoredRelationData;

    /**
     * Creates new relation with given name, one default column and no rows.
     */
    constructor(name: string, columnNames: string[], columnTypes: SupportedColumnType[],
                        rows: string[][], nullValuesSupport: boolean) {
        this.name = name;
        this.columnNames = columnNames;
        this.columnTypes = columnTypes;
        this.rows = rows;
        this.columnCount = columnNames.length;
        this.rowCount = rows.length;
        this.errors = new NNToSMap();
        this.nullValuesSupport = nullValuesSupport;
        this.actual = false;
        this.revertState = this.toDataObject();
        this.recomputeErrors();
    }

    /**
     * Checks all possible errors in the relation.
     */
    private recomputeErrors(): void {
        this.errors.clear();
        this.checkColumnNames();
        for (let c = 0; c < this.columnCount; ++c) {
            [...new Array(this.rowCount).keys()].forEach(r => this.checkRowInput(c, r));
        }
    }

    /**
     * Checks whether the column name on given index is valid and not duplicit and updates error map.
     */
    private checkColumnNames(): void {
        for (let columnIndex = 0; columnIndex < this.columnCount; ++columnIndex) {
            const columnName: string = this.columnNames[columnIndex].trim();
            if (columnName === "") {
                this.errors.set("name", columnIndex, "Column name cannot be empty");
                continue;
            }
            const nameCount: number = this.columnNames.reduce((agg, name) => {
                return (name === columnName) ? (agg + 1) : agg;
            }, 0);
            if (nameCount > 1) {
                this.errors.set("name", columnIndex, "Duplicit column name");
                continue;
            }
            if (isForbiddenColumnName(columnName)) {
                this.errors.set("name", columnIndex, "Column name cannot be a keyword");
                continue;
            }
            if (!StringUtils.isName(columnName)) {
                this.errors.set("name", columnIndex, "Invalid characters in column name");
                continue;
            }
            this.errors.delete("name", columnIndex);
        }
    }

    /**
     * Checks whether the row input on given index is valid and updates error map.
     */
    private checkRowInput(columnIndex: number, rowIndex: number): void {
        this.errors.delete(rowIndex, columnIndex);
        const input: string = this.rows[rowIndex][columnIndex].trim();
        // empty input = null
        if (input === "" || input === "null") {
            if (this.nullValuesSupport) {
                this.errors.delete(rowIndex, columnIndex);
            }
            else {
                this.errors.set(rowIndex, columnIndex, "Null values are not supported");
            }
        }
        else if (this.columnTypes[columnIndex] === "number") {
            if (!StringUtils.isNumber(input.replace(/\s/g, ""))) {
                this.errors.set(rowIndex, columnIndex, "Given string is not a number");
            }
        }
        else if (this.columnTypes[columnIndex] === "boolean") {
            const lower = input.toLowerCase();
            if (lower !== "true" && lower !== "t" && lower !== "false" && lower !== "f") {
                this.errors.set(rowIndex, columnIndex, "Given string is not a boolean");
            }
        }
        /* STRING COLUMNS CANNOT BE INVALID */
    }

    /**
     * Checks whether all row inputs on given column index are valid and updates error map.
     */
    private checkColumnTypes(columnIndex: number): void {
        this.rows.forEach((_, i) => this.checkRowInput(columnIndex, i));
    }

    /**
     * Creates a relation with full schema.
     * WARNING: It expects that there are no errors in the stored relation before call.
     */
    public createRelation(): Relation {
        const relation: Relation = new Relation(this.name);
        for (let c = 0; c < this.columnCount; ++c) {
            relation.addColumn(this.columnNames[c], this.columnTypes[c]);
        }
        this.rows.forEach(rowInput => {
            const row: Row = new Row(relation.getColumns());
            rowInput.forEach((input, c) => {
                input = input.trim();
                if (input === "" || input === "null") {
                    row.addValue(this.columnNames[c], null);
                }
                else if (this.columnTypes[c] === "string") {
                    // changes input representation to expected in inner relations
                    // replaces all used '\' by two '\\' and all used '"' by '\"'
                    input = input.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                    row.addValue(this.columnNames[c], input);
                }
                else if (this.columnTypes[c] === "number") {
                    row.addValue(this.columnNames[c], Number(input.replace(/\s/g, "")));
                }
                else /* this.columnTypes[c] === "boolean" */ {
                    const lower = input.toLowerCase();
                    row.addValue(this.columnNames[c], lower === "t" || lower === "true");
                }
            });
            relation.addRow(row);
        });
        relation.finishSchema();
        return relation;
    }

    /**
     * Creates plain object representation of the stored relation.
     */
    public toDataObject(): StoredRelationData {
        return {
            name: this.name,
            columnNames: [...this.columnNames],
            columnTypes: [...this.columnTypes],
            rows: this.rows.map(row => [...row]),
            columnCount: this.columnCount,
            rowCount: this.rowCount
        }
    }

    /**
     * Returns map "row/column => error". Numeric row keys are for relation rows, row key "name" is for column name row.
     */
    public getErrors(): NNToSMap {
        return this.errors;
    }

    /**
     * Returns true if there are no errors in the relation.
     */
    public isValid(): boolean {
        return this.errors.size() === 0;
    }

    /**
     * Sets null values support to check null errors in the relation.
     */
    public setNullValuesSupport(nullValuesSupport: boolean): void {
        if (nullValuesSupport !== this.nullValuesSupport) {
            this.nullValuesSupport = nullValuesSupport;
            this.recomputeErrors();
        }
    }

    /**
     * Adds a new column with default name "Column n", default type "number", and empty inputs "" in all rows.
     */
    public addNewColumn(): void {
        let i = (this.columnNames.length + 1);
        let name = "Column" + i;
        while (this.columnNames.indexOf(name) > -1) {
            name = "Column" + ++i;
        }
        this.columnNames.push(name);
        this.columnTypes.push("number");
        if (this.nullValuesSupport) {
            this.rows.forEach(r => r.push(""));
        }
        else {
            this.rows.forEach(r => r.push("0"));
        }
        ++this.columnCount;
        this.checkColumnNames();
        this.actual = false;
    }

    /**
     * Adds a new row with empty inputs "" in all columns.
     */
    public addNewRow(): void {
        if (this.nullValuesSupport) {
            this.rows.push([...new Array(this.columnCount).keys()].map(_ => ""));
        }
        else {
            this.rows.push([...new Array(this.columnCount).keys()].map(i => {
                if (this.columnTypes[i] === "number") {
                    return "0";
                }
                else if (this.columnTypes[i] === "boolean") {
                    return "false";
                }
                return '""';
            }));
        }
        ++this.rowCount;
        this.actual = false;
    }

    /**
     * Deletes a column with the given index. If the last column was deleted, removes all rows and creates
     * new default column.
     *
     * @param columnIndex
     */
    public deleteColumn(columnIndex: number): void {
        this.columnNames.splice(columnIndex, 1);
        this.columnTypes.splice(columnIndex, 1);
        this.rows.forEach(row => row.splice(columnIndex, 1));
        --this.columnCount;
        // if last column was deleted, removes all rows and creates new default column
        if (this.columnCount === 0) {
            this.rows = [];
            this.addNewColumn();
        }
        this.errors.forEach((value, row, column) => {
            // removes errors for given row
            if (column === columnIndex) {
                this.errors.delete(row, column);
            }
            // updates row index for errors in rows under deleted one
            else if (column > columnIndex) {
                this.errors.delete(row, column);
                this.errors.set(row, column, value);
            }
        });
        this.actual = false;
    }

    /**
     * Deletes a row with given index.
     *
     * @param rowIndex
     */
    public deleteRow(rowIndex: number): void {
        this.rows.splice(rowIndex, 1);
        --this.rowCount;
        this.errors.forEach((value, row, column) => {
            // removes errors for given row
            if (row === rowIndex) {
                this.errors.delete(row, column);
            }
            // updates row index for errors in rows under deleted one
            else if (typeof row === "number" && row > rowIndex) {
                this.errors.delete(row, column);
                this.errors.set(row - 1, column, value);
            }
        });
        this.actual = false;
    }

    public getRowCount(): number {
        return this.rowCount;
    }

    public getColumnCount(): number {
        return this.columnCount;
    }

    public setName(name: string): void {
        this.name = name;
        this.actual = false;
    }

    public getName(): string {
        return this.name;
    }

    public getColumnNames(): string[] {
        return this.columnNames;
    }

    public setColumnName(columnName: string, columnIndex: number): void {
        this.columnNames[columnIndex] = columnName;
        this.checkColumnNames();
        this.actual = false;
    }

    public getColumnTypes(): SupportedColumnType[] {
        return this.columnTypes;
    }

    public setColumnType(columnType: SupportedColumnType, columnIndex: number): void {
        this.columnTypes[columnIndex] = columnType;
        this.checkColumnTypes(columnIndex);
        this.actual = false;
    }

    public getRows(): string[][] {
        return this.rows;
    }

    public setRowInput(input: string, rowIndex: number, columnIndex: number): void {
        this.rows[rowIndex][columnIndex] = input;
        this.checkRowInput(columnIndex, rowIndex);
        this.actual = false;
    }

    /**
     * Returns true if no changes were made after last setActual(true) call.
     * The StoredRelation is created with isActual() = false.
     */
    public isActual(): boolean {
        return this.actual;
    }

    /**
     * Sets current StoredRelation state as actual. Any change sets the state as not actual automatically.
     * If it is set to actual, the current state is saved as the revert state.
     */
    public setActual(actual: boolean): void {
        this.actual = actual;
        if (actual) {
            this.revertState = this.toDataObject();
        }
    }

    /**
     * Returns true if the relation has saved previous state.
     */
    public canRevert(): boolean {
        return this.revertState !== undefined;
    }

    /**
     * Returns name of the saved relation state to revert or empty string.
     */
    public getRevertName(): string {
        if (this.revertState !== undefined) {
            return this.revertState.name;
        }
        else {
            return "";
        }
    }

    /**
     * Reverts the current relation to its last loaded state (if any exists, call canRevert() to check).
     * The relation is set as not actual, null values support and saved revert state is not reverted.
     */
    public revert(): void {
        if (this.revertState !== undefined) {
            this.name = this.revertState.name;
            this.columnNames = [...this.revertState.columnNames];
            this.columnTypes = [...this.revertState.columnTypes];
            this.rows = this.revertState.rows.map(row => [...row]);
            this.columnCount = this.revertState.columnCount;
            this.rowCount = this.revertState.rowCount;
            this.actual = false;
            this.recomputeErrors();
        }
    }
}

/**
 * Returns true if the relation relation object has at least one column, and all rows has the same length.
 */
export function isStoredRelationData(obj: any): boolean {
    if (typeof obj !== "object") {
        return false;
    }
    if (!("name" in obj) || typeof obj.name !== "string") {
        return false;
    }
    if (!("columnCount" in obj) || typeof obj.columnCount !== "number" || obj.columnCount < 1) {
        return false;
    }
    if (!("rowCount" in obj) || typeof obj.rowCount !== "number") {
        return false;
    }
    if (!("columnNames" in obj) || !Array.isArray(obj.columnNames) || obj.columnNames.length !== obj.columnCount ||
        obj.columnNames.some((o: any) => typeof o !== "string")) {
        return false;
    }
    if (!("columnTypes" in obj) || !Array.isArray(obj.columnTypes) || obj.columnTypes.length !== obj.columnCount ||
        obj.columnTypes.some((o: any) => !isSupportedColumnType(o))) {
        return false;
    }
    return ("rows" in obj && Array.isArray(obj.rows) && obj.rows.every((o: any) => {
        return Array.isArray(o) && o.length === obj.columnCount && o.every((d: any) => typeof d === "string");
    }));
}