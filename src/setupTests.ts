import '@testing-library/jest-dom/extend-expect'
import 'jest-chain'
import { StoredRelation } from './relation/storedRelation'
import { isDeepStrictEqual } from 'util'
import { Pair } from './types/pair'
import { IndexedChar, IndexedString } from './types/indexedString'
import { ColumnContent, SupportedColumnType } from './relation/columnType'
import { VEResult } from './vetree/veTreeNode'
import { StartEndPair } from './types/startEndPair'
import { ErrorWithTextRange } from './error/errorWithTextRange'


declare global {
  namespace jest {
    interface Matchers<R> {
      // For objects with 'equals(any): boolean' method
      toEqualTo(expected: any): R
    }
    interface Matchers<R> {
      // For Error testing
      toThrowErrorWithSubstr(msg: string): R
    }
    interface Matchers<R> {
      // For Error testing
      toHaveMessage(msg: string): R
    }
    interface Matchers<R> {
      // For ErrorWithTextRange testing
      toHaveTextRange(range: StartEndPair | undefined): R
    }
    interface Matchers<R> {
      // For StoredRelation testing
      toHaveName(name: string): R
      // For StoredRelation testing
      toHaveColumnNames(columnNames: string[]): R
      // For StoredRelation testing
      toHaveColumnTypes(columnTypes: string[]): R
      // For StoredRelation testing
      toHaveRows(rows: string[][]): R
    }
    interface Matchers<R> {
      // For IndexedString testing
      toRepresentString(str: string): R
      // For IndexedString testing
      toHaveChars(chars: IndexedChar[]): R
      // For IndexedString testing
      toHaveFirstIndex(firstIndex: number): R
      // For IndexedString testing
      toHaveLastIndex(lastIndex: number): R
      // For IndexedString[] testing
      toEqualToStrings(strs: string[]): R
    }
    interface Matchers<R> {
      // For Pair<IndexedString> testing
      toHaveParts(first: string, second: string): R
    }
    interface Matchers<R> {
      // For VEResult testing
      toHaveValueAndType(value: ColumnContent, type: SupportedColumnType | 'null'): R
    }
  }
}

/**
 * For objects with 'equals(any): boolean' method.
 */
expect.extend({
  toEqualTo (obj: { equals: (other: any) => boolean }, expected: any) {
    const pass = obj.equals(expected)
    return {
      pass,
      message: () => pass
        ? ''
        : 'Object is not equal to the expected one, expected: ' + expected
        + ', actual: ' + obj,
    }
  },
})

/**
 * For Error throwing testing.
 */
expect.extend({
  toThrowErrorWithSubstr (callback: () => void, substr: string) {
    let passThrow = false
    let passError = false
    let passSubstr = false
    let error: any
    try {
      callback()
    } catch (e) {
      error = e
      passThrow = true
      passError = e instanceof Error
      passSubstr = e.message.includes(substr)
    }
    return {
      pass: passThrow && passError && passSubstr,
      message: () => {
        if (!passThrow) return 'Expression did not throw'

        if (!passError) return `Expression did not throw error but ${error}`

        return `Thrown error '${error.message}' does not contain expected substring: ${substr}`
      },
    }
  },
})

/**
 * For Error testing.
 */
expect.extend({
  toHaveMessage (error: Error, msg: string) {
    const pass = error.message === msg
    return {
      pass,
      message: () => pass ? '' : 'Error has unexpected message, expected: ' + msg + ', actual: ' + error.message,
    }
  },
})

/**
 * For ErrorWithTextRange testing.
 */
expect.extend({
  toHaveTextRange (error: ErrorWithTextRange, range: StartEndPair | undefined) {
    const pass = isDeepStrictEqual(error.range, range)
    return {
      pass,
      message: () => pass
        ? ''
        : 'ErrorWithTextRange has unexpected range, expected: ' + range + ', actual: '
        + error.range,
    }
  },
})

/**
 * For StoredRelation testing.
 */
