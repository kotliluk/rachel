import { Row } from '../relation/row'
import { VEResult, VETreeNode } from './veTreeNode'
import { ErrorFactory } from '../error/errorFactory'
import { IndexedString } from '../types/indexedString'
import { language } from '../language/language'

/**
 * Enum of types of ComparingOperator class.
 * @enum {number}
 * @category VETree
 * @public
 */
export enum ComparingOperatorType {
  equal,
  nonEqual,
  less,
  more,
  lessOrEqual,
  moreOrEqual
}

/**
 * Comparing operator compares two values and returns boolean.
 * @extends VETreeNode
 * @category VETree
 * @public
 */
export class ComparingOperator extends VETreeNode {

  /**
     * Creates new ComparingOperator instance of equality type (type = ComparingOperatorType.equal).
     *
     * @param operator used string representation of equality operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @return new ComparingOperator instance of equality type {@type ComparingOperator}
     * @public
     */
  static equal (operator: IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
    return new ComparingOperator(ComparingOperatorType.equal, operator, left, right)
  }

  /**
     * Creates new ComparingOperator instance of non-equality type (type = ComparingOperatorType.nonEqual).
     *
     * @param operator used string representation of non-equality operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @return new ComparingOperator instance of non-equality type {@type ComparingOperator}
     * @public
     */
  static nonEqual (operator: IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
    return new ComparingOperator(ComparingOperatorType.nonEqual, operator, left, right)
  }

  /**
     * Creates new ComparingOperator instance of less type (type = ComparingOperatorType.less).
     *
     * @param operator used string representation of less operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @return new ComparingOperator instance of less type {@type ComparingOperator}
     * @public
     */
  static less (operator: IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
    return new ComparingOperator(ComparingOperatorType.less, operator, left, right)
  }

  /**
     * Creates new ComparingOperator instance of more type (type = ComparingOperatorType.more).
     *
     * @param operator used string representation of more operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @return new ComparingOperator instance of more type {@type ComparingOperator}
     * @public
     */
  static more (operator: IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
    return new ComparingOperator(ComparingOperatorType.more, operator, left, right)
  }

  /**
     * Creates new ComparingOperator instance of less-or-equal type (type = ComparingOperatorType.lessOrEqual).
     *
     * @param operator used string representation of less-or-equal operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @return new ComparingOperator instance of less-or-equal type {@type ComparingOperator}
     * @public
     */
  static lessOrEqual (operator: IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
    return new ComparingOperator(ComparingOperatorType.lessOrEqual, operator, left, right)
  }

  /**
     * Creates new ComparingOperator instance of more-or-equal type (type = ComparingOperatorType.moreOrEqual).
     *
     * @param operator used string representation of more-or-equal operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @return new ComparingOperator instance of more-or-equal type {@type ComparingOperator}
     * @public
     */
  static moreOrEqual (operator: IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
    return new ComparingOperator(ComparingOperatorType.moreOrEqual, operator, left, right)
  }

  /**
     * Creates new ComparingOperator of the given type.
     *
     * @param type ComparingOperator type {@type ComparingOperatorType}
     * @param operator used string representation of the operator {@type IndexedString}
     * @param left left subtree producing a value {@type VETreeNode}
     * @param right right subtree producing a value {@type VETreeNode}
     * @public
     */
  constructor (private readonly type: ComparingOperatorType, private readonly operator: IndexedString,
                       private readonly left: VETreeNode, private readonly right: VETreeNode) {
    super()
  }

  /**
     * Evaluate the node and its subtrees and compares their value results to produce a boolean value. It needs to
     * receive results of the same type from its subtrees.
     * NOTE: If one of the subtree results is null, only equality and non-equality are valid. Other comparing
     * operations returns always false.
     *
     * @param source row with actual values of columns recursively passed to leaf reference nodes {@type Row}
     * @return boolean comparing left and right subtree values {@type VEResult}
     * @public
     */
  eval (source: Row): VEResult {
    const leftResult: VEResult = this.left.eval(source)
    const rightResult: VEResult = this.right.eval(source)

    if (leftResult.type !== 'null' && rightResult.type !== 'null' && leftResult.type !== rightResult.type) {
      throw ErrorFactory.syntaxError(language().syntaxErrors.comparingOperator_differentInputTypes,
                this.operator.getRange(), this.operator.toString(), leftResult.type, rightResult.type)
    }

    // if both values are null but both types are not null, returns false
    if (leftResult.value === null && rightResult.value === null && leftResult.type !== 'null' && rightResult.type !== 'null') {
      return { value: false, type: 'boolean' }
    }
    if (this.type === ComparingOperatorType.equal) {
      return { value: leftResult.value === rightResult.value, type: 'boolean' }
    }
    if (this.type === ComparingOperatorType.nonEqual) {
      // if any value of non-null type is null, returns false
      if ((leftResult.value === null && leftResult.type !== 'null') || (rightResult.value === null && rightResult.type !== 'null')) {
        return { value: false, type: 'boolean' }
      }
      return { value: leftResult.value !== rightResult.value, type: 'boolean' }
    }
    if (this.type === ComparingOperatorType.less) {
      if (leftResult.value === null || rightResult.value === null) {
        return { value: false, type: 'boolean' }
      }
      return { value: leftResult.value < rightResult.value, type: 'boolean' }
    }
    if (this.type === ComparingOperatorType.more) {
      if (leftResult.value === null || rightResult.value === null) {
        return { value: false, type: 'boolean' }
      }
      return { value: leftResult.value > rightResult.value, type: 'boolean' }
    }
    if (this.type === ComparingOperatorType.lessOrEqual) {
      if (leftResult.value === null || rightResult.value === null) {
        return { value: false, type: 'boolean' }
      }
      return { value: leftResult.value <= rightResult.value, type: 'boolean' }
    }
    // if (this.type === ComparingOperatorType.moreOrEqual)
    if (leftResult.value === null || rightResult.value === null) {
      return { value: false, type: 'boolean' }
    }
    return { value: leftResult.value >= rightResult.value, type: 'boolean' }
  }

  /**
     * Returns string representation of the node.
     *
     * @return string representation of the node {@type string}
     * @public
     */
  toString (): string {
    return '(' + this.left.toString() + ' ' + this.operator.toString() + ' ' + this.right.toString() + ')'
  }
}
