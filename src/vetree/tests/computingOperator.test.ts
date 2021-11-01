import { LiteralValue } from '../literalValue'
import { Row } from '../../relation/row'
import { ColumnContent, SupportedColumnType } from '../../relation/columnType'
import { ComputingOperator } from '../computingOperator'


const literalFour: LiteralValue = new LiteralValue(4, 'number')
const literalFive: LiteralValue = new LiteralValue(5, 'number')
const literalAAA: LiteralValue = new LiteralValue('AAA', 'string')
const literalBBB: LiteralValue = new LiteralValue('BBB', 'string')
const literalNull: LiteralValue = new LiteralValue(null, 'null')
const literalNullAsNumber: LiteralValue = new LiteralValue(null, 'number')
const literalTrue: LiteralValue = new LiteralValue(true, 'boolean')

// uses literals, row just to fill eval parameter
const fakeRowOne: Row = new Row(new Map<string, SupportedColumnType>())

describe('ComputingOperator (group: #VETree)', () => {
  describe('eval', () => {
    describe('number inputs given', () => {
      test('4 + 5 = 9', () => {
        const left: LiteralValue = literalFour
        const right: LiteralValue = literalFive
        const expected: { value: number, type: 'number' } = {value: 9, type: 'number'}

        const computingOperation: ComputingOperator = ComputingOperator.add(left, right, undefined)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = computingOperation.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('4 * 5 = 20', () => {
        const left: LiteralValue = literalFour
        const right: LiteralValue = literalFive
        const expected: { value: number, type: 'number' } = {value: 20, type: 'number'}

        const computingOperation: ComputingOperator = ComputingOperator.multiply(left, right, undefined)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = computingOperation.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })
    })

    describe('null input given (as number type)', () => {
      test('null + 5 = null', () => {
        const left: LiteralValue = literalNullAsNumber
        const right: LiteralValue = literalFive
        const expected: { value: null, type: 'number' } = {value: null, type: 'number'}

        const computingOperation: ComputingOperator = ComputingOperator.add(left, right, undefined)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = computingOperation.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('4 * null = null', () => {
        const left: LiteralValue = literalFour
        const right: LiteralValue = literalNullAsNumber
        const expected: { value: null, type: 'number' } = {value: null, type: 'number'}

        const computingOperation: ComputingOperator = ComputingOperator.multiply(left, right, undefined)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = computingOperation.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('null / null = null', () => {
        const left: LiteralValue = literalNullAsNumber
        const right: LiteralValue = literalNullAsNumber
        const expected: { value: null, type: 'number' } = {value: null, type: 'number'}

        const computingOperation: ComputingOperator = ComputingOperator.divide(left, right, undefined)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = computingOperation.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })
    })

    describe('string input given', () => {
      test('AAA + 5 throws', () => {
        const left: LiteralValue = literalAAA
        const right: LiteralValue = literalFive

        const computingOperation: ComputingOperator = ComputingOperator.add(left, right, undefined)
        expect(() => computingOperation.eval(fakeRowOne)).toThrow()
      })

      test('4 * AAA throws', () => {
        const left: LiteralValue = literalFour
        const right: LiteralValue = literalAAA

        const computingOperation: ComputingOperator = ComputingOperator.multiply(left, right, undefined)
        expect(() => computingOperation.eval(fakeRowOne)).toThrow()
      })

      test('AAA + BBB throws', () => {
        const left: LiteralValue = literalAAA
        const right: LiteralValue = literalBBB

        const computingOperation: ComputingOperator = ComputingOperator.add(left, right, undefined)
        expect(() => computingOperation.eval(fakeRowOne)).toThrow()
      })
    })

    describe('null input given (as null type)', () => {
      test('null + 5 throws', () => {
        const left: LiteralValue = literalNull
        const right: LiteralValue = literalFive

        const computingOperation: ComputingOperator = ComputingOperator.add(left, right, undefined)
        expect(() => computingOperation.eval(fakeRowOne)).toThrow()
      })
    })

    describe('boolean input given', () => {
      test('true + 5 throws', () => {
        const left: LiteralValue = literalTrue
        const right: LiteralValue = literalFive

        const computingOperation: ComputingOperator = ComputingOperator.add(left, right, undefined)
        expect(() => computingOperation.eval(fakeRowOne)).toThrow()
      })
    })
  })
})
