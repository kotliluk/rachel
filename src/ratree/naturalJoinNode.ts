import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Types of natural join node.
 */
export enum NaturalJoinType {
    natural = "*",
    leftSemi = "<*",
    rightSemi = "*>"
}

/**
 * Natural join or semi join node of the relational algebra syntactic tree.
 */
export default class NaturalJoinNode extends BinaryNode {

    private readonly type: NaturalJoinType;

    public constructor(operator: NaturalJoinType, leftSubtree: RATreeNode, rightSubtree: RATreeNode) {
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
     * Strict expectations: none
     * Returned schema: left/right/both source schema (for left-semijoin/right-semijoin/natural join)
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        let type: "union" | "left" | "right" = "union";
        if (this.type === NaturalJoinType.leftSemi) {
            type = "left";
        }
        else if (this.type === NaturalJoinType.rightSemi) {
            type = "right";
        }
        return this.fakeEvalBinary(cursorIndex, type);
    }

    public printInLine(): string {
        return this.getOperationName() + " of {" + this.leftSubtree.printInLine() + "} and {" + this.rightSubtree.printInLine() + "}";
    }

    public getOperationName(): string {
        if (this.type === NaturalJoinType.leftSemi) {
            return "Left semijoin";
        }
        else if (this.type === NaturalJoinType.rightSemi) {
            return "Right semijoin";
        }
        else {
            return "Natural join";
        }
    }

    public getType(): NaturalJoinType {
        return this.type;
    }
}