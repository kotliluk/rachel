import {NNToSMap} from "../nnToSMap";


const testInitData: { row: number | 'name', column: number, value: string }[] = [
  { row: 0, column: 0, value: 'value0' },
  { row: "name", column: 1, value: 'value1' },
]

/**
 * Extended test class to support initial data filling.
 */
class NNToSMapTest extends NNToSMap {
  constructor(initData: { row: number | 'name', column: number, value: string }[]) {
    super();
    this.map = new Map<string, string>(initData.map(({ row, column, value }) => {
      return [ row + ':' + column, value ]
    }));
  }
}


describe('get', () => {
  test.each([
    ...testInitData,
    // absent row
    { row: 8, column: 0, value: undefined },
    // absent column
    { row: 0, column: 8, value: undefined },
  ])('%s', ({ row, column, value }) => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);
    // act
    const actual = mockedMap.get(row, column);
    // assert
    expect(actual).toBe(value);
  });
});

describe('has', () => {
  test.each([
    ...testInitData.map(({ row, column }) => { return { row, column, expected: true }; }),
    // absent row
    { row: 8, column: 0, expected: false },
    // absent column
    { row: 0, column: 8, expected: false },
  ])('%s', ({ row, column, expected }) => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);
    // act
    const actual = mockedMap.has(row, column);
    // assert
    expect(actual).toBe(expected);
  });
});

describe('size', () => {
  test('empty init', () => {
    // arrange
    const mockedMap = new NNToSMapTest([]);
    // act
    const size = mockedMap.size();
    // assert
    expect(size).toBe(0);
  });

  test('init with two objects', () => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);
    // act
    const size = mockedMap.size();
    // assert
    expect(size).toBe(2);
  });
});

describe('clear', () => {
  test('removes all inputs', () => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);
    // act
    mockedMap.clear();
    // assert
    const size = mockedMap.size();
    expect(size).toBe(0);
  });
});

describe('delete', () => {
  test('behaves correctly', () => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);

    const row0IS = testInitData[0].row;
    const column0IS = testInitData[0].column;

    const row1IS = testInitData[1].row;
    const column1IS = testInitData[1].column;

    const absentRowIS = 8;
    const absentColumnIS = 8;
    // act
    const hasKey0Before = mockedMap.has(row0IS, column0IS);
    const deleteKey0Result = mockedMap.delete(row0IS, column0IS);
    const hasKey0After = mockedMap.has(row0IS, column0IS);

    const hasKey1Before = mockedMap.has(row1IS, column1IS);
    const deleteKey1Result = mockedMap.delete(row1IS, column1IS);
    const hasKey1After = mockedMap.has(row1IS, column1IS);

    const hasAbsentKeyBefore = mockedMap.has(absentRowIS, absentColumnIS);
    const deleteAbsentKeyResult = mockedMap.delete(absentRowIS, absentColumnIS);
    const hasAbsentKeyAfter = mockedMap.has(absentRowIS, absentColumnIS);
    // assert
    const size = mockedMap.size();
    expect(size).toBe(0);

    expect(hasKey0Before).toBe(true);
    expect(deleteKey0Result).toBe(true);
    expect(hasKey0After).toBe(false);

    expect(hasKey1Before).toBe(true);
    expect(deleteKey1Result).toBe(true);
    expect(hasKey1After).toBe(false);

    expect(hasAbsentKeyBefore).toBe(false);
    expect(deleteAbsentKeyResult).toBe(false);
    expect(hasAbsentKeyAfter).toBe(false);
  });
});

describe('set', () => {
  test('changes values', () => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);

    const row0 = testInitData[0].row;
    const column0 = testInitData[0].column;
    const changedValue = 'changed value';
    // act
    mockedMap.set(row0, column0, changedValue);
    // assert
    const size = mockedMap.size();
    expect(size).toBe(2);

    const hasKey0 = mockedMap.has(row0, column0);
    const gotChangedValue = mockedMap.get(row0, column0);
    expect(hasKey0).toBe(true);
    expect(gotChangedValue).toBeDefined();
    expect(gotChangedValue).toStrictEqual(changedValue);
  });

  test('adds values', () => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);

    const newRow = 'name';
    const newColumn = 5;
    const newValue = 'changed value';
    // act
    mockedMap.set(newRow, newColumn, newValue);
    // assert
    const size = mockedMap.size();
    expect(size).toBe(3);

    const hasNewKey = mockedMap.has(newRow, newColumn);
    const gotNewValue = mockedMap.get(newRow, newColumn);
    expect(hasNewKey).toBe(true);
    expect(gotNewValue).toBeDefined();
    expect(gotNewValue).toStrictEqual(newValue);
  });
});

describe('forEach', () => {
  test('process all inputs', () => {
    // arrange
    const mockedMap = new NNToSMapTest(testInitData);
    const arr: any[] = [];
    const expected = [
      testInitData[0].value, testInitData[0].row, testInitData[0].column, 0,
      testInitData[1].value, testInitData[1].row, testInitData[1].column, 1,
    ];
    // act
    mockedMap.forEach((value, row, column, index) => {
      arr.push(value);
      arr.push(row);
      arr.push(column);
      arr.push(index);
    });
    // assert
    const size = mockedMap.size();
    expect(size).toBe(2);
    expect(arr).toStrictEqual(expected);
  });
});
