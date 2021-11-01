import * as fs from 'fs'
import {LogicalOperatorType} from '../../vetree/logicalOperator'
import {ColumnContent} from '../../relation/columnType'
import {computeLogical} from '../computeLogical'


interface TestInput {
  type: LogicalOperatorType,
  a: ColumnContent,
  b: ColumnContent | undefined,
  expectedError: string | undefined,
  expectedResult: boolean,
}

const getTypeFromStr = (str: string): LogicalOperatorType => {
  switch (str) {
    case 'and':
      return LogicalOperatorType.and
    case 'or':
      return LogicalOperatorType.or
    case 'not':
      return LogicalOperatorType.not
    default:
      throw Error('Unexpected type: ' + str)
  }
}

const getColumnContent = (str: string): ColumnContent => {
  switch (str) {
    case 'str':
      return 'str'
    case '1':
      return 1
    case 'false':
      return false
    case 'true':
      return true
    case 'null':
      return null
    default:
      throw Error('Unexpected column content: ' + str)
  }
}

const getExpectedError = (str: string): string | undefined => {
  switch (str) {
    case 'error1':
      return 'First parameter for computeLogical cannot have string/number type'
    case 'error2':
      return 'Second parameter for computeLogical cannot have string/number type'
    case 'error3':
      return 'One parameter given to a binary'
    case 'error4':
      return 'Two parameters given to an unary NOT operator'
    default:
      return undefined
  }
}

const getInputData = (file: string): TestInput[] => {
  return fs.readFileSync('test_data/computeLogical/' + file,'utf8')
    .split('\n')
    .slice(1)
    .filter(line => line.trim().length !== 0)
    .map(line => {
      const params = line.split(',')
      return {
        type: getTypeFromStr(params[0]),
        a: getColumnContent(params[1]),
        b: params[2] === 'undefined' ? undefined : getColumnContent(params[2]),
        expectedError: getExpectedError(params[3]),
        expectedResult: params[3] === 'true',
      }
    })
}

describe('computeLogical (group: #ZKS, #utils)', () => {
  test.each(getInputData('input_2way_uniform.csv'))
  ('Generated 2-way uniform: %s',
    (
      { type, a, b, expectedError, expectedResult }
    ) => {
      if (expectedError) {
        // act and assert
        expect(() => computeLogical(type, a, b)).toThrowErrorWithSubstr(expectedError)
      } else {
        // act
        const actual = computeLogical(type, a, b)
        // assert
        expect(actual).toBe(expectedResult)
      }
    })

  test.each(getInputData('input_2way_mixed.csv'))
  ('Generated 2-way mixed: %s',
    (
      { type, a, b, expectedError, expectedResult }
    ) => {
      if (expectedError) {
        // act and assert
        expect(() => computeLogical(type, a, b)).toThrowErrorWithSubstr(expectedError)
      } else {
        // act
        const actual = computeLogical(type, a, b)
        // assert
        expect(actual).toBe(expectedResult)
      }
    })

  test.each(getInputData('input_3way_uniform.csv'))
  ('Generated 3-way uniform: %s',
    (
      { type, a, b, expectedError, expectedResult }
    ) => {
      if (expectedError) {
        // act and assert
        expect(() => computeLogical(type, a, b)).toThrowErrorWithSubstr(expectedError)
      } else {
        // act
        const actual = computeLogical(type, a, b)
        // assert
        expect(actual).toBe(expectedResult)
      }
    })
})
