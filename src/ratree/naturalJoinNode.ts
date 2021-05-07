import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation} from "../relation/relation";
import {Row} from "../relation/row";
import {language} from "../language/language";

/**
 * Enum of types of natural join node: natural, left semi, right semi.
 * @enum {string}
 * @category RATree
 * @public
 */
export enum NaturalJoinType {
    natural = "*",
    leftSemi = "<*",
    rightSemi = "*>"
}

/**
 * Natural join or semi join node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @category RATree
 * @public
 */
export class NaturalJoinNode extends BinaryNode {

    private readonly type: NaturalJoinType;

    /**
     * Creates a new NaturalJoinNode.
     *
     * @param operator type of natural join {@type NaturalJoinNode}
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @public
     */
    public constructor(operator: NaturalJoinType, leftSubtree: RATreeNode, rightSubtree: RATreeNode) {
        super(leftSubtree, rightSubtree);
        this.type = operator;
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * Expectations on source schemas: none
     * @public
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();
        // intersection of columns in left and right subtree
        const commonColumns: string[] = leftSource.getColumnNames().filter(lc => rightSource.hasColumn(lc));
        // change of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + this.type + rightSource.getName() + ")");
        if (this.type === NaturalJoinType.leftSemi || this.type === NaturalJoinType.natural) {
            leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        }
        if (this.type === NaturalJoinType.rightSemi || this.type === NaturalJoinType.natural) {
            rightSource.forEachColumn((type, name) => result.addColumn(name, type));
        }
        // join of relation rows
        leftSource.getRows().forEach(leftRow => {
            rightSource.getRows().forEach(rightRow => {
                // if all common columns have the same value
                if ([...commonColumns].every(c => leftRow.getValue(c) === rightRow.getValue(c))) {
                    let newRow: Row = new Row(result.getColumns());
                    if (this.type === NaturalJoinType.leftSemi || this.type === NaturalJoinType.natural) {
                        leftRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    }
                    if (this.type === NaturalJoinType.rightSemi || this.type === NaturalJoinType.natural) {
                        rightRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    }
                    result.addRow(newRow);
                }
            });
        });
        this.resultRelation = result;
    }
    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: none
     * Returned schema: left/right/both source schema (for left-semijoin/right-semijoin/natural join)
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        let type: "union" | "left" | "right" = "union";
        if (this.type === NaturalJoinType.leftSemi) {
            type = "left";
        }
        else if (this.type === NaturalJoinType.rightSemi) {
            type = "right";
        }
        return this.fakeEvalBinary(cursorIndex, type);
    }

    /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line {@type string}
     * @public
     */
    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

    /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationName(): string {
        const lang = language().operations;
        if (this.type === NaturalJoinType.leftSemi) {
            return lang.leftSemiJoin;
        }
        else if (this.type === NaturalJoinType.rightSemi) {
            return lang.rightSemiJoin;
        }
        else {
            return lang.naturalJoin;
        }
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return "*";
    }

    /**
     * Returns type of the NaturalJoinNode.
     *
     * @return type of the node {@type NaturalJoinType}
     * @public
     */
    public getType(): NaturalJoinType {
        return this.type;
    }
}