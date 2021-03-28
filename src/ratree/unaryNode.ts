import RATreeNode from "./raTreeNode";

/**
 * Classes extending unary node.
 */
export type UnaryNodeClass = "rename" | "projection" | "selection";

/**
 * Abstract node of the relational algebra syntactic tree with one subtree.
 */
export default abstract class UnaryNode extends RATreeNode {

    protected subtree: RATreeNode;

    protected constructor(subtree: RATreeNode) {
        super();
        this.subtree = subtree;
    }

    public getSubtree(): RATreeNode {
        return this.subtree;
    }
}