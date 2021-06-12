import {createCountComparator, createOperationsCounter} from "../configUtils";
import {OperationsCount} from "../operationsCount";

describe('createCountComparator', () => {
  test('number count', () => {
    // arrange
    const count = 5;
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeTruthy();
      expect(comparator(6)).toBeFalsy();
    }
  });

  test('object count - eq only', () => {
    // arrange
    const count = { "$eq": 5 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeTruthy();
      expect(comparator(6)).toBeFalsy();
    }
  });

  test('object count - gte only', () => {
    // arrange
    const count = { "$gte": 5 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeTruthy();
      expect(comparator(6)).toBeTruthy();
    }
  });

  test('object count - gt only', () => {
    // arrange
    const count = { "$gt": 5 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeFalsy();
      expect(comparator(6)).toBeTruthy();
    }
  });

  test('object count - lte only', () => {
    // arrange
    const count = { "$lte": 5 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeTruthy();
      expect(comparator(5)).toBeTruthy();
      expect(comparator(6)).toBeFalsy();
    }
  });

  test('object count - lt only', () => {
    // arrange
    const count = { "$lt": 5 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeTruthy();
      expect(comparator(5)).toBeFalsy();
      expect(comparator(6)).toBeFalsy();
    }
  });

  test('object count - gte and lte', () => {
    // arrange
    const count = { "$gte": 5, "$lte": 6 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeTruthy();
      expect(comparator(6)).toBeTruthy();
    }
  });

  test('object count - gt and lt', () => {
    // arrange
    const count = { "$gt": 5, "$lt": 6 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeFalsy();
      expect(comparator(6)).toBeFalsy();
    }
  });

  test('object count - all', () => {
    // arrange
    const count = { "$eq": 5, "$gte": 4, "$lte": 6, "$gt": 4, "$lt": 6 };
    // act
    const comparator = createCountComparator(count);
    // assert
    expect(comparator).toBeDefined();
    if (comparator) {
      expect(comparator(4)).toBeFalsy();
      expect(comparator(5)).toBeTruthy();
      expect(comparator(6)).toBeFalsy();
    }
  });
});

const operations: OperationsCount = {
  antijoin: 2,
  cartesian: 3,
  division: 4,
  natural: 1,
  outerJoin: 1,
  projection: 1,
  rename: 1,
  selection: 1,
  semijoin: 1,
  setOperation: 1,
  thetaJoin: 1,
  thetaSemijoin: 1
}

describe('createOperationsCounter', () => {
  test('string ops', () => {
    // arrange
    const ops = "antijoin";
    // act
    const counter = createOperationsCounter(ops);
    // assert
    expect(counter).toBeDefined();
    if (counter) {
      expect(counter(operations)).toBe(2);
    }
  });

  test('array ops', () => {
    // arrange
    const ops = ["antijoin", "cartesian", "division"];
    // act
    const counter = createOperationsCounter(ops);
    // assert
    expect(counter).toBeDefined();
    if (counter) {
      expect(counter(operations)).toBe(9);
    }
  });
});