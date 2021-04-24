import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";

/**
 * Cartesian product node of the relational algebra syntactic tree.
 */
export default class CartesianProductNode extends BinaryNode {

    public constructor(leftSubtree: RATreeNode, rightSubtree: RATreeNode, private stringRange: { start: number, end: number } | undefined) {
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
                throw ErrorFactory.semanticError(language().semanticErrors.binaryNode_commonColumns,
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
    public fakeEval(cursorIndex: number) {
        // evaluates the subtrees
        const left = this.leftSubtree.fakeEval(cursorIndex);
        const right = this.rightSubtree.fakeEval(cursorIndex);
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
            left.errors.push(ErrorFactory.semanticError(language().semanticErrors.binaryNode_commonColumns,
                this.stringRange, "cartesian product", commonColumns.join('", "')));
        }
        return {
            result,
            whispers: left.whispers.length !== 0 ? left.whispers : right.whispers,
            errors: left.errors
        };
    }

    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

    public getOperationName(): string {
        return language().operations.cartesianProduct;
    }

    public getOperationSymbol(): string {
        return "⨯";
    }
}