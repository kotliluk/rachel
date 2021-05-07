import {Row} from "./row";
import {SupportedColumnType} from "./columnType";
import {isEqual} from "lodash";

/**
 * Formal relational algebra relation. It contains relational schema (set of column names and types)
 * and data tuples (set of rows). For editable representation which may happen to be invalid, use {@link StoredRelation}.
 *
 * @category Relation
 * @public
 */
export class Relation {

    public readonly name: string;
    private columns = new Map<string, SupportedColumnType>();
    private columnNames: string[] = []; // array to have an ordered printing of columns
    private rows: Row[] = [];
    private finishedSchema = false;

    /**
     * Creates an empty relation of the given name.
     *
     * @param name name of the relation {@type string}
     * @public
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Returns name of the relation.
     *
     * @return relation name {@type string}
     * @public
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Returns true if the relational schema is finished (no more columns can be added).
     *
     * @return true if the relational schema is finished (no more columns can be added) {@type boolean}
     * @public
     */
    public hasFinishedSchema(): boolean {
        return this.finishedSchema;
    }

    /**
     * Sets the relational schema finished (no more columns can be added).
     * @public
     */
    public finishSchema(): void {
        this.finishedSchema = true;
    }

    /**
     * Adds a column to a relational schema if the relational schema is not finished yet.
     *
     * @param name name of the column {@type string}
     * @param type type of the column {@type SupportedColumnType}
     * @return true if the column was added (relation did not contain a column with the same name before) {@type boolean}
     * @public
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
     * @param name Column name to be checked {@type string}
     * @return true if the relation has a column with the same name {@type boolean}
     * @public
     */
    public hasColumn(name: string): boolean {
        return this.columnNames.some(cn => cn === name);
    }

    /**
     * Returns map (name -> value) of column values in a relation.
     *
     * @return map of column values in a relation {@type Map<String, SupportedColumnType>}
     * @public
     */
    public getColumns(): Map<string, SupportedColumnType> {
        return this.columns;
    }

    /**
     * Applies the given function to each column in the relation.
     *
     * @param f function to be applied to each column in the relation {@type function}
     * @public
     */
    public forEachColumn(f: (type: SupportedColumnType, name: string) => void): void {
        return this.columns.forEach(f);
    }

    /**
     * Return column names  in a relation.
     *
     * @return array of column names in a relation {@type string[]}
     * @public
     */
    public getColumnNames(): string[] {
        return this.columnNames;
    }

    /**
     * Returns number of columns in a relation.
     *
     * @return number of columns in a relation {@type number}
     * @public
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
     * @param row row to be added {@type Row}
     * @return true if the row was added, false otherwise {@type boolean}
     * @public
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
     * Returns all rows in a relation.
     *
     * @return array of rows in a relation {@type Row[]}
     * @public
     */
    public getRows(): Row[] {
        return this.rows;
    }

    /**
     * Returns the number of rows in a relation.
     *
     * @return number of rows in a relation {@type number}
     * @public
     */
    public getRowsCount(): number {
        return this.rows.length;
    }

    /**
     * Returns a relational schema in a format: RelationName(ColumnOneName: ColumnOneType, ...) - both column names
     * and column types are used.
     *
     * @return relational schema as a string {@type string}
     * @public
     */
    public getSchemaString(): string {
        return this.name + "(" + [...this.columns].map(s => s[0] + ": " + s[1]).join(", ") + ")";
    }

    /**
     * Returns a relational schema in a format: RelationName(ColumnOneName, ...) - only column names are used.
     *
     * @return relational schema as a string {@type string}
     * @public
     */
    public getNamesSchemaString(): string {
        return this.name + "(" + this.columnNames.join(", ") + ")";
    }

    /**
     * Returns a formatted string representation of the relation content (column names, column types and rows).
     *
     * @return string representation of the relation {@type string}
     * @public
     */
    public contentString(): string {
        // @ts-ignore - prepares array representation of types and rows
        const columnTypes: SupportedColumnType[] = this.columnNames.map(name => this.columns.get(name));
        const rows = [...this.rows].map(row => row.getOrderedPrintValues(this.columnNames));
        // finds longest inputs in each column
        const longest = this.columnNames.map(n => n.length);
        columnTypes.forEach((type, i) => {
            if (type.length > longest[i]) {
                longest[i] = type.length;
            }
        })
        rows.forEach(r => {
            r.forEach((d, i) => {
                if (longest[i] < d.length) {
                    longest[i] = d.length;
                }
            });
        });
        // function for end-padding strings with spaces
        const pad = (ss: string[]) => ss.map((s, i) => s.padEnd(longest[i], " ")).join(' | ');
        return pad(this.columnNames) + '\n' +
            pad(columnTypes) + '\n' +
            longest.map(n => "-".repeat(n)).join("-+-") + '\n' +
            rows.map(r => pad(r)).join('\n');
    }

    /**
     * Custom equals function for testing purposes.
     *
     * @param other an object to compare {@type any}
     * @return true if this and given objects have same name, columns, and rows {@type boolean}
     * @public
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