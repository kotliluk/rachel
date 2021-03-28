import Row from "./row";
import {SupportedColumnType} from "./columnType";
import { isEqual } from "lodash";

/**
 * Relation from relational algebra. It contains relational schema (set of columns' names and types)
 * and relation's relation (set of rows).
 */
export default class Relation {

    public readonly name: string;
    private columns = new Map<string, SupportedColumnType>();
    private columnNames: string[] = []; // array to have an ordered printing of columns
    private rows: Row[] = [];
    private finishedSchema = false;

    /**
     * Creates an empty relation of the given name.
     *
     * @param name name of the relation
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Returns name of the relation.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * @return true if the relational schema is finished (no more columns can be added)
     */
    public hasFinishedSchema(): boolean {
        return this.finishedSchema;
    }

    /**
     * Sets the relational schema finished (no more columns can be added).
     */
    public finishSchema(): void {
        this.finishedSchema = true;
    }

    /**
     * Adds a column to a relational schema if the relational schema is not finished yet.
     *
     * @param name name of the column
     * @param type type of the column
     * @return true if the column was added (relation did not contain a column with the same name before)
     */
    public addColumn(name: string, type: SupportedColumnType): boolean {
        if (!this.hasColumn(name) && !this.hasFinishedSchema()) {
            this.columns.set(name, type);
            this.columnNames.push(name);
            return true;
        }
        return false;
    }

    /**
     * Checks whether the relation has a column with the same name
     * (NOTE: type of the column does not matter).
     *
     * @param name Column name to be checked
     * @return true if the relation has a column with the same name
     */
    public hasColumn(name: string): boolean {
        return this.columnNames.some(cn => cn === name);
    }

    /**
     * @return map (name -> value) of columns' values in a relation.
     */
    public getColumns(): Map<string, SupportedColumnType> {
        return this.columns;
    }

    /**
     * @param f function to be applied for each column in the relation
     */
    public forEachColumn(f: (type: SupportedColumnType, name: string) => void): void {
        return this.columns.forEach(f);
    }

    /**
     * @return array of column names in a relation.
     */
    public getColumnNames(): string[] {
        return this.columnNames;
    }

    /**
     * @return Number of columns in a relation.
     */
    public getColumnsCount(): number {
        return this.columnNames.length;
    }

    /**
     * Adds a row to a relation. The row must have the same column set as the relation. If the row was added,
     * sets the row finished and returns true. Also the relational schema of this relation
     * is set finished (no more columns can be added). If the row was not added, returns false.
     * NOTE: Rows in a relation cannot be duplicit, adding a duplicit row returns true, but only one is kept.
     *
     * @param row row to be added
     * @return true if the row was added, false otherwise
     */
    public addRow(row: Row): boolean {
        if (isEqual(row.getTypes(), this.columns)) {
            this.finishSchema();
            row.finish();
            if (!this.rows.some(r => r.equals(row))) {
                this.rows.push(row);
            }
            return true;
        }
        return false;
    }

    /**
     * @return array of rows in a relation.
     */
    public getRows(): Row[] {
        return this.rows;
    }

    /**
     * @return Number of rows in a relation.
     */
    public getRowsCount(): number {
        return this.rows.length;
    }

    /**
     * Returns a relational schema in a format: RelationName(ColumnOneName: ColumnOneType, ...) - both column names
     * and column types are used.
     *
     * @return relational schema as a string
     */
    public getSchemaString(): string {
        return this.name + "(" + [...this.columns].map(s => s[0] + ": " + s[1]).join(", ") + ")";
    }

    /**
     * Returns a relational schema in a format: RelationName(ColumnOneName, ...) - only column names are used.
     *
     * @return relational schema as a string
     */
    public getNamesSchemaString(): string {
        return this.name + "(" + this.columnNames.join(", ") + ")";
    }

    /**
     * Returns a string representation of the relation content (column names, column types and rows).
     *
     * @return string representation of the relation
     */
    public contentString(): string {
        const names = this.columnNames.join(', ') + '\n';
        const types = this.columnNames.map((name) => this.columns.get(name)).join(', ') + '\n';
        const rows = [...this.rows].map(row => row.getOrderedValues(this.columnNames).join(', ')).join('\n');
        return names + types + rows;
    }

    /**
     * Custom equals function for testing purposes.
     *
     * @param other
     */
    public equals(other: any): boolean {
        if (other instanceof Relation) {
            return this.name === other.name &&
                isEqual(this.columns, other.columns) &&
                isEqual(new Set(this.rows), new Set(other.rows));
        }
        return false;
    }
}