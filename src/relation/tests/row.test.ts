import { Row } from '../row'
import {ColumnContent, SupportedColumnType} from '../columnType'


const columns = new Map<string, SupportedColumnType>()
columns.set('First', 'string')
columns.set('Second', 'number')
let row = new Row(columns)

beforeEach(() => {
  row = new Row(columns)
})

interface AddValueTestInput {
  name: string,
  value: ColumnContent,
  expectedAdded: boolean,
  expectedGotValue: ColumnContent | undefined,
}

describe('Row (group: #relation)', () => {
  describe('is created correctly', () => {
    test('should not be finished after creation', () => {
      // assert
      const finished = row.isFinished()
      expect(finished).toBeFalsy()
    })

    test('should contain initial columns', () => {
      const added = [...row.getColumnNames()]
      expect(added)
        .toHaveLength(2)
        .toContain('First')
        .toContain('Second')
    })

    test('should contain initial columns with null values', () => {
      expect(row.getValue('First')).toBeNull()
      expect(row.getValue('Second')).toBeNull()
    })

    test('should contain initial columns with correct types', () => {
      expect(row.getType('First')).toBe('string')
      expect(row.getType('Second')).toBe('number')
    })
  })

  describe('adds values correctly', () => {
    const testInputs: AddValueTestInput[] = [
      {name: 'First', value: 'Some string', expectedAdded: true, expectedGotValue: 'Some string'},
      {name: 'Second', value: 10.01, expectedAdded: true, expectedGotValue: 10.01},
      {name: 'First', value: 10.01, expectedAdded: false, expectedGotValue: null},
      {name: 'Third', value: 'abc', expectedAdded: false, expectedGotValue: undefined},
    ]

    test.each(testInputs)('%s', ({name, value, expectedAdded, expectedGotValue}) => {
      // act
      const actualAdded = row.addValue(name, value)
      const actualGotValue = row.getValue(name)
      // assert
      expect(actualAdded).toBe(expectedAdded)
      expect(actualGotValue).toBe(expectedGotValue)
    })
  })
})
