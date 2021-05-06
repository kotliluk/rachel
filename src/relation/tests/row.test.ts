import {Row} from "../row";
import {SupportedColumnType} from "../columnType";

let columns = new Map<string, SupportedColumnType>();
columns.set("First", "string");
columns.set("Second", "string");
columns.set("Third", "number");
let row = new Row(columns);

test('is created correctly', () => {
    expect(row.isFinished()).toBeFalsy(); // should not be finished after creation

    let added = [...row.getColumnNames()];
    expect(added.length).toBe(3);
    expect(added.indexOf("First") > -1).toBeTruthy();
    expect(added.indexOf("Second") > -1).toBeTruthy();
    expect(added.indexOf("Third") > -1).toBeTruthy();

    expect(row.getValue("First")).toBeNull();
    expect(row.getValue("Second")).toBeNull();
    expect(row.getValue("Third")).toBeNull();
});

test('adds values correctly', () => {
    expect(row.addValue("First", "Some string")).toBeTruthy();
    expect(row.addValue("First", "New string")).toBeTruthy();
    expect(row.addValue("First", 5)).toBeFalsy(); // should not add a different type
    expect(row.getValue("First")).toBe("New string");
});

test('returns undefined for absent columns', () => {
    expect(row.getValue("Absent")).toBeUndefined();
});