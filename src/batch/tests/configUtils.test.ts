import {
  createCountComparator,
  createOperationsCounter,
  createOperationsIndicator,
  createReportNameModifier,
} from '../configUtils'
import { OperationsCount } from '../operationsCount'


interface CreateCountComparatorTestInput {
  count: any
  toCompare: number
  expected: string
}

describe('createCountComparator', () => {

  const testInputs: CreateCountComparatorTestInput[] = [
    { count: 5, toCompare: 4, expected: 'Expected 5, found 4' },
    { count: 5, toCompare: 5, expected: '' },
    { count: 5, toCompare: 6, expected: 'Expected 5, found 6' },
    { count: { $eq: 5 }, toCompare: 4, expected: 'Expected 5, found 4' },
    { count: { $eq: 5 }, toCompare: 5, expected: '' },
    { count: { $eq: 5 }, toCompare: 6, expected: 'Expected 5, found 6' },
    { count: { $gte: 5 }, toCompare: 4, expected: 'Expected greater or equal to 5, found 4' },
    { count: { $gte: 5 }, toCompare: 5, expected: '' },
    { count: { $gte: 5 }, toCompare: 6, expected: '' },
    { count: { $gt: 5 }, toCompare: 4, expected: 'Expected greater than 5, found 4' },
    { count: { $gt: 5 }, toCompare: 5, expected: 'Expected greater than 5, found 5' },
    { count: { $gt: 5 }, toCompare: 6, expected: '' },
    { count: { $lte: 5 }, toCompare: 4, expected: '' },
    { count: { $lte: 5 }, toCompare: 5, expected: '' },
    { count: { $lte: 5 }, toCompare: 6, expected: 'Expected less or equal to 5, found 6' },
    { count: { $lt: 5 }, toCompare: 4, expected: '' },
    { count: { $lt: 5 }, toCompare: 5, expected: 'Expected less than 5, found 5' },
    { count: { $lt: 5 }, toCompare: 6, expected: 'Expected less than 5, found 6' },
    { count: { $gte: 5, $lte: 6 }, toCompare: 4, expected: 'Expected greater or equal to 5, found 4' },
    { count: { $gte: 5, $lte: 6 }, toCompare: 5, expected: '' },
    { count: { $gte: 5, $lte: 6 }, toCompare: 6, expected: '' },
    { count: { $gt: 5, $lt: 6 }, toCompare: 4, expected: 'Expected greater than 5, found 4' },
    { count: { $gt: 5, $lt: 6 }, toCompare: 5, expected: 'Expected greater than 5, found 5' },
    { count: { $gt: 5, $lt: 6 }, toCompare: 6, expected: 'Expected less than 6, found 6' },
    {
      count: { $eq: 5, $gte: 4, $lte: 6, $gt: 4, $lt: 6 },
      toCompare: 4,
      expected: 'Expected 5, found 4 + Expected greater than 4, found 4',
    },
    {
      count: { $eq: 5, $gte: 4, $lte: 6, $gt: 4, $lt: 6 },
      toCompare: 5,
      expected: '',
    },
    {
      count: { $eq: 5, $gte: 4, $lte: 6, $gt: 4, $lt: 6 },
      toCompare: 6,
      expected: 'Expected 5, found 6 + Expected less than 6, found 6',
    },
  ]

  test.each(testInputs)('%s', ({ count, toCompare, expected }) => {
    // act
    const comparator = createCountComparator(count)
    // assert
    expect(comparator).toBeDefined()
    expect(comparator?.(toCompare)).toEqual(expected)
  })
})

const operations: OperationsCount = {
  antijoin: 2,
  cartesian: 3,
  division: 0,
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
  thetaSemijoin: 1,
}

describe('createOperationsCounter', () => {
  test('string ops', () => {
    // arrange
    const ops = 'antijoin'
    // act
    const counter = createOperationsCounter(ops)
    // assert
    expect(counter).toBeDefined()
    expect(counter?.(operations)).toBe(2)
  })

  test('array ops', () => {
    // arrange
    const ops = ['antijoin', 'cartesian', 'division']
    // act
    const counter = createOperationsCounter(ops)
    // assert
    expect(counter).toBeDefined()
    expect(counter?.(operations)).toBe(5)
  })
})

describe('createOperationsIndicator', () => {
  test('string ops', () => {
    // arrange
    const ops = 'antijoin'
    // act
    const counter = createOperationsIndicator(ops)
    // assert
    expect(counter).toBeDefined()
    expect(counter?.(operations)).toBe(1)
  })

  test('array ops', () => {
    // arrange
    const ops = ['antijoin', 'cartesian', 'division']
    // act
    const counter = createOperationsIndicator(ops)
    // assert
    expect(counter).toBeDefined()
    expect(counter?.(operations)).toBe(2)
  })
})

interface CreateReportNameModifierTestInput {
  config: any
  original: string
  expected: string
}

describe('createReportNameModifier', () => {

  const testInputs: CreateReportNameModifierTestInput[] = [
    { config: {}, original: 'some/path/to/my-file.extension', expected: 'some/path/to/my-file.txt' },
    { config: 'invalid', original: 'some/path/to/my-file.extension', expected: 'some/path/to/my-file.txt' },
    { config: { invalidField: 'a' }, original: 'some/path/to/my-file.extension', expected: 'some/path/to/my-file.txt' },
    { config: { prefix: 'a_' }, original: 'some/path/to/my-file.extension', expected: 'a_some/path/to/my-file.txt' },
    { config: { suffix: '_z' }, original: 'some/path/to/my-file.extension', expected: 'some/path/to/my-file_z.txt' },
    { config: { joinPathParts: '-' }, original: 'some/path/to/my-file.extension', expected: 'some-path-to-my-file.txt' },
    { config: { joinPathParts: '-a-' }, original: 'some/path/to/my-file.extension', expected: 'some-a-path-a-to-a-my-file.txt' },
    { config: { usePathParts: [1] }, original: 'some/path/to/my-file.extension', expected: 'my-file.txt' },
    { config: { usePathParts: [1, 3] }, original: 'some/path/to/my-file.extension', expected: 'path/my-file.txt' },
    { config: { usePathParts: [1, 3, 100] }, original: 'some/path/to/my-file.extension', expected: 'path/my-file.txt' },
    {
      config: { prefix: 'aaa_', suffix: '_xxx', usePathParts: [1, 3], joinPathParts: '-' },
      original: 'some/path/to/my-file.extension',
      expected: 'aaa_path-my-file_xxx.txt',
    },
  ]

  test.each(testInputs)('%s', ({ config, original, expected }) => {
    // act
    const modifier = createReportNameModifier(config)
    const actualName = modifier(original)
    // assert
    expect(actualName).toEqual(expected)
  })
})
