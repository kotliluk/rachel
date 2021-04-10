import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import { isEqual } from "lodash";
import {ErrorFactory, SemanticErrorCodes} from "../error/errorFactory";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Types of set operation node.
 */
export enum SetOperationType {
    union = "\u222a",
    intersection = "\u2229",
    difference = "\\"
}

/**
 * Set operation node of the relational algebra syntactic tree.
 */
export default class SetOperationNode extends BinaryNode {

    private readonly type: SetOperationType;

    public constructor(operator: SetOperationType, leftSubtree: RATreeNode, rightSubtree: RATreeNode,
                       private stringRange: { start: number, end: number } | undefined) {
        super(leftSubtree, rightSubtree);
        this.type = operator;
    }

    private getTypeStr(): string {
        if (this.type === SetOperationType.union) {
            return "Union";
        }
        else if (this.type === SetOperationType.intersection) {
            return "Intersection";
        }
        else {
            return "Difference";
        }
    }

    /**
     * Expectations on source schemas: equality
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();

        if (!isEqual(leftSource.getColumns(), rightSource.getColumns())) {
            let typeStr: string = this.getTypeStr().toLowerCase();
            throw ErrorFactory.semanticError(SemanticErrorCodes.setOperationNode_eval_notEqualColumnsInSources,
                this.stringRange, leftSource.getSchemaString(), rightSource.getSchemaString(), typeStr);
        }
        // copy of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + this.type + rightSource.getName() + ")");
        leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        // change of relation rows
        let resultRows: Row[];
        const leftRows: Row[] = leftSource.getRows();
        const rightRows: Row[] = rightSource.getRows();
        if (this.type === SetOperationType.union) {
            resultRows = [...leftRows, ...rightRows];
        }
        else if (this.type === SetOperationType.intersection) {
            resultRows = [...leftRows].filter(lr => [...rightRows].some(rr => lr.equals(rr)));
        }
        else /* this.type === SetOperationType.difference */ {
            resultRows = [...leftRows].filter(lr => ![...rightRows].some(rr => lr.equals(rr)));
        }
        resultRows.forEach(row => result.addRow(row));
        this.resultRelation = result;
    }

    /**
     * Strict expectations: equality
     * Returned schema: intersection of source schemas
     * Returned schema may be empty (when there is no common column in sources).
     * Second possible approach would be to return union of source schemas (less strict).
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        const left: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.leftSubtree.fakeEval(cursorIndex);
        const right: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.rightSubtree.fakeEval(cursorIndex);
        // join of relational schema - "left intersection right"
        const result: Relation = new Relation("(" + left.result.getName() + this.type + right.result.getName() + ")");
        left.result.forEachColumn((type, name) => {
            if (right.result.hasColumn(name)) {
                result.addColumn(name, type);
            }
        });
        // checks errors in schema
        const errors = left.errors;
        errors.push(...right.errors);
        if (!isEqual(left.result.getColumns(), right.result.getColumns()) && left.result.getName() !== "" && right.result.getName() !== "") {
            let typeStr: string = this.getTypeStr().toLowerCase();
            errors.push(ErrorFactory.semanticError(SemanticErrorCodes.setOperationNode_eval_notEqualColumnsInSources,
                this.stringRange, left.result.getSchemaString(), right.result.getSchemaString(), typeStr));
        }
        return {result, whispers: left.whispers.length !== 0 ? left.whispers : right.whispers, errors};
    }

    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

    public getOperationName(): string {
        return this.getTypeStr();
    }

    public getOperationSymbol(): string {
        return this.type;
    }
}