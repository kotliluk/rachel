import { mod } from '../math'


describe('mod', () => {
  test('0 % 2 = 0', () => {
    // arrange
    const n = 0
    const m = 2
    const expected = 0
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })

  test('1 % 2 = 1', () => {
    // arrange
    const n = 1
    const m = 2
    const expected = 1
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })

  test('2 % 2 = 0', () => {
    // arrange
    const n = 2
    const m = 2
    const expected = 0
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })

  test('7 % 5 = 2', () => {
    // arrange
    const n = 7
    const m = 5
    const expected = 2
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })

  test('-1 % 2 = 1', () => {
    // arrange
    const n = -1
    const m = 2
    const expected = 1
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })

  test('-4 % 2 = 0', () => {
    // arrange
    const n = -4
    const m = 2
    const expected = 0
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })
})
