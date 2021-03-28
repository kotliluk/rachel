import {StoredRelation} from "../storedRelation";

test('constructor creates one default column', () => {
    // arrange
    const expectedName = "ABC"
    const expectedColumnNames = ["Column1"];
    const expectedColumnTypes = ["number"];
    const expectedRows: string[][] = [];
    // act
    const actual: StoredRelation = StoredRelation.new(expectedName, true);
    // assert
    expect(actual.getColumnNames()).toStrictEqual(expectedColumnNames);
    expect(actual.getColumnTypes()).toStrictEqual(expectedColumnTypes);
    expect(actual.getRows()).toStrictEqual(expectedRows);
    expect(actual.getName()).toStrictEqual(expectedName);
});

test('addNewColumn', () => {
    // arrange
    const expectedName = "ABC"
    const expectedColumnNames = ["Column1", "Column2"];
    const expectedColumnTypes = ["number", "number"];
    const expectedRows: string[][] = [];
    const actual: StoredRelation = StoredRelation.new(expectedName, true);
    // act
    actual.addNewColumn();
    // assert
    expect(actual.getColumnNames()).toStrictEqual(expectedColumnNames);
    expect(actual.getColumnTypes()).toStrictEqual(expectedColumnTypes);
    expect(actual.getRows()).toStrictEqual(expectedRows);
    expect(actual.getName()).toStrictEqual(expectedName);
});

test('addNewRow', () => {
    // arrange
    const expectedName = "ABC"
    const expectedColumnNames = ["Column1"];
    const expectedColumnTypes = ["number"];
    const expectedRows: string[][] = [[""]];
    const actual: StoredRelation = StoredRelation.new(expectedName, true);
    // act
    actual.addNewRow();
    // assert
    expect(actual.getColumnNames()).toStrictEqual(expectedColumnNames);
    expect(actual.getColumnTypes()).toStrictEqual(expectedColumnTypes);
    expect(actual.getRows()).toStrictEqual(expectedRows);
    expect(actual.getName()).toStrictEqual(expectedName);
});

test('addNewColumn + addNewRow', () => {
    // arrange
    const expectedName = "ABC"
    const expectedColumnNames = ["Column1", "Column2", "Column3"];
    const expectedColumnTypes = ["number", "number", "number"];
    const expectedRows: string[][] = [
        ["", "", ""],
        ["", "", ""]
    ];
    const actual: StoredRelation = StoredRelation.new(expectedName, true);
    // act
    actual.addNewColumn();
    actual.addNewRow();
    actual.addNewColumn();
    actual.addNewRow();
    // assert
    expect(actual.getColumnNames()).toStrictEqual(expectedColumnNames);
    expect(actual.getColumnTypes()).toStrictEqual(expectedColumnTypes);
    expect(actual.getRows()).toStrictEqual(expectedRows);
    expect(actual.getName()).toStrictEqual(expectedName);
});

test('deleteColumn', () => {
    // arrange
    const expectedName = "ABC"
    const expectedColumnNames = ["Column1", "Column3"];
    const expectedColumnTypes = ["number", "number"];
    const expectedRows: string[][] = [
        ["", ""],
        ["", ""]
    ];
    const actual: StoredRelation = StoredRelation.new(expectedName, true);
    actual.addNewColumn();
    actual.addNewRow();
    actual.addNewColumn();
    actual.addNewRow();
    // act
    actual.deleteColumn(1);
    // assert
    expect(actual.getColumnNames()).toStrictEqual(expectedColumnNames);
    expect(actual.getColumnTypes()).toStrictEqual(expectedColumnTypes);
    expect(actual.getRows()).toStrictEqual(expectedRows);
    expect(actual.getName()).toStrictEqual(expectedName);
});

test('deleteRow', () => {
    // arrange
    const expectedName = "ABC"
    const expectedColumnNames = ["Column1", "Column2", "Column3"];
    const expectedColumnTypes = ["number", "number", "number"];
    const expectedRows: string[][] = [
        ["", "", ""],
        ["", "", ""]
    ];
    const actual: StoredRelation = StoredRelation.new(expectedName, true);
    actual.addNewColumn();
    actual.addNewRow();
    actual.addNewColumn();
    actual.addNewRow();
    actual.addNewRow();
    // act
    actual.deleteRow(1);
    // assert
    expect(actual.getColumnNames()).toStrictEqual(expectedColumnNames);
    expect(actual.getColumnTypes()).toStrictEqual(expectedColumnTypes);
    expect(actual.getRows()).toStrictEqual(expectedRows);
    expect(actual.getName()).toStrictEqual(expectedName);
});