import UnaryNode from "./unaryNode";
import RATreeNode from "./raTreeNode";
import Relation from "../relation/relation";
import {VETreeNode} from "../vetree/veTreeNode";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";
import {IndexedString} from "../types/indexedString";
import ValueParser from "../expression/valueParser";
import {ErrorFactory, SyntaxErrorCodes} from "../error/errorFactory";
import ErrorWithTextRange, {insertRangeIfUndefined} from "../error/errorWithTextRange";
import {isInRangeAndNotInQuotes} from "./raTreeTools";
import {getRange} from "../utils/commonStringUtils";

/**
 * Selection node of the relational algebra syntactic tree.
 */
export default class SelectionNode extends UnaryNode {

    private readonly selection: string | IndexedString;
    private readonly stringRange: { start: number, end: number } | undefined;
    private readonly nullValuesSupport: boolean;

    /**
     * Expects the selection string to start with '(' and end with ')'.
     *
     * @param selection
     * @param subtree
     * @param nullValuesSupport
     */
    public constructor(selection: string | IndexedString, subtree: RATreeNode, nullValuesSupport: boolean) {
        super(subtree);
        this.selection = selection;
        this.stringRange = getRange(selection);
        this.nullValuesSupport = nullValuesSupport;
    }

    /**
     * Expectations: condition is valid expression which evaluates to boolean
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }

        let boolExpr: VETreeNode;
        try {
            boolExpr = ValueParser.parse(this.selection.slice(1, -1), this.nullValuesSupport);
        }
        catch (e) {
            throw insertRangeIfUndefined(e, this.stringRange);
        }

        const source: Relation = this.subtree.getResult();
        const result: Relation = new Relation(source.name + "(...)");
        source.forEachColumn((type, name) => result.addColumn(name, type));

        source.getRows().forEach(row => {
            let bool: { value: ColumnContent, type: SupportedColumnType | "null" } = boolExpr.eval(row);
            if (bool.type !== "boolean") {
                throw ErrorFactory.syntaxError(SyntaxErrorCodes.selectionNode_eval_resultNotBoolean,
                    this.stringRange, this.selection.replace(/\s+/g, " "), bool.type);
            }
            if (bool.value) {
                result.addRow(row);
            }
        });
        this.resultRelation = result;
    }

    /**
     * Strict expectations: columns names used in the condition exists in source schema
     * Returned schema: source schema
     * Usage of absent column names does not affect returned schema.
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        let {result, whispers, errors} = this.subtree.fakeEval(cursorIndex);
        const newResult = new Relation(result.getName() + "(...)");
        result.forEachColumn((type, name) => {
            newResult.addColumn(name, type);
        });
        result = newResult;
        // checks whether the cursor is in this selection block (and not in the string) - saves current available columns
        if (isInRangeAndNotInQuotes(cursorIndex, this.stringRange, this.selection)) {
            whispers = result.getColumnNames();
        }
        // checks empty selection input
        if (this.selection.toString().slice(1, -1).trim().length  === 0) {
            errors.push(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_parseTokens_emptyInput, this.stringRange));
        }
        // adds errors from current expression
        else if (this.selection instanceof IndexedString) {
            errors.push(...ValueParser.fakeParse(this.selection.slice(1, -1), this.nullValuesSupport, result.getColumnNames()));
        }
        // result schema is the same as the source
        return {result, whispers, errors};
    }

    public printInLine(): string {
        return this.subtree.printInLine() + this.getOperationSymbol();
    }

    public getOperationName(): string {
        return "Selection";
    }

    public getOperationSymbol(): string {
        return this.selection.replace(/\s+/g, ' ');
    }
}