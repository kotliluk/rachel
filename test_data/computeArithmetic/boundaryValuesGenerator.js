const fs = require('fs')


const expectedResults = [
  // type = nonDivide
  [
    ['error1', 'error1', 'error1', 'error1', 'error1'],
    ['error3', '__TODO__', '__TODO__', 'error4', 'null'],
    ['error2', 'error2', 'error2', 'error2', 'error2'],
    ['error3', 'null', 'null', 'error4', 'null'],
  ],
  // type = divide
  [
    ['error1', 'error1', 'error1', 'error1', 'error1'],
    ['error3', '__TODO__', 'error5', 'error4', 'null'],
    ['error2', 'error2', 'error2', 'error2', 'error2'],
    ['error3', 'null', 'error5', 'error4', 'null'],
  ],
]

// maps params to their index in expectedResult
const getExpectedResultIndex = (str) => {
  switch (str) {
    case 'nonDivide':
      return 0
    case 'divide':
      return 1

    case 'aPseudonum':
      return 0
    case 'aNum':
      return 1
    case 'aStrBool':
      return 2
    case 'aNull':
      return 3

    case 'bPseudonum':
      return 0
    case 'bNonZero':
      return 1
    case 'bZero':
      return 2
    case 'bStrBool':
      return 3
    case 'bNull':
      return 4

    default:
      throw new Error('Unexpected EC name: ' + str)
  }
}

// gets expected result for the given parameter values
const getExpectedResult = (params) => {
  return expectedResults[getExpectedResultIndex(params[0])][getExpectedResultIndex(params[1])][getExpectedResultIndex(params[2])]
}

// boundary values for each EC of type parameter
const typeParamMap = new Map([
  ['divide', ['division']],
  ['nonDivide', ['plus', 'minus', 'multiplication']],
])

// boundary values for each EC of a parameter
const aParamMap = new Map([
  ['aPseudonum', ['NaN', '-Infinity', 'Infinity']],
  ['aNum', ['-1.7976931348623157e+308', '1.7976931348623157e+308']],
  ['aStrBool', ['str', 'true']],
  ['aNull', ['null']],
])

// boundary values for each EC of b parameter
const bParamMap = new Map([
  ['bPseudonum', ['NaN', '-Infinity', 'Infinity']],
  ['bNonZero', ['-1.7976931348623157e+308', '-5e-324', '5e-324', '1.7976931348623157e+308']],
  ['bZero', ['0']],
  ['bStrBool', ['str', 'true']],
  ['bNull', ['null']],
])

const processOrig = (orig, result) => {
  const resultLines = []

  // loads original file
  const origLines = fs.readFileSync(orig,'utf8').split('\n')

  // adds param names line
  resultLines.push(origLines[0] + ',expected')

  origLines.slice(1)
    .filter(line => line.trim().length > 4)
    .forEach(line => {
      // parses the line into parameters
      const params = line.split(',')
      const typeMappings = typeParamMap.get(params[0]) || []
      const aMappings = aParamMap.get(params[1]) || []
      const bMappings = bParamMap.get(params[2]) || []
      const expected = getExpectedResult(params)
      // adds boundary values for parameters
      typeMappings.forEach(type => {
        aMappings.forEach(n => {
          bMappings.forEach(m => resultLines.push(type + ',' + n + ',' + m + ',' + expected))
        })
      })
    })

  // saves the result file
  fs.writeFileSync(result, resultLines.join('\n'))
}

processOrig('orig_2way_uniform.csv', 'input_2way_uniform.csv')
processOrig('orig_2way_mixed.csv', 'input_2way_mixed.csv')
processOrig('orig_3way_uniform.csv', 'input_3way_uniform.csv')
