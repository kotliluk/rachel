import {Relation} from "../relation/relation";
import {RATreeNode} from "./raTreeNode";

/**
 * Leave node of the relational algebra syntactic tree with reference to a source relation.
 * @extends RATreeNode
 * @public
 */
export class RelationNode extends RATreeNode {

    /**
     * Creates a new RelationNode.
     *
     * @param relation source relation {@type Relation}
     * @public
     */
    public constructor(relation: Relation) {
        super();
        this.resultRelation = relation;
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * After successful call, this.resultRelation must be set to valid Relation.
     * @public
     */
    public eval(): void {
        // nothing to evaluate
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        // @ts-ignore
        const relation: Relation = this.resultRelation;
        return {result: relation, whispers: [], errors: []};
    }

    /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line {@type string}
     * @public
     */
    public printInLine(): string {
        // @ts-ignore
        return this.resultRelation.getName();
    }

    /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationName(): string {
        // @ts-ignore
        return this.resultRelation.getName();
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return "";
    }
}