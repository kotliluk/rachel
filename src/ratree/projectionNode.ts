import UnaryNode from "./unaryNode";
import RATreeNode from "./raTreeNode";
import {Relation}  from "../relation/relation";
import {Row}  from "../relation/row";
import {IndexedString} from "../types/indexedString";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Projection node of the relational algebra syntactic tree.
 */
export default class ProjectionNode extends UnaryNode {

    private readonly projection: IndexedString;
    private readonly stringRange: StartEndPair | undefined;

    /**
     * Expects the projection string to start with '[' and end with ']'.
     *
     * @param projection
     * @param subtree
     */
    constructor(projection: IndexedString, subtree: RATreeNode) {
        super(subtree);
        this.projection = projection;
        this.stringRange = projection.getRange();
    }

    /**
     * Parses projection string to set of projected columns.
     * If doThrow is true, throws found errors. Otherwise, adds found errors to given errors array.
     */
    private parseProjection(): Set<IndexedString> {
        const ret: Set<IndexedString> = new Set<IndexedString>();
        // @ts-ignore
        let str: IndexedString = this.projection.slice(1, -1);
        let parts: IndexedString[] = str.split(",");
        parts.forEach(part => ret.add(part.trim()));
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
        const projectedIndexed: IndexedString[] = [...this.parseProjection()];
        // checks if projected columns really exist in source relation
        projectedIndexed.forEach(name => {
            if (!source.hasColumn(name.toString())) {
                throw ErrorFactory.semanticError(language().semanticErrors.projectionNode_absentColumn,
                    name.getRange(), name.toString());
            }
        });

        const projected: string[] = projectedIndexed.map(p => p.toString());
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
    public fakeEval(cursorIndex: number) {
        let source = this.subtree.fakeEval(cursorIndex);
        // checks whether the cursor is in this projection block - saves current available columns
        let whispers = source.whispers;
        if (this.stringRange !== undefined && this.stringRange.start < cursorIndex && cursorIndex <= this.stringRange.end) {
            whispers = source.result.getColumnNames();
        }
        // adds errors from current expression
        const errors = source.errors;
        const projected: Set<IndexedString> = this.parseProjection();
        // creates relational schema - "projected columns"
        const result: Relation = new Relation(source.result.name + "[...]");
        // adds only projected, which exist in source
        const absent: IndexedString[] = [];
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
            errors.push(ErrorFactory.semanticError(language().semanticErrors.projectionNode_absentColumn,
                column.getRange(), column.toString()));
        });
        return {result, whispers, errors};
    }

    public printInLine(): string {
        return this.subtree.printInLine() + this.getOperationSymbol();
    }

    public getOperationName(): string {
        return language().operations.projection;
    }

    public getOperationSymbol(): string {
        return this.projection.replace(/\s+/g, ' ');
    }
}