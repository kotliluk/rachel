import { assertParamsCount, ErrorFactory, joinStringArrays } from '../errorFactory'
import { StartEndPair } from '../../types/startEndPair'


// mocks language to not affect tests
jest.mock('../../language/language', () => {
  return {
    language: () => {
      return {
        syntaxError: '',
        semanticError: '',
      }
    },
  }
})

interface CodeErrorTestInput {
  msgParts: string[]
  params: string[]
  expectedMsg: string
}

describe('codeError', () => {
  const codeErrorTestInputs: CodeErrorTestInput[] = [
    {
      msgParts: ['AAA', 'BBB', 'CCC'],
      params: ['111', '222'],
      expectedMsg: 'AAA111BBB222CCC',
    },
    {
      msgParts: ['AAA', 'BBB', 'CCC'],
      params: ['111', '222', '333'],
      expectedMsg: 'AAA111BBB222CCC',
    },
    {
      msgParts: ['AAA', 'BBB', 'CCC'],
      params: [],
      expectedMsg: 'AAABBBCCC',
    },
  ]

  test.each(codeErrorTestInputs)('%s', ({ msgParts, params, expectedMsg }) => {
    // act
    const error = ErrorFactory.codeError(msgParts, ...params)
    // assert
    expect(error).toHaveMessage(expectedMsg)
  })
})

interface SyntaxAndSemanticErrorTestInput {
  msgParts: string[]
  range: StartEndPair | undefined
  params: string[]
  expectedMsg: string
}

describe('ErrorWithTextRange', () => {
  const codeErrorTestInputs: SyntaxAndSemanticErrorTestInput[] = [
    {
      msgParts: ['AAA', 'BBB', 'CCC'],
      range: { start: 0, end: 13 },
      params: ['111', '222'],
      expectedMsg: 'AAA111BBB222CCC',
    },
    {
      msgParts: ['AAA', 'BBB', 'CCC'],
      range: { start: 8, end: NaN },
      params: ['111', '222', '333'],
      expectedMsg: 'AAA111BBB222CCC',
    },
    {
      msgParts: ['AAA', 'BBB', 'CCC'],
      range: undefined,
      params: [],
      expectedMsg: 'AAABBBCCC',
    },
  ]

  test.each(codeErrorTestInputs)('syntaxError - %s', ({ msgParts, range, params, expectedMsg }) => {
    // act
    const error = ErrorFactory.syntaxError(msgParts, range, ...params)
    // assert
    expect(error).toHaveMessage(expectedMsg).toHaveTextRange(range)
  })

  test.each(codeErrorTestInputs)('semanticError - %s', ({ msgParts, range, params, expectedMsg }) => {
    // act
    const error = ErrorFactory.semanticError(msgParts, range, ...params)
    // assert
    expect(error).toHaveMessage(expectedMsg).toHaveTextRange(range)
  })
})

interface AssertParamsCountTestInput {
  count: number
  params: string[]
  expected: string[]
}

describe('assertParamsCount', () => {
  const assertParamsCountTestInputs: AssertParamsCountTestInput[] = [
    { count: 0, params: [], expected: [] },
    { count: 0, params: ['aaa'], expected: ['aaa'] },
    { count: 2, params: ['aaa'], expected: ['aaa', ''] },
    { count: 5, params: ['aaa', 'bbb', 'ccc'], expected: ['aaa', 'bbb', 'ccc', '', ''] },
  ]

  test.each(assertParamsCountTestInputs)('%s', ({ count, params, expected }) => {
    // act
    assertParamsCount(count, params)
    // assert
    expect(params).toStrictEqual(expected)
  })
})

interface JoinStringArraysTestInput {
  a: string[]
  b: string[]
  expected: string
}

describe('joinStringArrays', () => {
  const joinStringArraysTestInputs: JoinStringArraysTestInput[] = [
    { a: ['a', 'bb', 'ccc', 'd'], b: ['1', '222', '3'], expected: 'a1bb222ccc3d' },
    { a: ['abcd'], b: [], expected: 'abcd' },
    { a: ['a', 'bb', 'ccc', 'd'], b: ['', '0   0', ''], expected: 'abb0   0cccd' },
    { a: ['a', 'bb', 'ccc', 'd'], b: ['1', '2', '3', '4', '5'], expected: 'a1bb2ccc3d' },
  ]

  test.each(joinStringArraysTestInputs)('%s', ({ a, b, expected }) => {
    // act
    const actual: string = joinStringArrays(a, b)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})
