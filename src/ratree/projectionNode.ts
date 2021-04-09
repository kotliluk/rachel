import UnaryNode from "./unaryNode";
import RATreeNode from "./raTreeNode";
import StringUtils from "../utils/stringUtils";
import Relation from "../relation/relation";
import Row from "../relation/row";
import {IndexedString} from "../types/indexedString";
import {ErrorFactory, SemanticErrorCodes, SyntaxErrorCodes} from "../error/errorFactory";
import ErrorWithTextRange from "../error/errorWithTextRange";
import {isForbiddenColumnName} from "../utils/keywords";
import IndexedStringUtils from "../utils/indexedStringUtils";
import {getRange, isEmpty} from "../utils/commonStringUtils";

/**
 * Projection node of the relational algebra syntactic tree.
 */
export default class ProjectionNode extends UnaryNode {

    private readonly projection: string | IndexedString;
    private readonly stringRange: { start: number, end: number } | undefined;

    /**
     * Expects the projection string to start with '[' and end with ']'.
     *
     * @param projection
     * @param subtree
     */
    constructor(projection: string | IndexedString, subtree: RATreeNode) {
        super(subtree);
        this.projection = projection;
        this.stringRange = getRange(projection);
    }

    /**
     * Parses projection string to set of projected columns.
     * If doThrow is true, throws found errors. Otherwise, adds found errors to given errors array.
     */
    private parseProjection(doThrow: boolean, errors: ErrorWithTextRange[] = []): Set<string | IndexedString> {
        const ret: Set<string | IndexedString> = new Set<string>();
        const indexed: boolean = this.projection instanceof IndexedString
        // @ts-ignore
        let str: string | IndexedString = this.projection.slice(1, -1);
        let parts: (string | IndexedString)[] = str.split(",");
        parts.forEach(part => {
            part = part.trim();
            // @ts-ignore
            const isName = indexed ? IndexedStringUtils.isName(part) : StringUtils.isName(part);
            if (isName && !isForbiddenColumnName(part)) {
                ret.add(part);
            }
            else {
                let range = getRange(part);
                if (isEmpty(part) && this.stringRange !== undefined) {
                    range = {start: this.stringRange.start, end: this.stringRange.start};
                }
                const error = ErrorFactory.syntaxError(SyntaxErrorCodes.projectionNode_parseProjection_invalidProjectedColumnName,
                    range, part.toString());
                if (doThrow) {
                    throw error;
                }
                else {
                    errors.push(error);
                }
            }
        });
        return ret;
    }

    /**
     * Expectations: projected names are subset of source schema
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const source: Relation = this.subtree.getResult();
        const projected: string[] = [...this.parseProjection(true)].map(value => value.toString());
        // checks if projected columns really exist in source relation
        projected.forEach(name => {
            if (!source.hasColumn(name.toString())) {
                throw ErrorFactory.semanticError(SemanticErrorCodes.projectionNode_eval_absentColumn,
                    getRange(name), name.toString());
            }
        });

        const result: Relation = new Relation(source.getName() + "[...]");
        // projection of relational schema
        source.forEachColumn((type, name) => {
            if (projected.indexOf(name) > -1) {
                result.addColumn(name, type);
            }
        });
        // projection of relation rows
        source.getRows().forEach(row => {
             let newRow: Row = new Row(result.getColumns());
             row.getValues().forEach((value, name) => {
                 if (projected.indexOf(name) > -1) {
                     newRow.addValue(name, value);
                 }
             });
             result.addRow(newRow);
        });
        this.resultRelation = result;
    }

    /**
     * Strict expectations: projected names are subset of source schema
     * Returned schema: intersection of projected names and source schema
     * Second possible approach would be to return all projected names - less strict.
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        let source: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.subtree.fakeEval(cursorIndex);
        // checks whether the cursor is in this projection block - saves current available columns
        let whispers = source.whispers;
        if (this.stringRange !== undefined && this.stringRange.start < cursorIndex && cursorIndex <= this.stringRange.end) {
            whispers = source.result.getColumnNames();
        }
        // adds errors from current expression
        const errors = source.errors;
        const projected: Set<string | IndexedString> = this.parseProjection(false, errors);
        // creates relational schema - "projected columns"
        const result: Relation = new Relation(source.result.name + "[...]");
        // adds only projected, which exist in source
        const absent: (string | IndexedString)[] = [];
        projected.forEach(name => {
            const strName = name.toString();
            if (source.result.hasColumn(strName)) {
                // @ts-ignore - strName must be in the source now
                result.addColumn(strName, source.result.getColumns().get(strName));
            }
            else {
                absent.push(name);
            }
        });
        absent.forEach(column => {
            errors.push(ErrorFactory.semanticError(SemanticErrorCodes.projectionNode_eval_absentColumn,
                getRange(column), column.toString()));
        });
        return {result, whispers, errors};
    }

    printInLine(): string {
        return this.subtree.printInLine() + this.getOperationSymbol();
    }

    public getOperationName(): string {
        return "Projection";
    }

    public getOperationSymbol(): string {
        return this.projection.replace(/\s+/g, ' ');
    }
}