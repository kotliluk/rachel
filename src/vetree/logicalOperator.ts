import { Row } from '../relation/row'
import { VEResult, VETreeNode } from './veTreeNode'
import { ErrorFactory } from '../error/errorFactory'
import { IndexedString } from '../types/indexedString'
import { language } from '../language/language'

/**
 * Enum of types of LogicalOperator class.
 * @category VETree
 * @public
 */
export enum LogicalOperatorType {
  and = 'and',
  or = 'or',
  not = 'not',
}

/**
 * Logical operator chains boolean values and produces new ones.
 * @extends VETreeNode
 * @category VETree
 * @public
 */
export class LogicalOperator extends VETreeNode {

  /**
     * Creates an 'and' logical operator.
     *
     * @param operator String representing an 'and' in input (used to printing) {@type IndexedString}
     * @param left Left subtree evaluating to a boolean value {@type VETreeNode}
     * @param right Right subtree evaluating to a boolean value {@type VETreeNode}
     * @return new LogicalOperator instance of and type {@type LogicalOperator}
     * @public
     */
  static and (operator: IndexedString, left: VETreeNode, right: VETreeNode): LogicalOperator {
    return new LogicalOperator(LogicalOperatorType.and, operator, left, right)
  }

  /**
     * Creates an 'or' logical operator.
     *
     * @param operator String representing an 'or' in input (used to printing) {@type IndexedString}
     * @param left Left subtree evaluating to a boolean value {@type VETreeNode}
     * @param right Right subtree evaluating to a boolean value {@type VETreeNode}
     * @return new LogicalOperator instance of and type {@type LogicalOperator}
     * @public
     */
  static or (operator: IndexedString, left: VETreeNode, right: VETreeNode): LogicalOperator {
    return new LogicalOperator(LogicalOperatorType.or, operator, left, right)
  }

  /**
     * Creates a 'not' logical operator.
     *
     * @param operator String representing a 'not' in input (used to printing) {@type IndexedString}
     * @param subtree Subtree evaluating to a boolean value {@type VETreeNode}
     * @return new LogicalOperator instance of and type {@type LogicalOperator}
     * @public
     */
  static not (operator: IndexedString, subtree: VETreeNode): LogicalOperator {
    return new LogicalOperator(LogicalOperatorType.not, operator, subtree)
  }

  private constructor (private readonly type: LogicalOperatorType, private readonly operator: IndexedString,
                        private readonly left: VETreeNode, private readonly right?: VETreeNode) {
    super()
  }

  /**
     * Evaluates recursively subtrees and transforms their boolean results into a new boolean.
     * If any subtree evaluates to string or number, throws error.
     *
     * @param source row with actual values of columns recursively passed to leaf reference nodes {@type Row}
     * @return boolean comparing left and right subtree values {@type VEResult}
     * @public
     */
  eval (source: Row): { value: boolean, type: 'boolean' } {
    const leftResult: VEResult = this.left.eval(source)
    if (leftResult.type !== 'boolean') {
      throw ErrorFactory.syntaxError(language().syntaxErrors.logicalOperator_leftInputNotBoolean,
                this.operator.getRange(), this.operator.toString(), leftResult.type)
    }

    if (this.type === LogicalOperatorType.not) {
      if (leftResult.value === null) {
        return { value: false, type: 'boolean' }
      }
      return { value: !leftResult.value, type: 'boolean' }
    } else {
      // @ts-ignore (in and/or operations right subtree must exist)
      const rightResult: VEResult = this.right.eval(source)
      if (rightResult.type !== 'boolean') {
        throw ErrorFactory.syntaxError(language().syntaxErrors.logicalOperator_rightInputNotBoolean,
                    this.operator.getRange(), this.operator.toString(), rightResult.type)
      }

      if (this.type === LogicalOperatorType.and) {
        if (leftResult.value === null || rightResult.value === null) {
          return { value: false, type: 'boolean' }
        }
        // @ts-ignore (they must be both booleans now)
        return { value: leftResult.value && rightResult.value, type: 'boolean' }
      } else /* if (this.type === LogicalOperatorType.or)*/ {
        if (leftResult.value === null && rightResult.value === null) {
          return { value: false, type: 'boolean' }
        }
        if (leftResult.value === null) {
          // @ts-ignore (it must be boolean now)
          return { value: rightResult.value, type: 'boolean' }
        }
        if (rightResult.value === null) {
          // @ts-ignore (it must be boolean now)
          return { value: leftResult.value, type: 'boolean' }
        }
        // @ts-ignore (they must be both booleans now)
        return { value: leftResult.value || rightResult.value, type: 'boolean' }
      }
    }
  }

  /**
     * Returns string representation of the node.
     *
     * @return string representation of the node {@type string}
     * @public
     */
  toString (): string {
    if (this.type === LogicalOperatorType.not) {
      return this.operator.toString() + '(' + this.left.toString() + ')'
    }
    // @ts-ignore (in and, or operations right subtree must exist)
    return '(' + this.left.toString() + ' ' + this.operator.toString() + ' ' + this.right.toString() + ')'
  }
}
