import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import {ErrorFactory, SemanticErrorCodes} from "../error/errorFactory";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Cartesian product node of the relational algebra syntactic tree.
 */
export default class CartesianProductNode extends BinaryNode {

    public constructor(leftSubtree: RATreeNode, rightSubtree: RATreeNode, private stringRange?: { start: number, end: number }) {
        super(leftSubtree, rightSubtree);
    }

    /**
     * Expectations on source schemas: disjointness
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();
        // join of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + "\u2a2f" + rightSource.getName() + ")");
        leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        rightSource.forEachColumn((type, name) => {
            if (!result.addColumn(name, type)) {
                throw ErrorFactory.semanticError(SemanticErrorCodes.binaryNode_eval_commonColumnsInSources,
                    this.stringRange, "cartesian product", name);
            }
        });
        // join of relation rows
        leftSource.getRows().forEach(leftRow => {
            rightSource.getRows().forEach(rightRow => {
                let newRow: Row = new Row(result.getColumns());
                leftRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                rightRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                result.addRow(newRow);
            });
        });
        this.resultRelation = result;
    }

    /**
     * Strict expectations: disjointness
     * Returned schema: union of source schemas
     * Returned fake schema is not affected when disjointness is not held
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]}{
        // evaluates the subtrees
        const left: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.leftSubtree.fakeEval(cursorIndex);
        const right: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.rightSubtree.fakeEval(cursorIndex);
        // creates return relation
        const result: Relation = new Relation("");
        left.result.forEachColumn((type, name) => result.addColumn(name, type));
        right.result.forEachColumn((type, name) => result.addColumn(name, type));
        // checks errors
        left.errors.push(...right.errors);
        const commonColumns: string[] = [];
        left.result.getColumnNames().forEach(leftColumn => {
            if (right.result.hasColumn(leftColumn)) {
                commonColumns.push(leftColumn);
            }
        });
        if (commonColumns.length > 0) {
            left.errors.push(ErrorFactory.semanticError(SemanticErrorCodes.binaryNode_eval_commonColumnsInSources,
                this.stringRange, "cartesian product", commonColumns.join('", "')));
        }
        return {result, whispers: left.whispers.length !== 0 ? left.whispers : right.whispers, errors: left.errors};
    }

    public printInLine(): string {
        return "Cartesian product of {" + this.leftSubtree.printInLine() + "} and {" + this.rightSubtree.printInLine() + "}";
    }

    public getOperationName(): string {
        return "Cartesian product";
    }
}