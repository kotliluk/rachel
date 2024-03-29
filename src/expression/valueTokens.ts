import { ComparingOperatorType } from '../vetree/comparingOperator'
import { ColumnContent, SupportedColumnType } from '../relation/columnType'
import { IndexedString } from '../types/indexedString'
import { StartEndPair } from '../types/startEndPair'

/**
 * Precedence value for all token types.
 */
const precedenceNot = 50
const precedenceMulDiv = 30
const precedencePlusMinus = 25
const precedenceComparison = 20
const precedenceAnd = 10
const precedenceOr = 5

/**
 * Tokens used for parsing of string expression to BooleanEvaluating tree.
 */
export abstract class ValueToken {
  protected constructor (public readonly str: IndexedString) {}

  /**
     * Gets token start and end index in the text (if the token has IndexedString representation) or undefined.
     */
  getRange (): StartEndPair | undefined {
    return this.str.getRange()
  }
}

export abstract class OperatorToken extends ValueToken {
  protected constructor (str: IndexedString, readonly precedence: number) {
    super(str)
  }
}

export class LogicalNotToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedenceNot)
  }
}

export class LogicalAndToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedenceAnd)
  }
}

export class LogicalOrToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedenceOr)
  }
}

export class ComputingMultiplicationToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedenceMulDiv)
  }
}

export class ComputingDivisionToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedenceMulDiv)
  }
}

export class ComputingPlusToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedencePlusMinus)
  }
}

export class ComputingMinusToken extends OperatorToken {
  constructor (operator: IndexedString) {
    super(operator, precedencePlusMinus)
  }
}

export class ComparingToken extends OperatorToken {
  constructor (readonly type: ComparingOperatorType, operator: IndexedString) {
    super(operator, precedenceComparison)
  }
}

export abstract class ParenthesisToken extends ValueToken {
  protected constructor (operator: IndexedString) {
    super(operator)
  }
}

export class OpeningParentheses extends ParenthesisToken {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (operator: IndexedString) {
    super(operator)
  }
}

export class ClosingParentheses extends ParenthesisToken {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (operator: IndexedString) {
    super(operator)
  }
}

export class LiteralToken extends ValueToken {
  constructor (str: IndexedString, readonly value: ColumnContent, readonly type: SupportedColumnType | 'null') {
    super(str)
  }
}

export class ReferenceToken extends ValueToken {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (columnName: IndexedString) {
    super(columnName)
  }
}
