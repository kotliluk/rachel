import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Types of antijoin node.
 */
export enum AntijoinType {
    left = "\u22b3",
    right = "\u22b2"
}

/**
 * Antijoin node of the relational algebra syntactic tree.
 */
export default class AntijoinNode extends BinaryNode {

    private readonly type: AntijoinType;

    public constructor(operator: AntijoinType, leftSubtree: RATreeNode, rightSubtree: RATreeNode) {
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
     * Strict expectations: none
     * Returned schema: left/right source schema (for left/right antijoin)
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        const type = this.type === AntijoinType.left ? "left" : "right";
        return this.fakeEvalBinary(cursorIndex, type);
    }

    public printInLine(): string {
        return this.getOperationName() + " of {" + this.leftSubtree.printInLine() + "} and {" + this.rightSubtree.printInLine() + "}";
    }

    public getOperationName(): string {
        return this.type === AntijoinType.left ? "Left antijoin" : "Right antijoin";
    }
}