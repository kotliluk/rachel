import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation} from "../relation/relation";
import {Row} from "../relation/row";
import {language} from "../language/language";

/**
 * Enum of types of outer join node: full, left, right.
 * @enum {string}
 * @public
 */
export enum OuterJoinType {
    left = "*L*",
    right = "*R*",
    full = "*F*"
}

/**
 * Outer join node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @public
 */
export class OuterJoinNode extends BinaryNode {

    private readonly type: OuterJoinType;

    /**
     * Creates a new OuterJoinNode.
     *
     * @param operator type of outer join {@type OuterJoinType}
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @public
     */
    public constructor(operator: OuterJoinType, leftSubtree: RATreeNode, rightSubtree: RATreeNode) {
        super(leftSubtree, rightSubtree);
        this.type = operator;
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * Expectations on source schemas: none
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();
        // change of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + this.type + rightSource.getName() + ")");
        leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        rightSource.forEachColumn((type, name) => result.addColumn(name, type));
        // join of relation rows
        const leftRows: Row[] = leftSource.getRows();
        const rightRows: Row[] = rightSource.getRows();
        // intersection of columns in left and right subtree
        const commonColumns: string[] = leftSource.getColumnNames().filter(lc => rightSource.hasColumn(lc));
        // adds naturally joined rows
        leftRows.forEach(leftRow => {
            rightRows.forEach(rightRow => {
                // if all common columns have the same value
                if (commonColumns.every(c => leftRow.getValue(c) === rightRow.getValue(c))) {
                    let newRow: Row = new Row(result.getColumns());
                    leftRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    rightRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    result.addRow(newRow);
                }
            });
        });
        // adds left source rows with right null values
        if (this.type === OuterJoinType.left || this.type === OuterJoinType.full) {
            leftRows.forEach(leftRow => {
                let someMatch: boolean = rightRows.some(rightRow => {
                    // if all common columns match, the row should not be added
                    return commonColumns.every(c => leftRow.getValue(c) === rightRow.getValue(c));
                });
                if (!someMatch) {
                    let newRow: Row = new Row(result.getColumns());
                    leftRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    result.addRow(newRow);
                }
            });
        }
        // adds right source rows with left null values
        if (this.type === OuterJoinType.right || this.type === OuterJoinType.full) {
            rightRows.forEach(rightRow => {
                let someMatch: boolean = leftRows.some(leftRow => {
                    // if all common columns match, the row should not be added
                    return commonColumns.every(c => leftRow.getValue(c) === rightRow.getValue(c));
                });
                if (!someMatch) {
                    let newRow: Row = new Row(result.getColumns());
                    rightRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    result.addRow(newRow);
                }
            });
        }
        this.resultRelation = result;
    }
    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: none
     * Returned schema: union of source schemas (in all cases - full/left/right)
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        return this.fakeEvalBinary(cursorIndex, "union");
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
        if (this.type === OuterJoinType.left) {
            return lang.leftOuterJoin;
        }
        else if (this.type === OuterJoinType.right) {
            return lang.rightOuterJoin;
        }
        else {
            return lang.fullOuterJoin;
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
        return this.type;
    }
}