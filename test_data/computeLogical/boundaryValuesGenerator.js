const fs = require('fs')


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

const resultLines = []

const processOrig = (orig, result) => {
  // loads original file
  const origLines = fs.readFileSync(orig,'utf8').split('\n')

  // adds param names line
  resultLines.push(origLines[0] + ',expected')

  origLines.slice(1).forEach(line => {
    // parses the line into parameters
    const params = line.split(',')
    const aMappings = aParamMap.get(params[1]) || []
    const bMappings = bParamMap.get(params[2]) || []
    // adds boundary values for parameters
    aMappings.forEach(n => {
      bMappings.forEach(m => resultLines.push(params[0] + ',' + n + ',' + m))
    })
  })

  // saves the result file
  fs.writeFileSync(result, resultLines.join('\n'))
}

// processOrig('orig_2way_uniform.csv', 'input_2way_uniform.csv')
// processOrig('orig_2way_mixed.csv', 'input_2way_mixed.csv')
// processOrig('orig_3way_uniform.csv', 'input_3way_uniform.csv')
