const fs = require('fs')


process.chdir(__dirname)

const expectedResults = [
  // type = and
  [
    ['error1', 'error1', 'error1', 'error3'],
    ['error2', 'true', 'false', 'error3'],
    ['error2', 'false', 'false', 'error3'],
    ['error2', 'false', 'false', 'error3'],
  ],
  // type = or
  [
    ['error1', 'error1', 'error1', 'error3'],
    ['error2', 'true', 'true', 'error3'],
    ['error2', 'true', 'false', 'error3'],
    ['error2', 'true', 'false', 'error3'],
  ],
  // type = not
  [
    ['error4', 'error4', 'error4', 'error1'],
    ['error4', 'error4', 'error4', 'false'],
    ['error4', 'error4', 'error4', 'true'],
    ['error4', 'error4', 'error4', 'false'],
  ],
]

// maps params to their index in expectedResult
const getExpectedResultIndex = (str) => {
  switch (str) {
    case 'and':
      return 0
    case 'or':
      return 1
    case 'not':
      return 2

    case 'aNumStr':
      return 0
    case 'aTrue':
      return 1
    case 'aFalse':
      return 2
    case 'aNull':
      return 3

    case 'bNumStr':
      return 0
    case 'bTrue':
      return 1
    case 'bFalseNull':
      return 2
    case 'bUndef':
      return 3

    default:
      throw new Error('Unexpected EC name: ' + str)
  }
}

// gets expected result for the given parameter values
const getExpectedResult = (params) => {
  return expectedResults[getExpectedResultIndex(params[0])][getExpectedResultIndex(params[1])][getExpectedResultIndex(params[2])]
}

// boundary values for each EC of a parameter
const aParamMap = new Map([
  ['aNumStr', ['1', 'str']],
  ['aTrue', ['true']],
  ['aFalse', ['false']],
  ['aNull', ['null']],
])

// boundary values for each EC of b parameter
const bParamMap = new Map([
  ['bNumStr', ['1', 'str']],
  ['bTrue', ['true']],
  ['bFalseNull', ['false', 'null']],
  ['bUndef', ['undefined']],
])

const processOrig = (orig, result) => {
  const resultLines = []

  // loads original file
  const origLines = fs.readFileSync(orig,'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')

  // adds param names line
  resultLines.push(origLines[0] + ',expected')

  origLines.slice(1)
    .filter(line => line.trim().length > 4)
    .forEach(line => {
      // parses the line into parameters
      const params = line.split(',')
      const aMappings = aParamMap.get(params[1]) || []
      const bMappings = bParamMap.get(params[2]) || []
      const expected = getExpectedResult(params)
      // adds boundary values for parameters
      aMappings.forEach(n => {
        bMappings.forEach(m => resultLines.push(params[0] + ',' + n + ',' + m + ',' + expected))
      })
    })

  // saves the result file
  fs.writeFileSync(result, resultLines.join('\n'))
}

processOrig('orig_2way_uniform.csv', 'input_2way_uniform.csv')
processOrig('orig_2way_mixed.csv', 'input_2way_mixed.csv')
processOrig('orig_3way_uniform.csv', 'input_3way_uniform.csv')
