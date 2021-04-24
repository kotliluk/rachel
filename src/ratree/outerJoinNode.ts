import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import {language} from "../language/language";

/**
 * Types of outer join node.
 */
export enum OuterJoinType {
    left = "*L*",
    right = "*R*",
    full = "*F*"
}

/**
 * Outer join node of the relational algebra syntactic tree.
 */
export default class OuterJoinNode extends BinaryNode {

    private readonly type: OuterJoinType;

    public constructor(operator: OuterJoinType, leftSubtree: RATreeNode, rightSubtree: RATreeNode) {
        super(leftSubtree, rightSubtree);
        this.type = operator;
    }

    /**
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
     * Strict expectations: none
     * Returned schema: union of source schemas (in all cases - full/left/right)
     */
    public fakeEval(cursorIndex: number) {
        return this.fakeEvalBinary(cursorIndex, "union");
    }

    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

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

    public getOperationSymbol(): string {
        return this.type;
    }
}