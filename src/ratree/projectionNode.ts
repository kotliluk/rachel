import {UnaryNode} from "./unaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation} from "../relation/relation";
import {Row} from "../relation/row";
import {IndexedString} from "../types/indexedString";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Projection node of the relational algebra syntactic tree.
 * @extends UnaryNode
 * @category RATree
 * @public
 */
export class ProjectionNode extends UnaryNode {

    private readonly projection: IndexedString;
    private readonly stringRange: StartEndPair | undefined;

    /**
     * Creates a new ProjectionNode.
     * Expects the projection string to start with '[' and end with ']'.
     *
     * @param projection string describing projected columns {@type IndexedString}
     * @param subtree source subtree {@type RATreeNode}
     * @public
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
     * Evaluates the RA query in this node and its subtree.
     * After successful call, this.resultRelation must be set to valid Relation.
     * Expectations: projected names are subset of source schema
     * @public
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
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: projected names are subset of source schema
     * Returned schema: intersection of projected names and source schema
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
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

    /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line {@type string}
     * @public
     */
    public printInLine(): string {
        return this.subtree.printInLine() + this.getOperationSymbol();
    }

    /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationName(): string {
        return language().operations.projection;
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return this.projection.replace(/\s+/g, ' ');
    }
}