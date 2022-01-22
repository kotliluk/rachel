import { Row } from '../../relation/row'
import { LogicalOperator } from '../logicalOperator'
import { ColumnContent, SupportedColumnType } from '../../relation/columnType'
import { LiteralValue } from '../literalValue'
import { VETreeNode } from '../veTreeNode'
import { IndexedString } from '../../types/indexedString'

// uses literals, row just to fill eval parameter
const fakeRowOne: Row = new Row(new Map<string, SupportedColumnType>())

describe('LogicalOperator (group: #VETree)', () => {
  describe('eval', () => {
    describe('booleans given', () => {
      test('true && true = true', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(true, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: true, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.and(IndexedString.new('&&'), left, right)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('true && false = false', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(false, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: false, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.and(IndexedString.new('&&'), left, right)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('true || false = true', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(false, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: true, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.or(IndexedString.new('||'), left, right)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('false || false = false', () => {
        const left: VETreeNode = new LiteralValue(false, 'boolean')
        const right: VETreeNode = new LiteralValue(false, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: false, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.or(IndexedString.new('||'), left, right)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('!false = true', () => {
        const left: VETreeNode = new LiteralValue(false, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: true, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.not(IndexedString.new('!'), left)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })
    })

    describe('null given (as boolean type)', () => {
      test('true && null = false', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(null, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: false, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.and(IndexedString.new('&&'), left, right)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('true || null = true', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(null, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: true, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.or(IndexedString.new('||'), left, right)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })

      test('!null = false', () => {
        const left: VETreeNode = new LiteralValue(null, 'boolean')
        const expected: { value: boolean, type: 'boolean' } = {value: false, type: 'boolean'}

        const logicalOperator: LogicalOperator = LogicalOperator.not(IndexedString.new('!'), left)
        const actual: { value: ColumnContent, type: SupportedColumnType | 'null' } = logicalOperator.eval(fakeRowOne)
        expect(actual).toStrictEqual(expected)
      })
    })

    describe('string given', () => {
      test('true && "AAA" throws', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue('AAA', 'string')

        const logicalOperator: LogicalOperator = LogicalOperator.and(IndexedString.new('&&'), left, right)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })

      test('true || "AAA" throws', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue('AAA', 'string')

        const logicalOperator: LogicalOperator = LogicalOperator.or(IndexedString.new('||'), left, right)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })

      test('!"AAA" throws', () => {
        const left: VETreeNode = new LiteralValue('AAA', 'string')

        const logicalOperator: LogicalOperator = LogicalOperator.not(IndexedString.new('!'), left)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })
    })

    describe('number given', () => {
      test('true && 1 throws', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(1, 'number')

        const logicalOperator: LogicalOperator = LogicalOperator.and(IndexedString.new('&&'), left, right)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })

      test('true || 1 throws', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(1, 'number')

        const logicalOperator: LogicalOperator = LogicalOperator.or(IndexedString.new('||'), left, right)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })

      test('!1 throws', () => {
        const left: VETreeNode = new LiteralValue(1, 'number')

        const logicalOperator: LogicalOperator = LogicalOperator.not(IndexedString.new('!'), left)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })
    })

    describe('null given (as null type)', () => {
      test('true && null throws', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(null, 'null')

        const logicalOperator: LogicalOperator = LogicalOperator.and(IndexedString.new('&&'), left, right)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })

      test('true || null throws', () => {
        const left: VETreeNode = new LiteralValue(true, 'boolean')
        const right: VETreeNode = new LiteralValue(null, 'null')

        const logicalOperator: LogicalOperator = LogicalOperator.or(IndexedString.new('||'), left, right)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })

      test('!null throws', () => {
        const left: VETreeNode = new LiteralValue(null, 'null')

        const logicalOperator: LogicalOperator = LogicalOperator.not(IndexedString.new('!'), left)
        expect(() => logicalOperator.eval(fakeRowOne)).toThrow()
      })
    })
  })
})
