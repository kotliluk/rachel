import {IndexedString} from "./indexedString";

interface KeyValue {
    key: string | IndexedString,
    value: string | IndexedString
}

/**
 * Wrapper of JavaScript Map object to provide usage of object (string | IndexedString) as a key.
 * Keys "IndexedString: something" and "string: something" are equal for this map.
 */
export class ISSToISSMap {
    private map: Map<string, KeyValue> = new Map<string, KeyValue>();

    public get(key: string | IndexedString): string | IndexedString | undefined {
        const keyValue = this.map.get(key.toString());
        return keyValue === undefined ? undefined : keyValue.value;
    }

    public set(key: string | IndexedString, value: string | IndexedString): void {
        this.map.set(key.toString(), {key, value});
    }

    public delete(key: string | IndexedString): boolean {
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

    public forEach(f: (value: string | IndexedString, row: string | IndexedString, index?: number) => void): void {
        [...this.map.values()].forEach((keyValue, index) => f(keyValue.value, keyValue.key, index));
    }
}