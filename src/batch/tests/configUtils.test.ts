import {createCountComparator, createOperationsCounter, createReportNameModifier} from "../configUtils";
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
      expect(comparator(4)).toEqual("Expected 5, received 4");
      expect(comparator(5)).toEqual("");
      expect(comparator(6)).toEqual("Expected 5, received 6");
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
      expect(comparator(4)).toEqual("Expected 5, received 4");
      expect(comparator(5)).toEqual("");
      expect(comparator(6)).toEqual("Expected 5, received 6");
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
      expect(comparator(4)).toEqual("Expected greater or equal to 5, received 4");
      expect(comparator(5)).toEqual("");
      expect(comparator(6)).toEqual("");
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
      expect(comparator(4)).toEqual("Expected greater than 5, received 4");
      expect(comparator(5)).toEqual("Expected greater than 5, received 5");
      expect(comparator(6)).toEqual("");
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
      expect(comparator(4)).toEqual("");
      expect(comparator(5)).toEqual("");
      expect(comparator(6)).toEqual("Expected less or equal to 5, received 6");
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
      expect(comparator(4)).toEqual("");
      expect(comparator(5)).toEqual("Expected less than 5, received 5");
      expect(comparator(6)).toEqual("Expected less than 5, received 6");
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
      expect(comparator(4)).toEqual("Expected greater or equal to 5, received 4");
      expect(comparator(5)).toEqual("");
      expect(comparator(6)).toEqual("");
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
      expect(comparator(4)).toEqual("Expected greater than 5, received 4");
      expect(comparator(5)).toEqual("Expected greater than 5, received 5");
      expect(comparator(6)).toEqual("Expected less than 6, received 6");
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
      expect(comparator(4)).toEqual("Expected 5, received 4 + Expected greater than 4, received 4");
      expect(comparator(5)).toEqual("");
      expect(comparator(6)).toEqual("Expected 5, received 6 + Expected less than 6, received 6");
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
  union: 1,
  intersection: 1,
  difference: 1,
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

describe('createReportNameModifier', () => {
  test("no config", () => {
    // arrange
    const config = {};
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "some/path/to/my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("invalid config - not object", () => {
    // arrange
    const config = "blah blah";
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "some/path/to/my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("invalid config - invalid field", () => {
    // arrange
    const config = {
      invalidField: 'abc_'
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "some/path/to/my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });
  
  test("prefix 'abc_'", () => {
    // arrange
    const config = {
      prefix: 'abc_'
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "abc_some/path/to/my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("suffix '_xyz'", () => {
    // arrange
    const config = {
      suffix: '_xyz'
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "some/path/to/my-file_xyz.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });
  
  test("join path with '-'", () => {
    // arrange
    const config = {
      joinPathParts: '-'
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "some-path-to-my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });
  
  test("join path with '-abc-'", () => {
    // arrange
    const config = {
      joinPathParts: '-abc-'
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "some-abc-path-abc-to-abc-my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("use path part '1'", () => {
    // arrange
    const config = {
      usePathParts: [1]
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("use path part '1,3'", () => {
    // arrange
    const config = {
      usePathParts: [1, 3]
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "path/my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("use path part '1,3,666' - 666 is ignored", () => {
    // arrange
    const config = {
      usePathParts: [1, 3, 666]
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "path/my-file.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });

  test("prefix 'aaa_', suffix '_xxx', use path part '1,3' join path with '-'", () => {
    // arrange
    const config = {
      prefix: 'aaa_',
      suffix: '_xxx',
      usePathParts: [1, 3],
      joinPathParts: '-'
    };
    const originalName = "some/path/to/my-file.extension";
    const expectedName = "aaa_path-my-file_xxx.txt";
    // act
    const modifier = createReportNameModifier(config);
    const actualName = modifier(originalName);
    // assert
    expect(actualName).toEqual(expectedName);
  });
});