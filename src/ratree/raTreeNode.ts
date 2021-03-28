import Relation from "../relation/relation";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Abstract general node of the relational algebra syntactic tree.
 */
export default abstract class RATreeNode {

    protected resultRelation: Relation | undefined;

    protected constructor() {
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * After successful call, this.resultRelation must be set to valid Relation.
     */
    public abstract eval(): void;

    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper
     */
    public abstract fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]};

    /**
     * @return true if this node and its subtree was already evaluated
     */
    public isEvaluated(): boolean {
        return this.resultRelation !== undefined;
    }

    /**
     * Returns the resulting relation. The node and its subtree is evaluated if it was not evaluated before.
     *
     * @return resulting relation gained by evaluating this node and its subtree
     */
    public getResult(): Relation {
        if (this.resultRelation === undefined) {
            this.eval();
        }
        // @ts-ignore
        return this.resultRelation;
    }

    /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line
     */
    public abstract printInLine(): string;

    /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node
     */
    public abstract getOperationName(): string;
}