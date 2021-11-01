import {ColumnContent, SupportedColumnType} from '../relation/columnType'
import {LiteralValue} from '../vetree/literalValue'
import {Row} from '../relation/row'
import {ComputingOperator, ComputingOperatorType} from '../vetree/computingOperator'


const dummyRow = new Row(new Map<string, SupportedColumnType>())

const createLiteralValue = (value: ColumnContent, order: 'First' | 'Second'): LiteralValue => {
  if (typeof value === 'string' || typeof value === 'boolean') {
    throw new Error(order + ' parameter for computeArithmetic cannot have string/boolean type')
  }

  if (typeof value === 'number' && (Number.isNaN(value) || value === Infinity || value === -Infinity)) {
    throw new Error(order + ' parameter for computeArithmetic cannot be pseudo-number ' + value)
  }

  return new LiteralValue(value, 'number')
}

/**
 * Parses a ComputingOperator node for a given type and evaluates it with given sources.
 * If the left source is string or boolean, throws error.
 * Else, if the left source is a pseudo-number (NaN, Infinity, -Infinity), throws error.
 * Else, if the right source is string or boolean, throws error.
 * Else, if the right source is a pseudo-number (NaN, Infinity, -Infinity), throws error.
 * Else, if the type is "divide" and the right source is zero, throws error.
 *
 * @param type type of the logical operation
 * @param a left source, expected to be number or null
 * @param b right source, expected to be number or null
 */
export const computeArithmetic = (type: ComputingOperatorType, a: ColumnContent, b: ColumnContent): number | null => {
  let operator: ComputingOperator | undefined
  const left = createLiteralValue(a, 'First')
  const right = createLiteralValue(b, 'Second')

  if (type === ComputingOperatorType.plus) {
    operator = ComputingOperator.add(left, right, undefined)
  } else if (type === ComputingOperatorType.minus) {
    operator = ComputingOperator.deduct(left, right, undefined)
  } else if (type === ComputingOperatorType.multiplication) {
    operator = ComputingOperator.multiply(left, right, undefined)
  } else {
    if (b === 0) {
      throw new Error('Division by zero')
    }
    operator = ComputingOperator.divide(left, right, undefined)
  }

  return operator.eval(dummyRow).value
}
