import { ISToISMap, KeyValue } from '../isToISMap'
import { IndexedString } from '../indexedString'


const testInitData = [
  { key: 'key0', value: 'value0' },
  { key: 'key1', value: 'value1' },
]

/**
 * Extended test class to support initial data filling.
 */
class IsToISMapTest extends ISToISMap {
  constructor (initData: { key: string, value: string }[]) {
    super()
    this.map = new Map<string, KeyValue>(initData.map(({ key, value }) => {
      return [key, { key: IndexedString.new(key), value: IndexedString.new(value) }]
    }))
  }
}


describe('ISToISMap (group: #types)', () => {
  describe('get', () => {
    test.each([
      // present string keys
      ...testInitData.map(({key, value}) => {
        return {key, expected: IndexedString.new(value)}
      }),
      // present indexed string keys
      ...testInitData.map(({key, value}) => {
        return {key: IndexedString.new(key), expected: IndexedString.new(value)}
      }),
      // absent string key
      {key: 'absent', expected: undefined},
      // absent indexed string key
      {key: IndexedString.new('absent'), expected: undefined},
    ])('%s', ({key, expected}) => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      // act
      const actual = mockedMap.get(key)
      // assert
      expect(actual?.toString()).toStrictEqual(expected?.toString())
    })
  })

  describe('has', () => {
    test.each([
      // present string keys
      ...testInitData.map(({key}) => {
        return {key, expected: true}
      }),
      // present indexed string keys
      ...testInitData.map(({key}) => {
        return {key: IndexedString.new(key), expected: true}
      }),
      // absent string key
      {key: 'absent', expected: false},
      // absent indexed string key
      {key: IndexedString.new('absent'), expected: false},
    ])('%s', ({key, expected}) => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      // act
      const actual = mockedMap.has(key)
      // assert
      expect(actual).toBe(expected)
    })
  })

  describe('size', () => {
    test('empty init', () => {
      // arrange
      const mockedMap = new IsToISMapTest([])
      // act
      const size = mockedMap.size()
      // assert
      expect(size).toBe(0)
    })

    test('init with two objects', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      // act
      const size = mockedMap.size()
      // assert
      expect(size).toBe(2)
    })
  })

  describe('clear', () => {
    test('removes all inputs', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      // act
      mockedMap.clear()
      // assert
      const size = mockedMap.size()
      const hasKey = mockedMap.has(testInitData[0].key)
      expect(size).toBe(0)
      expect(hasKey).toBe(false)
    })
  })

  describe('delete', () => {
    test('deletes key', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      const key = IndexedString.new(testInitData[0].key)
      // act
      mockedMap.delete(key)
      // assert
      expect(mockedMap.size()).toBe(1)
    })

    test('does not delete absent key', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      const absentKey = IndexedString.new('absent')
      // act
      mockedMap.delete(absentKey)
      // assert
      expect(mockedMap.size()).toBe(2)
    })
  })

  describe('set', () => {
    test('changes values', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      const keyIS = IndexedString.new(testInitData[0].key)
      const changedValueIS = IndexedString.new('changed value')
      // act
      mockedMap.set(keyIS, changedValueIS)
      // assert
      const size = mockedMap.size()
      const gotChangedValue = mockedMap.get(keyIS)
      expect(size).toBe(2)
      expect(gotChangedValue?.toString()).toStrictEqual(changedValueIS.toString())
    })

    test('adds values', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      const newKeyIS = IndexedString.new('new key')
      const newValueIS = IndexedString.new('new value')
      // act
      mockedMap.set(newKeyIS, newValueIS)
      // assert
      const size = mockedMap.size()
      const gotNewValue = mockedMap.get(newKeyIS)
      expect(size).toBe(3)
      expect(gotNewValue?.toString()).toStrictEqual(newValueIS.toString())
    })
  })

  describe('forEach', () => {
    test('process all inputs', () => {
      // arrange
      const mockedMap = new IsToISMapTest(testInitData)
      const arr: any[] = []
      const expected = [testInitData[0].value, testInitData[0].key, 0, testInitData[1].value, testInitData[1].key, 1]
      // act
      mockedMap.forEach((value, key, index) => {
        arr.push(value.toString())
        arr.push(key.toString())
        arr.push(index)
      })
      // assert
      expect(arr).toStrictEqual(expected)
    })
  })
})
