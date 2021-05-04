import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation}  from "../relation/relation";
import {Row}  from "../relation/row";
import {SupportedColumnType} from "../relation/columnType";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Division node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @public
 */
export class DivisionNode extends BinaryNode {

    /**
     * Creates a new DivisionNode.
     *
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @param stringRange position of the operator in the original text {@type StartEndPair?}
     * @public
     */
    public constructor(leftSubtree: RATreeNode, rightSubtree: RATreeNode, private stringRange: StartEndPair | undefined) {
        super(leftSubtree, rightSubtree);
    }

    /**
     * Evaluates the RA query in this node and its subtree.
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
            throw ErrorFactory.semanticError(language().semanticErrors.divisionNode_rightColumnsNotSubset,
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
            throw ErrorFactory.semanticError(language().semanticErrors.divisionNode_rightColumnsNotProperSubset,
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
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: right source schema is a proper subset of left source schema
     * Returned schema: left source schema minus right source schema
     * Returned fake schema may be empty (right source schema may contain all left source columns).
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        const left = this.leftSubtree.fakeEval(cursorIndex);
        const right = this.rightSubtree.fakeEval(cursorIndex);
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
            errors.push(ErrorFactory.semanticError(language().semanticErrors.divisionNode_rightColumnsNotSubset,
                this.stringRange, right.result.getSchemaString(), left.result.getSchemaString()));
        }
        else if (resultColumns.size === 0 && left.result.getName() !== "") {
            errors.push(ErrorFactory.semanticError(language().semanticErrors.divisionNode_rightColumnsNotProperSubset,
                this.stringRange, right.result.getNamesSchemaString(), left.result.getNamesSchemaString()));
        }
        return {
            result,
            whispers: left.whispers.length !== 0 ? left.whispers : right.whispers,
            errors: left.errors
        };
    }

    /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line {@type string}
     * @public
     */
    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

    /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationName(): string {
        return language().operations.division;
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return "÷";
    }
}