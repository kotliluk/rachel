import { RATreeNode } from './raTreeNode'

/**
 * Classes extending unary node.
 * @category RATree
 * @public
 */
export type UnaryNodeClass = 'rename' | 'projection' | 'selection'

/**
 * Abstract node of the relational algebra syntactic tree with one subtree.
 * @extends RATreeNode
 * @category RATree
 * @public
 */
export abstract class UnaryNode extends RATreeNode {

  protected subtree: RATreeNode

  /**
     * Creates a new UnaryNode.
     *
     * @param subtree subtree of the node {@type RATreeNode}
     * @public
     */
  protected constructor (subtree: RATreeNode) {
    super()
    this.subtree = subtree
  }

  /**
     * Returns subtree of the unary node.
     *
     * @return subtree of the unary node {@type RATreeNode}
     * @public
     */
  getSubtree (): RATreeNode {
    return this.subtree
  }
}
