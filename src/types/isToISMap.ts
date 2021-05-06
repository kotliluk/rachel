import {IndexedString} from "./indexedString";

interface KeyValue {
    key: IndexedString,
    value: IndexedString
}

/**
 * Wrapper of JavaScript Map object to provide usage of object {@link IndexedString} as a key for {@link IndexedString} values.
 * @public
 */
export class ISToISMap {
    private map: Map<string, KeyValue> = new Map<string, KeyValue>();

    /**
     * Gets the value for the given key.
     *
     * @param key key of the value to get {@type (string | IndexedString)}
     * @return value of the given key or undefined {@type IndexedString?}
     * @public
     */
    public get(key: string | IndexedString): IndexedString | undefined {
        const keyValue = this.map.get(key.toString());
        return keyValue === undefined ? undefined : keyValue.value;
    }

    /**
     * Sets the value for the given key.
     *
     * @param key key of the value to set {@type IndexedString}
     * @param value value to set {@type IndexedString}
     * @public
     */
    public set(key: IndexedString, value: IndexedString): void {
        this.map.set(key.toString(), {key, value});
    }

    /**
     * Deletes the value for the given key.
     *
     * @param key key of the value to delete {@type IndexedString}
     * @return true if an element in the Map object existed and has been removed, or false if the element does not exist {@type boolean}
     * @public
     */
    public delete(key: IndexedString): boolean {
        return this.map.delete(key.toString());
    }

    /**
     * Returns true, if the given key is in the map.
     *
     * @param key key to check {@type (string | IndexedString)}
     * @return true, if the given key is in the map {@type boolean}
     * @public
     */
    public has(key: string | IndexedString): boolean {
        return this.map.has(key.toString());
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
     * Performs the given function for each (value, key, index) in the map.
     *
     * @param f function to perform {@type function}
     * @public
     */
    public forEach(f: (value: IndexedString, row: IndexedString, index?: number) => void): void {
        [...this.map.values()].forEach((keyValue, index) => f(keyValue.value, keyValue.key, index));
    }
}