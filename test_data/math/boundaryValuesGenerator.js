const fs = require('fs')


process.chdir(__dirname)

const expectedResults = [
  ['NaN', 'NaN'],
  ['NaN', '0'],
]

// maps params to their index in expectedResult
const getExpectedResultIndex = (str) => {
  switch (str) {
    case 'nInvalid':
      return 0
    case 'nValid':
      return 1

    case 'mInvalid':
      return 0
    case 'mValid':
      return 1

    default:
      throw new Error('Unexpected EC name: ' + str)
  }
}

// gets expected result for the given parameter values
const getExpectedResult = (params) => {
  return expectedResults[getExpectedResultIndex(params[0])][getExpectedResultIndex(params[1])]
}

// boundary values for each EC of n parameter
const nParamMap = new Map([
  ['nInvalid', ['NaN', '-Infinity', 'Infinity']],
  ['nValid', ['-1.7976931348623157e+308', '1.7976931348623157e+308']],
])

// boundary values for each EC of m parameter
const mParamMap = new Map([
  ['mInvalid', ['NaN', '-Infinity', '0', 'Infinity']],
  ['mValid', ['5e-324', '1.7976931348623157e+308']],
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
      const nMappings = nParamMap.get(params[0]) || []
      const mMappings = mParamMap.get(params[1]) || []
      const expected = getExpectedResult(params)
      // adds boundary values for parameters
      nMappings.forEach(n => {
        mMappings.forEach(m => resultLines.push(n + ',' + m + ',' + expected))
      })
    })

  // saves the result file
  fs.writeFileSync(result, resultLines.join('\n'))
}

processOrig('orig.csv', 'input.csv')
