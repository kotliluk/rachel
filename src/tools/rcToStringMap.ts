/**
 * Wrapper of JavaScript Map object to provide usage of object {row: number | "name", column: number} as a key.
 */
export class RCToStringMap {
    private map: Map<string, string> = new Map<string, string>();

    public get(row: number | "name", column: number): string | undefined {
        return this.map.get(row + ":" + column);
    }

    public set(row: number | "name", column: number, value: string): void {
        this.map.set(row + ":" + column, value);
    }

    public delete(row: number | "name", column: number): boolean {
        return this.map.delete(row + ":" + column);
    }

    public clear(): void {
        this.map.clear();
    }

    public size(): number {
        return this.map.size;
    }

    public forEach(f: (value: string, row: number | "name", column: number, index?: number) => void): void {
        [...this.map.entries()]
            .map((entry) => {return {value: entry[1], key: RCToStringMap.parseKey(entry[0])}})
            .forEach((entry, index) => f(entry.value, entry.key.row, entry.key.column, index));
    }

    private static parseKey(key: string): {row: number | "name", column: number} {
        const split = key.split(':');
        return {row: Number(split[0]), column: Number(split[1])};
    }
}