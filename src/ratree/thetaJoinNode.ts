import BinaryNode from "./binaryNode";
import RATreeNode from "./raTreeNode";
import {Relation}  from "../relation/relation";
import {Row}  from "../relation/row";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";
import {VETreeNode} from "../vetree/veTreeNode";
import {IndexedString} from "../types/indexedString";
import {ValueParser} from "../expression/valueParser";
import {ErrorFactory} from "../error/errorFactory";
import {insertRangeIfUndefined} from "../error/errorWithTextRange";
import {isInRangeAndNotInQuotes} from "./raTreeTools";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Types of theta join node.
 */
export enum ThetaJoinType {
    full = "[]",
    left = "<]",
    right = "[>"
}

/**
 * Theta join or theta semijoin node of the relational algebra syntactic tree.
 */
export default class ThetaJoinNode extends BinaryNode {

    private readonly type: ThetaJoinType;
    private readonly condition: IndexedString;
    private readonly stringRange: StartEndPair | undefined;
    private readonly nullValuesSupport: boolean;

    /**
     * Expects the condition string to start with '<' and end with ']' or start with '[' and end with '>'.
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
     * Expectations on source schemas: disjointness
     * Other expectations: condition is valid expression which evaluates to boolean
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
                // checks whether the combined row from both relations' columns satisfies the condition
                let booleanResult: { value: ColumnContent, type: SupportedColumnType | "null" } = boolExpr.eval(testRow);
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
     * Strict expectations: disjointness
     * Returned schema: left/right/both source schema (for left/right/full semijoin)
     * Returned fake schema is not affected when disjointness is not held
     */
    public fakeEval(cursorIndex: number) {
        const left = this.leftSubtree.fakeEval(cursorIndex);
        const right = this.rightSubtree.fakeEval(cursorIndex);
        const sourceColumns: string[] = [];
        sourceColumns.push(...left.result.getColumnNames());
        sourceColumns.push(...right.result.getColumnNames());
        // creates return relation
        const result: Relation = new Relation("");
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

    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

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

    public getOperationSymbol(): string {
        return this.condition.replace(/\s+/g, ' ');
    }

    public getType(): ThetaJoinType {
        return this.type;
    }
}