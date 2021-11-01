import { Row } from '../../relation/row'
import { ColumnContent, SupportedColumnType } from '../../relation/columnType'
import { ReferenceValue } from '../referenceValue'
import { IndexedString } from '../../types/indexedString'


const numColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>()
numColumns.set('One', 'number')
numColumns.set('Two', 'number')

const strColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>()
strColumns.set('AAA', 'string')
strColumns.set('BBB', 'string')

const boolColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>()
boolColumns.set('True', 'boolean')
boolColumns.set('False', 'boolean')

const numRowWithAllValues: Row = new Row(numColumns)
numRowWithAllValues.addValue('One', 1)
numRowWithAllValues.addValue('Two', 2)

const strRowWithAllValues: Row = new Row(strColumns)
strRowWithAllValues.addValue('AAA', 'aaa')
strRowWithAllValues.addValue('BBB', 'bbb')

const boolRowWithAllValues: Row = new Row(boolColumns)
boolRowWithAllValues.addValue('True', true)
boolRowWithAllValues.addValue('False', false)

const numRowWithOneNumberNullValue: Row = new Row(numColumns)
numRowWithOneNumberNullValue.addValue('One', null)
numRowWithOneNumberNullValue.addValue('Two', 2)

interface EvalTestInputWithExpected {
  row: Row
  wantedColumn: string
  expected: { value: ColumnContent, type: SupportedColumnType | 'null' },
}

interface EvalTestInputTypeOnly {
  row: Row
  wantedColumn: string
}

describe('ReferenceValue (group: #ZKS, #VETree)', () => {
  describe('eval', () => {
    describe('rows which contain wanted value', () => {
      const evalTestInputsWithExpected: EvalTestInputWithExpected[] = [
        {row: numRowWithAllValues, wantedColumn: 'One', expected: {value: 1, type: 'number'}},
        {row: strRowWithAllValues, wantedColumn: 'AAA', expected: {value: 'aaa', type: 'string'}},
        {row: boolRowWithAllValues, wantedColumn: 'True', expected: {value: true, type: 'boolean'}},
        {row: numRowWithOneNumberNullValue, wantedColumn: 'One', expected: {value: null, type: 'number'}},
      ]

      test.each(evalTestInputsWithExpected)('%s', ({row, wantedColumn, expected}) => {
        // arrange
        const reference: ReferenceValue = new ReferenceValue(IndexedString.new(wantedColumn))
        // act
        const actual = reference.eval(row)
        // assert
        expect(actual).toStrictEqual(expected)
      })
    })

    describe('rows which do not contain wanted value', () => {
      const evalTestInputsTypeOnly: EvalTestInputTypeOnly[] = [
        {row: numRowWithAllValues, wantedColumn: 'Three'},
        {row: strRowWithAllValues, wantedColumn: 'CCC'},
        {row: boolRowWithAllValues, wantedColumn: 'NotTrueNotFalse'},
      ]

      test.each(evalTestInputsTypeOnly)('%s', ({row, wantedColumn}) => {
        // arrange
        const reference: ReferenceValue = new ReferenceValue(IndexedString.new(wantedColumn))
        // act + assert
        expect(() => reference.eval(row)).toThrow()
      })
    })
  })
})
