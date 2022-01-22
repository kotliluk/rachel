import { mod } from '../math'
import * as fs from 'fs'


interface TestInput {
  n: number
  m: number
  expected: number
}

const getInputData = (): TestInput[] => {
  return fs.readFileSync('test_data/math/input.csv','utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .slice(1)
    .filter(line => line.trim().length !== 0)
    .map(line => {
      const params = line.split(',')
      return {
        n: Number.parseFloat(params[0]),
        m: Number.parseFloat(params[1]),
        expected: Number.parseFloat(params[2]),
      }
    })
}

describe('mod (group: #utils)', () => {
  test.each(getInputData())('Generated: %s', ({ n, m, expected }) => {
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })

  const testInputs: TestInput[] = [
    { n: 0, m: 2, expected: 0 },
    { n: 1, m: 2, expected: 1 },
    { n: 2, m: 2, expected: 0 },
    { n: 7, m: 5, expected: 2 },
    { n: -1, m: 2, expected: 1 },
    { n: -4, m: 2, expected: 0 },
    { n: -7, m: 3, expected: 2 },
  ]

  test.each(testInputs)('Manual: %s', ({ n, m, expected }) => {
    // act
    const actual = mod(n, m)
    // assert
    expect(actual).toBe(expected)
  })
})
