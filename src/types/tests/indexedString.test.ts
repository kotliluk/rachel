import { IndexedChar, IndexedString } from '../indexedString'
import { StartEndPair } from '../startEndPair'


const strOne = 'Str with \n and řý87"6§.)'
const strOneChars: IndexedChar[] = strOne.split('').map((char, index) => { return { char, index } })

const strTwo = 'The quick brown fox jumps over the lazy dog.'
const strTwoChars: IndexedChar[] = strTwo.split('').map((char, index) => { return { char, index } })

interface NewTestInput {
  str: string
  startIndex: number | undefined
  chars: IndexedChar[]
  firstIndex: number
  lastIndex: number
}

interface SplitTestInput {
  str: string
  separator: string
}

interface SliceTestInput {
  str: string
  start: number
  end: number | undefined
}

describe('IndexedString (group: #types)', () => {
  describe('IndexedString.new creates expected string', () => {
    const newTestInputs: NewTestInput[] = [
      {
        str: strOne,
        startIndex: undefined,
        chars: strOneChars,
        firstIndex: 0,
        lastIndex: strOne.length - 1,
      },
      {
        str: '',
        startIndex: undefined,
        chars: [],
        firstIndex: NaN,
        lastIndex: NaN,
      },
      {
        str: strOne,
        startIndex: 5,
        chars: strOneChars.map(ic => {
          return {char: ic.char, index: ic.index + 5}
        }),
        firstIndex: 5,
        lastIndex: strOne.length - 1 + 5,
      },
      {
        str: strOne,
        startIndex: NaN,
        chars: strOneChars.map(({char}) => {
          return {char, index: NaN}
        }),
        firstIndex: NaN,
        lastIndex: NaN,
      },
    ]

    test.each(newTestInputs)('%s', ({str, startIndex, chars, firstIndex, lastIndex}) => {
      // act
      const indexedString = IndexedString.new(str, startIndex)
      // assert
      expect(indexedString)
        .toRepresentString(str)
        .toHaveChars(chars)
        .toHaveFirstIndex(firstIndex)
        .toHaveLastIndex(lastIndex)
    })
  })

  describe('copy', () => {
    test('identical copy', () => {
      // arrange
      const indexedString = IndexedString.new(strOne)
      // act
      const copy = indexedString.copy()
      // assert
      expect(copy).toHaveChars(strOneChars)
    })

    test('change of original does not affect copy', () => {
      // arrange
      const indexedString = IndexedString.new(strOne)
      // act
      const copy = indexedString.copy()
      indexedString.getChars()[0].index++
      // assert
      expect(copy).toHaveChars(strOneChars)
    })

    test('change of copy does not affect original', () => {
      // arrange
      const indexedString = IndexedString.new(strOne)
      // act
      const copy = indexedString.copy()
      copy.getChars()[0].index++
      // assert
      expect(indexedString).toHaveChars(strOneChars)
    })
  })

  describe('split', () => {
    test('original string not changed', () => {
      // arrange
      const indexedString = IndexedString.new(strTwo)
      // act
      indexedString.split('')
      // assert
      expect(indexedString).toHaveChars(strTwoChars)
    })

    const splitTestInputs: SplitTestInput[] = [
      {str: strTwo, separator: ' '},
      {str: '', separator: ' '},
      {str: strOne, separator: ''},
      {str: '', separator: ''},
    ]

    test.each(splitTestInputs)('%s', ({str, separator}) => {
      // arrange
      const indexedString = IndexedString.new(str)
      const split: string[] = str.split(separator)
      // act
      const indexedSplit: IndexedString[] = indexedString.split(separator)
      // assert
      expect(indexedSplit).toEqualToStrings(split)
    })
  })

  describe('slice', () => {
    test('original string not changed', () => {
      // arrange
      const indexedString = IndexedString.new(strTwo)
      // act
      indexedString.slice(5, 15)
      // assert
      expect(indexedString).toHaveChars(strTwoChars)
    })

    const sliceTestValidInputs: SliceTestInput[] = [
      {str: strTwo, start: 5, end: 15},
      {str: strTwo, start: 0, end: 5},
      {str: strTwo, start: 5, end: undefined},
      {str: strTwo, start: 0, end: undefined},
      {str: strTwo, start: 0, end: 0},
      {str: strTwo, start: -25, end: -12},
      {str: strTwo, start: -2, end: -1},
    ]

    test.each(sliceTestValidInputs)('%s', ({str, start, end}) => {
      // arrange
      const indexedString = IndexedString.new(str)
      const slice: string = strTwo.slice(start, end)
      // act
      const indexedSlice: IndexedString = indexedString.slice(start, end)
      // assert
      expect(indexedSlice).toRepresentString(slice)
    })

    const sliceTestInvalidInputs: SliceTestInput[] = [
      {str: strTwo, start: -6, end: 3},
      {str: strTwo, start: 2, end: -100},
      {str: strTwo, start: 4, end: 2},
      {str: strTwo, start: 2, end: 100},
    ]

    test.each(sliceTestInvalidInputs)('%s', ({str, start, end}) => {
      // arrange
      const indexedString = IndexedString.new(str)
      // act and assert
      expect(() => {
        indexedString.slice(start, end)
      }).toThrow()
    })
  })

  describe('trim', () => {
    test('original string not changed', () => {
      // arrange
      const indexedString = IndexedString.new(strTwo)
      // act
      indexedString.trim()
      // assert
      expect(indexedString).toHaveChars(strTwoChars)
    })

    const trimTestInputs: string[] = [
      '  \n \tfeib jfnsbiu   hf  \t\t',
      'feib jfnsbiu   hf',
    ]

    test.each(trimTestInputs)('%s', (str) => {
      // arrange
      const trim: string = str.trim()
      const indexedString = IndexedString.new(str)
      // act
      const actual: IndexedString = indexedString.trim()
      // assert
      expect(actual).toRepresentString(trim)
    })
  })

  describe('concat', () => {
    test('original strings not changed', () => {
      // arrange
      const a = 'abc def'
      const b = '123 456'
      const isA = IndexedString.new(a)
      const isB = IndexedString.new(b)
      // act
      isA.concat(isB)
      // assert
      expect(isA).toRepresentString(a)
      expect(isB).toRepresentString(b)
    })

    test('original indexes kept', () => {
      // arrange
      const isA = IndexedString.newFromArray([{char: 'a', index: 5}])
      const isB = IndexedString.newFromArray([{char: 'b', index: 8}])
      const isC = IndexedString.newFromArray([{char: 'c', index: 11}])
      // act
      const result = isA.concat(isB, isC)
      // assert
      expect(result).toHaveFirstIndex(5).toHaveLastIndex(11)
    })

    test('concat 4 strings', () => {
      // arrange
      const a = 'abc def'
      const b = '123 456'
      const c = 'ěšč řžý'
      const d = ",./ ;'\\"
      const isA = IndexedString.new(a)
      const isB = IndexedString.new(b)
      const isC = IndexedString.new(c)
      const isD = IndexedString.new(d)
      const expected: string = a.concat(b, c, d)
      // act
      const actual: IndexedString = isA.concat(isB, isC, isD)
      // assert
      expect(actual).toRepresentString(expected)
    })

    test('concat 1 string', () => {
      // arrange
      const a = 'abc def'
      const isA = IndexedString.new(a)
      const expected: string = a.concat()
      // act
      const actual: IndexedString = isA.concat()
      // assert
      expect(actual).toRepresentString(expected)
    })
  })

  describe('getRange', () => {
    test('empty string returns undefined', () => {
      // arrange
      const is: IndexedString = IndexedString.empty()
      // act
      const actual: StartEndPair | undefined = is.getRange()
      // assert
      expect(actual).toBeUndefined()
    })

    test('all numbers', () => {
      // arrange
      const arr: IndexedChar[] = [{char: 'a', index: 0}, {char: 'a', index: 1}, {char: 'a', index: 2}]
      const is: IndexedString = IndexedString.newFromArray(arr)
      // act
      const actual: StartEndPair | undefined = is.getRange()
      // assert
      expect(actual).toStrictEqual({start: 0, end: 2})
    })

    test('starting and ending with NaN', () => {
      // arrange
      const arr: IndexedChar[] = [{char: 'a', index: NaN}, {char: 'a', index: 1}, {char: 'a', index: NaN}]
      const is: IndexedString = IndexedString.newFromArray(arr)
      // act
      const actual: StartEndPair | undefined = is.getRange()
      // assert
      expect(actual).toStrictEqual({start: NaN, end: NaN})
    })
  })
})
