import {StoredRelation} from "../storedRelation";


const name = "ABC"

const getStoredRelation = (): StoredRelation => {
    return StoredRelation.new(name, true)
}

test('constructor creates one default column', () => {
    // arrange
    const expectedColumnNames = ["Column1"];
    const expectedColumnTypes = ["number"];
    const expectedRows: string[][] = [];
    // act
    const actual: StoredRelation = getStoredRelation();
    // assert
    expect(actual)
      .toHaveName(name)
      .toHaveColumnNames(expectedColumnNames)
      .toHaveColumnTypes(expectedColumnTypes)
      .toHaveRows(expectedRows);
});

test('addNewColumn adds a column with expected name and type', () => {
    // arrange
    const expectedColumnNames = ["Column1", "Column2"];
    const expectedColumnTypes = ["number", "number"];
    const expectedRows: string[][] = [];
    const actual: StoredRelation = getStoredRelation();
    // act
    actual.addNewColumn();
    // assert
    expect(actual)
      .toHaveColumnNames(expectedColumnNames)
      .toHaveColumnTypes(expectedColumnTypes)
      .toHaveRows(expectedRows);
});

test('addNewRow adds a row with empty values', () => {
    // arrange
    const expectedRows: string[][] = [[""]];
    const actual: StoredRelation = getStoredRelation();
    // act
    actual.addNewRow();
    // assert
    expect(actual).toHaveRows(expectedRows);
});

test('deleteColumn', () => {
    // arrange
    const expectedColumnNames = ["Column1", "Column3"];
    const expectedColumnTypes = ["number", "number"];
    const expectedRows: string[][] = [["", ""]];
    const actual: StoredRelation = getStoredRelation();
    actual.addNewColumn();
    actual.addNewRow();
    actual.addNewColumn();
    // act
    actual.deleteColumn(1);
    // assert
    expect(actual)
      .toHaveColumnNames(expectedColumnNames)
      .toHaveColumnTypes(expectedColumnTypes)
      .toHaveRows(expectedRows);
});

test('deleteRow', () => {
    // arrange
    const expectedRows: string[][] = [["", ""]];
    const actual: StoredRelation = getStoredRelation();
    actual.addNewRow();
    actual.addNewColumn();
    actual.addNewRow();
    // act
    actual.deleteRow(1);
    // assert
    expect(actual).toHaveRows(expectedRows);
});
