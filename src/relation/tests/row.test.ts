import {Row} from "../row";
import {SupportedColumnType} from "../columnType";


const columns = new Map<string, SupportedColumnType>();
columns.set("First", "string");
columns.set("Second", "number");
let row = new Row(columns);

beforeEach(() => {
    row = new Row(columns);
});

describe('is created correctly', () => {
    test('should not be finished after creation', () => {
        // assert
        const finished = row.isFinished();
        expect(finished).toBeFalsy();
    });

    test('should contain initial columns', () => {
        const added = [...row.getColumnNames()];
        expect(added.length).toBe(2);

        expect(added.indexOf("First")).toBeGreaterThan(-1);
        expect(added.indexOf("Second")).toBeGreaterThan(-1);
    });

    test('should contain initial columns with null values', () => {
        const added = [...row.getColumnNames()];
        expect(added.length).toBe(2);

        expect(row.getValue("First")).toBeNull();
        expect(row.getValue("Second")).toBeNull();
    });

    test('should contain initial columns with correct types', () => {
        const added = [...row.getColumnNames()];
        expect(added.length).toBe(2);

        expect(row.getType("First")).toBe("string");
        expect(row.getType("Second")).toBe("number");
    });
});

test.each([
    { name: "First", value: "Some string", expectedAdded: true, expectedGotValue: "Some string" },
    { name: "Second", value: 10.01, expectedAdded: true, expectedGotValue: 10.01 },
    { name: "First", value: 10.01, expectedAdded: false, expectedGotValue: null },
    { name: "Third", value: "abc", expectedAdded: false, expectedGotValue: undefined },
])('adds values correctly: %s', ({ name, value, expectedAdded, expectedGotValue }) => {
    // act
    const actualAdded = row.addValue(name, value);
    const actualGotValue = row.getValue(name);
    // assert
    expect(actualAdded).toBe(expectedAdded);
    expect(actualGotValue).toBe(expectedGotValue);
});
