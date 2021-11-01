import { LiteralValue } from '../literalValue'
import { ComparingOperator } from '../comparingOperator'
import { Row } from '../../relation/row'
import { SupportedColumnType } from '../../relation/columnType'
import { IndexedString } from '../../types/indexedString'


const four: LiteralValue = new LiteralValue(4, 'number')
const five: LiteralValue = new LiteralValue(5, 'number')
const aaa: LiteralValue = new LiteralValue('AAA', 'string')
const bbb: LiteralValue = new LiteralValue('BBB', 'string')
const num_null: LiteralValue = new LiteralValue(null, 'number')
const str_null: LiteralValue = new LiteralValue(null, 'string')

// uses literals, row just to fill eval parameter
const dummyTestRow: Row = new Row(new Map<string, SupportedColumnType>())

interface EvalTestInputWithExpected {
  type: 'equal' | 'nonEqual' | 'more' | 'moreOrEqual' | 'less' | 'lessOrEqual'
  typeStr: string
  expected: boolean
}

interface EvalTestInputTypeOnly {
  type: 'equal' | 'nonEqual' | 'more' | 'moreOrEqual' | 'less' | 'lessOrEqual'
  typeStr: string
}

describe('ComparingOperator (group: #ZKS, #VETree)', () => {
  describe('eval', () => {
    const evalTestInputsWithExpected: EvalTestInputWithExpected[] = [
      { type: 'equal', typeStr: '==', expected: false },
      { type: 'nonEqual', typeStr: '!=', expected: true },
      { type: 'more', typeStr: '>', expected: false },
      { type: 'moreOrEqual', typeStr: '>=', expected: false },
      { type: 'less', typeStr: '<', expected: true },
      { type: 'lessOrEqual', typeStr: '<=', expected: true },
    ]

    const evalTestInputsTypeOnly: EvalTestInputTypeOnly[] = [
      { type: 'equal', typeStr: '==' },
      { type: 'nonEqual', typeStr: '!=' },
      { type: 'more', typeStr: '>' },
      { type: 'moreOrEqual', typeStr: '>=' },
      { type: 'less', typeStr: '<' },
      { type: 'lessOrEqual', typeStr: '<=' },
    ]

    describe('number inputs given', () => {
      test.each(evalTestInputsWithExpected)('%s', ({ type, typeStr, expected }) => {
        // arrange
        const comparingOperator: ComparingOperator = ComparingOperator[type](IndexedString.new(typeStr), four, five)
        // act
        const actual = comparingOperator.eval(dummyTestRow)
        // assert
        expect(actual).toHaveValueAndType(expected, 'boolean')
      })
    })

    describe('string inputs given', () => {
      test.each(evalTestInputsWithExpected)('%s', ({ type, typeStr, expected }) => {
        // arrange
        const comparingOperator: ComparingOperator = ComparingOperator[type](IndexedString.new(typeStr), aaa, bbb)
        // act
        const actual = comparingOperator.eval(dummyTestRow)
        // assert
        expect(actual).toHaveValueAndType(expected, 'boolean')
      })
    })

    describe('number and null of number type given', () => {
      test.each(evalTestInputsTypeOnly)('%s', ({ type, typeStr }) => {
        // arrange
        const comparingOperator: ComparingOperator = ComparingOperator[type](IndexedString.new(typeStr), four, num_null)
        // act
        const actual = comparingOperator.eval(dummyTestRow)
        // assert
        expect(actual).toHaveValueAndType(false, 'boolean')
      })
    })

    describe('number and null of string type given - throws', () => {
      test.each(evalTestInputsTypeOnly)('%s', ({ type, typeStr }) => {
        // arrange
        const comparingOperator: ComparingOperator = ComparingOperator[type](IndexedString.new(typeStr), four, str_null)
        // act + assert
        expect(() => comparingOperator.eval(dummyTestRow)).toThrow()
      })
    })

    describe('string and number inputs given - throws', () => {
      test.each(evalTestInputsTypeOnly)('%s', ({ type, typeStr }) => {
        // arrange
        const comparingOperator: ComparingOperator = ComparingOperator[type](IndexedString.new(typeStr), four, aaa)
        // act + assert
        expect(() => comparingOperator.eval(dummyTestRow)).toThrow()
      })
    })
  })
})
