import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import Row from "../relation/row";
import {SupportedColumnType} from "../relation/columnType";
import {ErrorFactory, SemanticErrorCodes} from "../error/errorFactory";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Division node of the relational algebra syntactic tree.
 */
export default class DivisionNode extends BinaryNode {

    public constructor(leftSubtree: RATreeNode, rightSubtree: RATreeNode, private stringRange?: { start: number, end: number }) {
        super(leftSubtree, rightSubtree);
    }

    /**
     * Expectations on source schemas: right source schema is a proper subset of left source schema
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();
        const leftColumns: Map<string, SupportedColumnType> = leftSource.getColumns();
        const rightColumns: Map<string, SupportedColumnType> = rightSource.getColumns();

        if (![...rightColumns].every(value => leftColumns.has(value[0]) && leftColumns.get(value[0]) === value[1])) {
            throw ErrorFactory.semanticError(SemanticErrorCodes.divisionNode_eval_rightColumnsNotSubsetOfLeft,
                this.stringRange, rightSource.getSchemaString(), leftSource.getSchemaString());
        }

        // difference of columns in left and right subtree
        const resultColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>();
        leftColumns.forEach((type, name) => {
           if (!rightColumns.has(name)) {
               resultColumns.set(name, type);
           }
        });

        if (resultColumns.size === 0) {
            throw ErrorFactory.semanticError(SemanticErrorCodes.divisionNode_eval_rightColumnsNotProperSubsetOfLeft,
                this.stringRange, rightSource.getNamesSchemaString(), leftSource.getNamesSchemaString());
        }

        // join of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + "\u00f7" + rightSource.getName() + ")");
        resultColumns.forEach((type, name) => result.addColumn(name, type));
        // filter relation rows
        const leftRows: Row[] = leftSource.getRows();
        const rightRows: Row[] = rightSource.getRows();
        leftRows.forEach(leftRow => {
           if (rightRows.every(rightRow => {
               // creates a row with left row's extra columns and right row's common columns
               let testRow: Row = new Row(leftColumns);
               // left row's extra columns
               // @ts-ignore ('name' must be present in left row)
               resultColumns.forEach((type, name) => testRow.addValue(name, leftRow.getValue(name)));
               // right row's common columns
               rightRow.getValues().forEach((type, name) => testRow.addValue(name, type));
               // tests if the created row exists in left relation
               return [...leftRows].some(lr => lr.equals(testRow));
           })) {
               let newRow: Row = new Row(result.getColumns());
               // @ts-ignore ('name' must be present in left row)
               resultColumns.forEach((value, name) => newRow.addValue(name, leftRow.getValue(name)));
               result.addRow(newRow);
           }
        });
        this.resultRelation = result;
    }

    /**
     * Strict expectations: right source schema is a proper subset of left source schema
     * Returned schema: left source schema minus right source schema
     * Returned fake schema may be empty (right source schema may contain all left source columns).
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        const left: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.leftSubtree.fakeEval(cursorIndex);
        const right: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.rightSubtree.fakeEval(cursorIndex);
        const leftColumns = left.result.getColumns();
        const rightColumns = right.result.getColumns();
        // creates relation schema - "left columns minus right columns"
        const resultColumns = new Map([...leftColumns.entries()].filter(([key, _]) => !rightColumns.has(key)));
        const result = new Relation("(" + left.result.getName() + "\u00f7" + right.result.getName() + ")");
        resultColumns.forEach((type, name) => result.addColumn(name, type));
        // checks errors in schema
        const errors = left.errors;
        errors.push(...right.errors);
        if (![...rightColumns].every(value => leftColumns.has(value[0]) && leftColumns.get(value[0]) === value[1])
            && left.result.getName() !== "") {
            errors.push(ErrorFactory.semanticError(SemanticErrorCodes.divisionNode_eval_rightColumnsNotSubsetOfLeft,
                this.stringRange, right.result.getSchemaString(), left.result.getSchemaString()));
        }
        else if (resultColumns.size === 0 && left.result.getName() !== "") {
            errors.push(ErrorFactory.semanticError(SemanticErrorCodes.divisionNode_eval_rightColumnsNotProperSubsetOfLeft,
                this.stringRange, right.result.getNamesSchemaString(), left.result.getNamesSchemaString()));
        }
        return {result, whispers: left.whispers.length !== 0 ? left.whispers : right.whispers, errors};
    }

    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

    public getOperationName(): string {
        return "Division";
    }

    public getOperationSymbol(): string {
        return "÷";
    }
}