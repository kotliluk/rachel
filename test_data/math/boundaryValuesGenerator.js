const fs = require('fs')


const ORIG_FILENAME = 'orig.csv'
const RESULT_FILENAME = 'input.csv'

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

const resultLines = []

// loads original file
const origLines = fs.readFileSync(ORIG_FILENAME,'utf8').split('\n')

// adds param names line
resultLines.push(origLines[0] + ',expected')

origLines.slice(1).forEach(line => {
  // parses the line into parameters
  const params = line.split(',')
  const nMappings = nParamMap.get(params[0]) || []
  const mMappings = mParamMap.get(params[1]) || []
  // adds boundary values for parameters
  nMappings.forEach(n => {
    mMappings.forEach(m => resultLines.push(n + ',' + m))
  })
})

// saves the result file
fs.writeFileSync(RESULT_FILENAME, resultLines.join('\n'))
