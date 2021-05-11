import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation} from "../relation/relation";
import {Row} from "../relation/row";
import {SupportedColumnType} from "../relation/columnType";
import {VEResult, VETreeNode} from "../vetree/veTreeNode";
import {IndexedString} from "../types/indexedString";
import {ValueParser} from "../expression/valueParser";
import {ErrorFactory} from "../error/errorFactory";
import {insertRangeIfUndefined} from "../error/errorWithTextRange";
import {isInRangeAndNotInQuotes} from "./raTreeTools";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Enum of types of theta join node: full (theta), left (theta semi), right (theta semi).
 * @enum {string}
 * @category RATree
 * @public
 */
export enum ThetaJoinType {
    full = "[]",
    left = "<]",
    right = "[>"
}

/**
 * Theta join or theta semijoin node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @category RATree
 * @public
 */
export class ThetaJoinNode extends BinaryNode {

    private readonly type: ThetaJoinType;
    private readonly condition: IndexedString;
    private readonly stringRange: StartEndPair | undefined;
    private readonly nullValuesSupport: boolean;

    /**
     * Creates a new NaturalJoinNode.
     * Expects the condition string to start with '<' and end with ']' or start with '[' and end with '>'.
     *
     * @param type type of natural join {@type ThetaJoinType}
     * @param condition logic-algebraic condition {@type IndexedString}
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @param nullValuesSupport whether null values are supported
     * @public
     */
    public constructor(type: ThetaJoinType, condition: IndexedString,
                       leftSubtree: RATreeNode, rightSubtree: RATreeNode, nullValuesSupport: boolean) {
        super(leftSubtree, rightSubtree);
        this.condition = condition;
        this.stringRange = condition.getRange();
        this.nullValuesSupport = nullValuesSupport;
        this.type = type;
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * Expectations on source schemas: disjointness
     * Other expectations: condition is valid expression which evaluates to boolean
     * @public
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }

        let boolExpr: VETreeNode;
        try {
            boolExpr = ValueParser.parse(this.condition.slice(1, -1), this.nullValuesSupport);   // slices brackets out
        }
        catch (e) {
            throw insertRangeIfUndefined(e, this.stringRange);
        }

        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();

        leftSource.getColumnNames().forEach(leftColumn => {
            if (rightSource.hasColumn(leftColumn)) {
                throw ErrorFactory.semanticError(language().semanticErrors.binaryNode_commonColumns, this.stringRange,
                    this.getOperationName().toLowerCase(), leftColumn);
            }
        });
        // change of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + this.type.charAt(0) + "..." + this.type.charAt(1) + rightSource.getName() + ")");
        if (this.type === ThetaJoinType.left || this.type === ThetaJoinType.full) {
            leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        }
        if (this.type === ThetaJoinType.right || this.type === ThetaJoinType.full) {
            rightSource.forEachColumn((type, name) => result.addColumn(name, type));
        }
        // combine columns of both source relations to use it in testing row
        const bothSourceColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>(leftSource.getColumns());
        rightSource.forEachColumn((type, name) => bothSourceColumns.set(name, type));

        leftSource.getRows().forEach(leftRow => {
            rightSource.getRows().forEach(rightRow => {
                const testRow: Row = new Row(bothSourceColumns);
                leftRow.getValues().forEach((value, name) => testRow.addValue(name, value));
                rightRow.getValues().forEach((value, name) => testRow.addValue(name, value));
                // checks whether the combined row from both relation columns satisfies the condition
                let booleanResult: VEResult = boolExpr.eval(testRow);
                if (booleanResult.type !== "boolean") {
                    throw ErrorFactory.syntaxError(language().syntaxErrors.thetaJoinNode_resultNotBoolean,
                        this.stringRange, this.condition.replace(/\s+/g, " "), booleanResult.type);
                }
                if (booleanResult.value) {
                    const newRow: Row = new Row(result.getColumns());
                    if (this.type === ThetaJoinType.left || this.type === ThetaJoinType.full) {
                        leftRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    }
                    if (this.type === ThetaJoinType.right || this.type === ThetaJoinType.full) {
                        rightRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                    }
                    result.addRow(newRow);
                }
            });
        });
        this.resultRelation = result;
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: disjointness
     * Returned schema: left/right/both source schema (for left/right/full semijoin)
     * Returned fake schema is not affected when disjointness is not held
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        const left = this.leftSubtree.fakeEval(cursorIndex);
        const right = this.rightSubtree.fakeEval(cursorIndex);
        const sourceColumns: string[] = [];
        sourceColumns.push(...left.result.getColumnNames());
        sourceColumns.push(...right.result.getColumnNames());
        // creates return relation
        const result: Relation = new Relation(this.type);
        if (this.type === ThetaJoinType.left || this.type === ThetaJoinType.full) {
            left.result.forEachColumn((type, name) => result.addColumn(name, type));
        }
        if (this.type === ThetaJoinType.right || this.type === ThetaJoinType.full) {
            right.result.forEachColumn((type, name) => result.addColumn(name, type));
        }
        // checks whether the cursor is in this condition block (and not in the string) - saves current available columns
        let whispers = left.whispers.length !== 0 ? left.whispers : right.whispers;
        if (isInRangeAndNotInQuotes(cursorIndex, this.stringRange, this.condition)) {
            whispers = sourceColumns;
        }
        // adds errors from current expression
        const errors = left.errors;
        errors.push(...right.errors);
        const commonColumns: string[] = [];
        left.result.getColumnNames().forEach(leftColumn => {
            if (right.result.hasColumn(leftColumn)) {
                commonColumns.push(leftColumn);
            }
        });
        if (commonColumns.length > 0 && this.stringRange !== undefined) {
            errors.push(ErrorFactory.semanticError(language().semanticErrors.binaryNode_commonColumns,
                {start: this.stringRange.start, end: this.stringRange.start},   // highlight only opening bracket
                this.getOperationName().toLowerCase(), commonColumns.join('", "')));
        }
        // checks empty condition input
        if (this.condition.toString().slice(1, -1).trim().length  === 0) {
            errors.push(ErrorFactory.syntaxError(language().syntaxErrors.valueParser_emptyInput, this.stringRange));
        }
        else {
            errors.push(...ValueParser.fakeParse(this.condition.slice(1, -1), this.nullValuesSupport, sourceColumns));
        }
        return {result, whispers, errors};
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
        const lang = language().operations;
        if (this.type === ThetaJoinType.left) {
            return lang.leftThetaSemiJoin;
        }
        else if (this.type === ThetaJoinType.right) {
            return lang.rightThetaSemiJoin;
        }
        else {
            return lang.thetaJoin;
        }
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return this.condition.replace(/\s+/g, ' ');
    }

    /**
     * Returns type of ThetaJoinNode.
     *
     * @return type of the node {@type ThetaJoinType}
     * @public
     */
    public getType(): ThetaJoinType {
        return this.type;
    }
}