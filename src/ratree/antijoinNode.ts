import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation}  from "../relation/relation";
import {Row}  from "../relation/row";
import {language} from "../language/language";

/**
 * Types of antijoin node: left, right.
 * @public
 */
export enum AntijoinType {
    left = "\u22b3",
    right = "\u22b2"
}

/**
 * Antijoin node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @public
 */
export class AntijoinNode extends BinaryNode {

    private readonly type: AntijoinType;

    /**
     * Creates a new AntijoinNode.
     *
     * @param operator type of antijoin {@type AntijoinType}
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @public
     */
    public constructor(operator: AntijoinType, leftSubtree: RATreeNode, rightSubtree: RATreeNode) {
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
        let rowsToKeep: Row[];   // rows from the subtree, which have to be kept in result
        let rowsToHelp: Row[];
        // change of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + this.type + rightSource.getName() + ")");
        if (this.type === AntijoinType.left) {
            leftSource.forEachColumn((type, name) => result.addColumn(name, type));
            rowsToKeep = leftSource.getRows();
            rowsToHelp = rightSource.getRows();
        }
        else {
            rightSource.forEachColumn((type, name) => result.addColumn(name, type));
            rowsToKeep = rightSource.getRows();
            rowsToHelp = leftSource.getRows();
        }
        // join of relation rows
        rowsToKeep.forEach(keptRow => {
            let someMatch: boolean = rowsToHelp.some(helpRow => {
                // if all common columns match, the row should not be added
                return commonColumns.every(c => keptRow.getValue(c) === helpRow.getValue(c));
            });
            if (!someMatch) {
                let newRow: Row = new Row(result.getColumns());
                keptRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                result.addRow(newRow);
            }
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
     * Returned schema: left/right source schema (for left/right antijoin)
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        const type = this.type === AntijoinType.left ? "left" : "right";
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
        return this.type === AntijoinType.left ? lang.leftAntijoin : lang.rightAntijoin;
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return this.type;
    }
}