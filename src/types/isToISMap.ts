import {IndexedString} from "./indexedString";

interface KeyValue {
    key: IndexedString,
    value: IndexedString
}

/**
 * Wrapper of JavaScript Map object to provide usage of object IndexedString as a key for IndexedString values.
 */
export class ISToISMap {
    private map: Map<string, KeyValue> = new Map<string, KeyValue>();

    public get(key: string | IndexedString): IndexedString | undefined {
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