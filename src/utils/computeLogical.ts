import {LogicalOperator, LogicalOperatorType} from '../vetree/logicalOperator'
import {ColumnContent, SupportedColumnType} from '../relation/columnType'
import {IndexedString} from '../types/indexedString'
import {LiteralValue} from '../vetree/literalValue'
import {Row} from '../relation/row'


const dummyRow = new Row(new Map<string, SupportedColumnType>())

const createLiteralValue = (value: ColumnContent, order: 'First' | 'Second'): LiteralValue => {
  if (typeof value === 'string' || typeof value === 'number') {
    throw new Error(order + ' parameter for computeLogical cannot have string/number type')
  }

  return new LiteralValue(value, 'boolean')
}

/**
 * Parses a LogicalOperator node for a given type and evaluates it with given sources.
 * If the type is "not" and the right source is defined, throws error.
 * Else, if the type is "and" or "or" and the right source is undefined, throws error.
 * Else, if the left source is string or number, throws error.
 * Else, if the right source is string or number, throws error.
 *
 * @param type type of the logical operation
 * @param a left source, expected to be boolean or null
 * @param b right source, expected to be boolean or null, or it can be undefined when type is "not"
 */
export const computeLogical = (type: LogicalOperatorType, a: ColumnContent, b: ColumnContent | undefined): boolean => {
  if (type === LogicalOperatorType.not && b !== undefined) {
    throw new Error('Two parameters given to an unary NOT operator')
  }

  if (type !== LogicalOperatorType.not && b === undefined) {
    throw new Error(`One parameter given to a binary ${type} operator`)
  }

  let operator: LogicalOperator | undefined
  const left = createLiteralValue(a, 'First')

  if (type === LogicalOperatorType.not) {
    operator = LogicalOperator.not(IndexedString.empty(), left)
    return operator.eval(dummyRow).value
  }

  // @ts-ignore - b cannot be undefined here
  const right = createLiteralValue(b, 'Second')

  if (type === LogicalOperatorType.and) {
    operator = LogicalOperator.and(IndexedString.empty(), left, right)
  } else {
    operator = LogicalOperator.or(IndexedString.empty(), left, right)
  }

  return operator.eval(dummyRow).value
}
