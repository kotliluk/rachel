import {ISToISMap, KeyValue} from "../isToISMap";
import {IndexedString} from "../indexedString";


const testInitData = [
  { key: 'key0', value: 'value0' },
  { key: 'key1', value: 'value1' },
]

/**
 * Extended test class to support initial data filling.
 */
class IsToISMapTest extends ISToISMap {
  constructor(initData: { key: string, value: string }[]) {
    super();
    this.map = new Map<string, KeyValue>(initData.map(({ key, value }) => {
      return [ key, { key: IndexedString.new(key), value: IndexedString.new(value) }]
    }));
  }
}


describe('get', () => {
  test.each([
    // present string keys
    ...testInitData.map(({ key, value }) => { return { key, expected: IndexedString.new(value) }; }),
    // present indexed string keys
    ...testInitData.map(({ key, value }) => { return { key: IndexedString.new(key), expected: IndexedString.new(value) }; }),
    // absent string key
    { key: 'absent', expected: undefined },
    // absent indexed string key
    { key: IndexedString.new('absent'), expected: undefined },
  ])('%s', ({ key, expected }) => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);
    // act
    const actual = mockedMap.get(key);
    // assert
    if (expected) {
      expect(actual).toBeDefined();
      expect(actual?.toString()).toStrictEqual(expected.toString());
    }
    else {
      expect(actual).toBeUndefined();
    }
  });
});

describe('has', () => {
  test.each([
    // present string keys
    ...testInitData.map(({ key }) => { return { key, expected: true }; }),
    // present indexed string keys
    ...testInitData.map(({ key }) => { return { key: IndexedString.new(key), expected: true }; }),
    // absent string key
    { key: 'absent', expected: false },
    // absent indexed string key
    { key: IndexedString.new('absent'), expected: false },
  ])('%s', ({ key, expected }) => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);
    // act
    const actual = mockedMap.has(key);
    // assert
    expect(actual).toBe(expected);
  });
});

describe('size', () => {
  test('empty init', () => {
    // arrange
    const mockedMap = new IsToISMapTest([]);
    // act
    const size = mockedMap.size();
    // assert
    expect(size).toBe(0);
  });

  test('init with two objects', () => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);
    // act
    const size = mockedMap.size();
    // assert
    expect(size).toBe(2);
  });
});

describe('clear', () => {
  test('removes all inputs', () => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);
    // act
    mockedMap.clear();
    // assert
    const size = mockedMap.size();
    const hasKey = mockedMap.has(testInitData[0].key);
    expect(size).toBe(0);
    expect(hasKey).toBe(false);
  });
});

describe('delete', () => {
  test('behaves correctly', () => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);
    const key0IS = IndexedString.new(testInitData[0].key);
    const key1IS = IndexedString.new(testInitData[1].key);
    const absentKeyIS = IndexedString.new('absent');
    // act
    const hasKey0Before = mockedMap.has(key0IS);
    const deleteKey0Result = mockedMap.delete(key0IS);
    const hasKey0After = mockedMap.has(key0IS);
    const hasKey1Before = mockedMap.has(key1IS);
    const deleteKey1Result = mockedMap.delete(key1IS);
    const hasKey1After = mockedMap.has(key1IS);
    const hasAbsentKeyBefore = mockedMap.has(absentKeyIS);
    const deleteAbsentKeyResult = mockedMap.delete(absentKeyIS);
    const hasAbsentKeyAfter = mockedMap.has(absentKeyIS);
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
    const mockedMap = new IsToISMapTest(testInitData);

    const key0IS = IndexedString.new(testInitData[0].key);
    const changedValue0IS = IndexedString.new('changed value');
    // act
    mockedMap.set(key0IS, changedValue0IS);
    // assert
    const size = mockedMap.size();
    expect(size).toBe(2);

    const hasKey0 = mockedMap.has(key0IS);
    const gotChangedValue = mockedMap.get(key0IS);
    expect(hasKey0).toBe(true);
    expect(gotChangedValue).toBeDefined();
    expect(gotChangedValue?.toString()).toStrictEqual(changedValue0IS.toString());
  });

  test('adds values', () => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);

    const newKeyIS = IndexedString.new('new key');
    const newValueIS = IndexedString.new('new value');
    // act
    mockedMap.set(newKeyIS, newValueIS);
    // assert
    const size = mockedMap.size();
    expect(size).toBe(3);

    const hasNewKey = mockedMap.has(newKeyIS);
    const gotNewValue = mockedMap.get(newKeyIS);
    expect(hasNewKey).toBe(true);
    expect(gotNewValue).toBeDefined();
    expect(gotNewValue?.toString()).toStrictEqual(newValueIS.toString());
  });
});

describe('forEach', () => {
  test('process all inputs', () => {
    // arrange
    const mockedMap = new IsToISMapTest(testInitData);
    const arr: any[] = [];
    const expected = [ testInitData[0].value, testInitData[0].key, 0, testInitData[1].value, testInitData[1].key, 1 ];
    // act
    mockedMap.forEach((value, key, index) => {
      arr.push(value.toString());
      arr.push(key.toString());
      arr.push(index);
    });
    // assert
    const size = mockedMap.size();
    expect(size).toBe(2);
    expect(arr).toStrictEqual(expected);
  });
});
