import * as fs from 'fs'
import {ComputingOperatorType} from '../../vetree/computingOperator'
import {ColumnContent} from '../../relation/columnType'
import {computeArithmetic} from '../computeArithmetic'


interface TestInput {
  type: ComputingOperatorType,
  a: ColumnContent,
  b: ColumnContent,
  expectedError: string | undefined,
  expectedResult: number | null,
}

const getComputingOperatorType = (str: string): ComputingOperatorType => {
  switch (str) {
    case 'plus':
    case 'minus':
    case 'division':
    case 'multiplication':
      return ComputingOperatorType[str]
    default:
      throw Error('Unexpected computing operator: ' + str)
  }
}

const getColumnContent = (str: string): ColumnContent => {
  switch (str) {
    case 'str':
      return 'str'
    case 'NaN':
    case 'Infinity':
    case '-Infinity':
    case '0':
    case '1.7976931348623157e+308':
    case '-1.7976931348623157e+308':
    case '5e-324':
    case '-5e-324':
      return Number.parseFloat(str)
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
      return 'First parameter for computeArithmetic cannot be pseudo-number'
    case 'error2':
      return 'First parameter for computeArithmetic cannot have string/boolean type'
    case 'error3':
      return 'Second parameter for computeArithmetic cannot be pseudo-number'
    case 'error4':
      return 'Second parameter for computeArithmetic cannot have string/boolean type'
    case 'error5':
      return 'Division by zero'
    default:
      return undefined
  }
}

const getInputData = (file: string): TestInput[] => {
  return fs.readFileSync('test_data/computeArithmetic/' + file,'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .slice(1)
    .filter(line => line.trim().length !== 0)
    .map(line => {
      const params = line.split(',')
      return {
        type: getComputingOperatorType(params[0]),
        a: getColumnContent(params[1]),
        b: getColumnContent(params[2]),
        expectedError: getExpectedError(params[3]),
        expectedResult: params[3] === 'null' ? null : Number.parseFloat(params[3]),
      }
    })
}

describe('computeArithmetic (group: #ZKS, #utils)', () => {
  test.each(getInputData('input_2way_uniform.csv'))
  ('Generated 2-way uniform: %s',
    ({ type, a, b, expectedError, expectedResult }) => {
      if (expectedError) {
        // act and assert
        expect(() => computeArithmetic(type, a, b)).toThrowErrorWithSubstr(expectedError)
      } else {
        // act
        const actual = computeArithmetic(type, a, b)
        // assert
        expect(actual).toBe(expectedResult)
      }
    })

  test.each(getInputData('input_2way_mixed.csv'))
  ('Generated 2-way mixed: %s',
    ({ type, a, b, expectedError, expectedResult }) => {
      if (expectedError) {
        // act and assert
        expect(() => computeArithmetic(type, a, b)).toThrowErrorWithSubstr(expectedError)
      } else {
        // act
        const actual = computeArithmetic(type, a, b)
        // assert
        expect(actual).toBe(expectedResult)
      }
    })

  test.each(getInputData('input_3way_uniform.csv'))
  ('Generated 3-way uniform: %s',
    ({ type, a, b, expectedError, expectedResult }) => {
      if (expectedError) {
        // act and assert
        expect(() => computeArithmetic(type, a, b)).toThrowErrorWithSubstr(expectedError)
      } else {
        // act
        const actual = computeArithmetic(type, a, b)
        // assert
        expect(actual).toBe(expectedResult)
      }
    })

  const manualInputs: TestInput[] = [
    { type: ComputingOperatorType.plus, a: 5, b: 3, expectedError: undefined, expectedResult: 8 },
    { type: ComputingOperatorType.plus, a: 5.2, b: -3.7, expectedError: undefined, expectedResult: 1.5 },
    { type: ComputingOperatorType.plus, a: -5.2, b: 3, expectedError: undefined, expectedResult: -2.2 },
    { type: ComputingOperatorType.minus, a: 5, b: 3, expectedError: undefined, expectedResult: 2 },
    { type: ComputingOperatorType.minus, a: 5, b: -3.3, expectedError: undefined, expectedResult: 8.3 },
    { type: ComputingOperatorType.minus, a: -5.7, b: 3.1, expectedError: undefined, expectedResult: -8.8 },
    { type: ComputingOperatorType.multiplication, a: 5, b: 3, expectedError: undefined, expectedResult: 15 },
    { type: ComputingOperatorType.multiplication, a: 5, b: -3.5, expectedError: undefined, expectedResult: -17.5 },
    { type: ComputingOperatorType.multiplication, a: -5.2, b: 3.1, expectedError: undefined, expectedResult: -16.12 },
    { type: ComputingOperatorType.multiplication, a: -4.05, b: -6.22, expectedError: undefined, expectedResult: 25.191 },
    { type: ComputingOperatorType.division, a: 4, b: 2, expectedError: undefined, expectedResult: 2 },
    { type: ComputingOperatorType.division, a: 4, b: -8, expectedError: undefined, expectedResult: -0.5 },
    { type: ComputingOperatorType.division, a: -4.5, b: -8, expectedError: undefined, expectedResult: 0.5625 },
  ]

  test.each(manualInputs)('Manual: %s', ({ type, a, b, expectedResult }) => {
    // act
    const actual = computeArithmetic(type, a, b)
    // assert
    expect(actual).toBe(expectedResult)
  })
})
