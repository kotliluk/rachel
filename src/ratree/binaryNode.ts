import { NodeFakeEvalResult, RATreeNode } from './raTreeNode'
import { Relation } from '../relation/relation'

/**
 * Classes extending binary node.
 * @category RATree
 * @public
 */
export type BinaryNodeClass = 'left antijoin' | 'right antijoin' | 'cartesian product' | 'division' | 'natural join'
| 'left outer join' | 'right outer join' | 'full outer join' | 'left semijoin' | 'right semijoin' | 'union'
| 'intersection' | 'difference' | 'theta join' | 'left theta semijoin' | 'right theta semijoin'

/**
 * Abstract node of the relational algebra syntactic tree with two subtrees.
 * @extends RATreeNode
 * @category RATree
 * @public
 */
export abstract class BinaryNode extends RATreeNode {

  protected leftSubtree: RATreeNode
  protected rightSubtree: RATreeNode

  /**
     * Creates a new BinaryNode.
     *
     * @param left left subtree {@type RATreeNode}
     * @param right right subtree {@type RATreeNode}
     * @public
     */
  protected constructor (left: RATreeNode, right: RATreeNode) {
    super()
    this.leftSubtree = left
    this.rightSubtree = right
  }

  /**
     * Returns left subtree of the binary node.
     * @return left subtree {@type RATreeNode}
     * @public
     */
  getLeftSubtree (): RATreeNode {
    return this.leftSubtree
  }

  /**
     * Returns right subtree of the binary node.
     * @return right subtree {@type RATreeNode}
     * @public
     */
  getRightSubtree (): RATreeNode {
    return this.rightSubtree
  }

  /**
     * Fake evaluates left and right subtrees of the current not-parametrized binary node.
     * Returns new simple faked schema with empty "" name:
     * - type = union: returns union of source schemas
     * - type = left: returns left source schema
     * - type = right: returns right source schema
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @param type type of the returned relational schema {@type ("union" | "left" | "right")}
     * @return fake evaluation information {@type NodeFakeEvalResult}
     * @public
     */
  protected fakeEvalBinary (cursorIndex: number, type: 'union' | 'left' | 'right'): NodeFakeEvalResult {
    // evaluates the subtrees
    const left = this.leftSubtree.fakeEval(cursorIndex)
    const right = this.rightSubtree.fakeEval(cursorIndex)
    // creates return relation
    const result: Relation = new Relation('Binary')
    if (type === 'left' || type === 'union') {
      left.result.forEachColumn((type, name) => result.addColumn(name, type))
    }
    if (type === 'right' || type === 'union') {
      right.result.forEachColumn((type, name) => result.addColumn(name, type))
    }
    left.errors.push(...right.errors)
    return {
      result,
      whispers: left.whispers.length !== 0 ? left.whispers : right.whispers,
      errors: left.errors,
    }
  }
}
