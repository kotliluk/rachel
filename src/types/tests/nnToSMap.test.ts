import { NNToSMap } from '../nnToSMap'


const testInitData: { row: number | 'name', column: number, value: string }[] = [
  { row: 0, column: 0, value: 'value0' },
  { row: 'name', column: 1, value: 'value1' },
]

/**
 * Extended test class to support initial data filling.
 */
class NNToSMapTest extends NNToSMap {
  constructor (initData: { row: number | 'name', column: number, value: string }[]) {
    super()
    this.map = new Map<string, string>(initData.map(({ row, column, value }) => {
      return [row + ':' + column, value]
    }))
  }
}


describe('NNToSMap (group: #types)', () => {
  describe('get', () => {
    test.each([
      ...testInitData,
      // absent row
      {row: 8, column: 0, value: undefined},
      // absent column
      {row: 0, column: 8, value: undefined},
    ])('%s', ({row, column, value}) => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      // act
      const actual = mockedMap.get(row, column)
      // assert
      expect(actual).toBe(value)
    })
  })

  describe('has', () => {
    test.each([
      ...testInitData.map(({row, column}) => {
        return {row, column, expected: true}
      }),
      // absent row
      {row: 8, column: 0, expected: false},
      // absent column
      {row: 0, column: 8, expected: false},
    ])('%s', ({row, column, expected}) => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      // act
      const actual = mockedMap.has(row, column)
      // assert
      expect(actual).toBe(expected)
    })
  })

  describe('size', () => {
    test('empty init', () => {
      // arrange
      const mockedMap = new NNToSMapTest([])
      // act
      const size = mockedMap.size()
      // assert
      expect(size).toBe(0)
    })

    test('init with two objects', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      // act
      const size = mockedMap.size()
      // assert
      expect(size).toBe(2)
    })
  })

  describe('clear', () => {
    test('removes all inputs', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      // act
      mockedMap.clear()
      // assert
      const size = mockedMap.size()
      expect(size).toBe(0)
    })
  })

  describe('delete', () => {
    test('deletes key', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      const rowIS = testInitData[0].row
      const columnIS = testInitData[0].column
      // act
      mockedMap.delete(rowIS, columnIS)
      // assert
      const size = mockedMap.size()
      expect(size).toBe(1)
    })

    test('does not delete absent key', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      const absentRowIS = 8
      const absentColumnIS = 8
      // act
      mockedMap.delete(absentRowIS, absentColumnIS)
      // assert
      const size = mockedMap.size()
      expect(size).toBe(2)
    })
  })

  describe('set', () => {
    test('changes values', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      const row = testInitData[0].row
      const column = testInitData[0].column
      const changedValue = 'changed value'
      // act
      mockedMap.set(row, column, changedValue)
      // assert
      const size = mockedMap.size()
      const gotChangedValue = mockedMap.get(row, column)
      expect(size).toBe(2)
      expect(gotChangedValue).toStrictEqual(changedValue)
    })

    test('adds values', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      const newRow = 'name'
      const newColumn = 5
      const newValue = 'changed value'
      // act
      mockedMap.set(newRow, newColumn, newValue)
      // assert
      const size = mockedMap.size()
      const gotNewValue = mockedMap.get(newRow, newColumn)
      expect(size).toBe(3)
      expect(gotNewValue).toStrictEqual(newValue)
    })
  })

  describe('forEach', () => {
    test('process all inputs', () => {
      // arrange
      const mockedMap = new NNToSMapTest(testInitData)
      const arr: any[] = []
      const expected = [
        testInitData[0].value, testInitData[0].row, testInitData[0].column, 0,
        testInitData[1].value, testInitData[1].row, testInitData[1].column, 1,
      ]
      // act
      mockedMap.forEach((value, row, column, index) => {
        arr.push(value)
        arr.push(row)
        arr.push(column)
        arr.push(index)
      })
      // assert
      expect(arr).toStrictEqual(expected)
    })
  })
})
