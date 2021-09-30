import {IndexedString} from "./indexedString";

/**
 * Wrapper of JavaScript Map object to provide usage of object (row: number | "name", column: number) as a key for
 * string values.
 * @category Types
 * @public
 */
export class NNToSMap {
    protected map: Map<string, string> = new Map<string, string>();

    /**
     * Gets the value for the given key (row, column).
     *
     * @param row row part of the key {@type (number | "name")}
     * @param column row column of the key {@type number}
     * @return value of the given key or undefined {@type string?}
     * @public
     */
    public get(row: number | "name", column: number): string | undefined {
        return this.map.get(row + ":" + column);
    }

    /**
     * Sets the value of the given key (row, column).
     *
     * @param row row part of the key {@type (number | "name")}
     * @param column row column of the key {@type number}
     * @param value value to set {@type string}
     * @public
     */
    public set(row: number | "name", column: number, value: string): void {
        this.map.set(row + ":" + column, value);
    }

    /**
     * Deletes the value for the given key (row, column).
     *
     * @param row row part of the key {@type (number | "name")}
     * @param column row column of the key {@type number}
     * @return true if an element in the Map object existed and has been removed, or false if the element does not exist {@type boolean}
     * @public
     */
    public delete(row: number | "name", column: number): boolean {
        return this.map.delete(row + ":" + column);
    }

    /**
     * Returns true, if the given row and column is in the map.
     *
     * @param row row part of the key {@type (number | "name")}
     * @param column row column of the key {@type number}
     * @return true, if the given key is in the map {@type boolean}
     * @public
     */
    public has(row: number | "name", column: number): boolean {
        return this.map.has(row + ":" + column);
    }

    /**
     * Removes all values from the map.
     * @public
     */
    public clear(): void {
        this.map.clear();
    }

    /**
     * Returns the size og the map.
     *
     * @return size of the map {@type number}
     * @public
     */
    public size(): number {
        return this.map.size;
    }

    /**
     * Performs the given function for each (value, row, column, index) in the map.
     *
     * @param f function to perform {@type function}
     * @public
     */
    public forEach(f: (value: string, row: number | "name", column: number, index?: number) => void): void {
        [...this.map.entries()]
            .map((entry) => {return {value: entry[1], key: NNToSMap.parseKey(entry[0])}})
            .forEach((entry, index) => f(entry.value, entry.key.row, entry.key.column, index));
    }

    private static parseKey(key: string): {row: number | "name", column: number} {
        const split = key.split(':');
        const rowNumber = Number(split[0]);
        return {row: isNaN(rowNumber) ? "name" : rowNumber, column: Number(split[1])};
    }
}