expect.extend({
  toHaveName (relation: StoredRelation, name: string) {
    const actual = relation.getName()
    const pass = actual === name
    return {
      pass,
      message: () => pass ? '' : 'StoredRelation has unexpected name, expected: ' + name + ', actual: ' + actual,
    }
  },

  toHaveColumnNames (relation: StoredRelation, columnNames: string[]) {
    const actual = relation.getColumnNames()
    const pass = isDeepStrictEqual(actual, columnNames)
    return {
      pass,
      message: () => pass ? '' : 'StoredRelation has unexpected column names, expected: ' + columnNames + ', actual: ' + actual,
    }
  },

  toHaveColumnTypes (relation: StoredRelation, columnTypes: string[]) {
    const actual = relation.getColumnTypes()
    const pass = isDeepStrictEqual(actual, columnTypes)
    return {
      pass,
      message: () => pass ? '' : 'StoredRelation has unexpected column types, expected: ' + columnTypes + ', actual: ' + actual,
    }
  },

  toHaveRows (relation: StoredRelation, rows: string[][]) {
    const actual = relation.getRows()
    const pass = isDeepStrictEqual(actual, rows)
    return {
      pass,
      message: () => pass ? '' : 'StoredRelation has unexpected rows, expected: ' + rows + ', actual: ' + actual,
    }
  },
})

/**
 * For Pair<IndexedString> testing.
 */
expect.extend({
  toHaveParts (pair: Pair<IndexedString>, first: string, second: string) {
    const passFirst = pair.first.toString() === first
    const passSecond = pair.second.toString() === second
    return {
      pass: passFirst && passSecond,
      message: () => {
        let ret = ''
        !passFirst && (ret += 'Pair has unexpected first member, expected: ' + first + ', actual: ' + pair.first.toString())
        !passFirst && !passSecond && (ret += '\n')
        !passSecond && (ret += 'Pair has unexpected second member, expected: ' + second + ', actual: ' + pair.second.toString())
        return ret
      },
    }
  },
})

/**
 * For VEResult testing.
 */
expect.extend({
  toHaveValueAndType (result: VEResult, value: ColumnContent, type: SupportedColumnType | 'null') {
    const passValue = result.value === value
    const passType = result.type === type
    return {
      pass: passValue && passType,
      message: () => {
        let ret = '  '
        !passValue && (ret += 'VEResult has unexpected value, expected:   ' + value + ', actual:   ' + result.value)
        !passValue && !passType && (ret += '\n')
        !passType && (ret += 'VEResult has unexpected type, expected:   ' + value + ', actual:   ' + result.value)
        return ret
      },
    }
  },
})

/**
 * For IndexedString testing.
 */
expect.extend({
  toRepresentString (indexedStr: IndexedString, str: string) {
    const pass = indexedStr.toString() === str
    return {
      pass,
      message: () => pass
        ? ''
        : 'IndexedString does not represent expected string, expected: ' + str + ', actual: '
        + indexedStr.toString(),
    }
  },

  toHaveChars (indexedStr: IndexedString, chars: IndexedChar[]) {
    const pass = isDeepStrictEqual(indexedStr.getChars(), chars)
    return {
      pass,
      message: () => pass
        ? ''
        : 'IndexedString does not have expected chars, expected: ' + JSON.stringify(chars)
        + ', actual: ' + JSON.stringify(indexedStr.getChars()),
    }
  },

  toHaveFirstIndex (indexedStr: IndexedString, firstIndex: number) {
    const pass = indexedStr.getFirstIndex() === firstIndex || isNaN(indexedStr.getFirstIndex()) === isNaN(firstIndex)
    return {
      pass,
      message: () => pass
        ? ''
        : 'IndexedString does not have expected first index, expected: ' + firstIndex
        + ', actual: ' + indexedStr.getFirstIndex(),
    }
  },

  toHaveLastIndex (indexedStr: IndexedString, lastIndex: number) {
    const pass = indexedStr.getLastIndex() === lastIndex || isNaN(indexedStr.getLastIndex()) === isNaN(lastIndex)
    return {
      pass,
      message: () => pass
        ? ''
        : 'IndexedString does not have expected last index, expected: ' + lastIndex
        + ', actual: ' + indexedStr.getLastIndex(),
    }
  },

  toEqualToStrings (indexedStrs: IndexedString[], strs: string[]) {
    const passes = indexedStrs.map((indexedStr, i) => indexedStr.toString() === strs[i])
    const pass = passes.reduce((agg, cur) => agg && cur, true)
    return {
      pass,
      message: () => {
        if (pass) {
          return ''
        }
        let msg = 'Split IndexedString does not have expected parts:'
        msg += passes
          .map((p, i) => p ? '' : '\n- Part ' + i + ' - expected: ' + strs[i] + ', actual: ' + indexedStrs[i])
          .join('')
        return msg
      },
    }
  },
})
