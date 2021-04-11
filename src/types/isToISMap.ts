import {IndexedString} from "./indexedString";

interface KeyValue {
    key: IndexedString,
    value: IndexedString
}

/**
 * Wrapper of JavaScript Map object to provide usage of object (string | IndexedString) as a key for (string |
 * IndexedString) values.
 * Keys "IndexedString: something" and "string: something" are equal for this map.
 */
export class ISToISMap {
    private map: Map<string, KeyValue> = new Map<string, KeyValue>();

    public get(key: string | IndexedString): string | IndexedString | undefined {
        const keyValue = this.map.get(key.toString());
        return keyValue === undefined ? undefined : keyValue.value;
    }

    public set(key: IndexedString, value: IndexedString): void {
        this.map.set(key.toString(), {key, value});
    }

    public delete(key: IndexedString): boolean {
        return this.map.delete(key.toString());
    }

    public has(key: string | IndexedString): boolean {
        return this.map.has(key.toString());
    }

    public clear(): void {
        this.map.clear();
    }

    public size(): number {
        return this.map.size;
    }

    public forEach(f: (value: IndexedString, row: IndexedString, index?: number) => void): void {
        [...this.map.values()].forEach((keyValue, index) => f(keyValue.value, keyValue.key, index));
    }
}