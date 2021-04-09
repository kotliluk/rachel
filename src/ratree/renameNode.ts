import UnaryNode from "./unaryNode";
import RATreeNode from "./raTreeNode";
import StringUtils from "../utils/stringUtils";
import Relation from "../relation/relation";
import {SupportedColumnType} from "../relation/columnType";
import Row from "../relation/row";
import {IndexedString} from "../types/indexedString";
import {ErrorFactory, SemanticErrorCodes, SyntaxErrorCodes} from "../error/errorFactory";
import {isForbiddenColumnName} from "../utils/keywords";
import ErrorWithTextRange from "../error/errorWithTextRange";
import {SToSMap} from "../types/sToSMap";
import {getRange, isEmpty} from "../utils/commonStringUtils";

/**
 * Renaming node of the relational algebra syntactic tree.
 */
export default class RenameNode extends UnaryNode {

    private readonly rename: string | IndexedString;
    private readonly stringRange: { start: number, end: number } | undefined;

    /**
     * Creates a new renaming node with given subtree.
     * The rename string is expected to start with '<' and end with '>'.
     *
     * @param rename string describing each renaming
     * @param subtree source subtree for renaming
     */
    public constructor(rename: string | IndexedString, subtree: RATreeNode) {
        super(subtree);
        this.rename = rename;
        this.stringRange = getRange(rename);
    }

    private parseChanges(doThrow: boolean, errors: ErrorWithTextRange[] = []): SToSMap {
        const handleError = (error: SyntaxError) => {
            if (doThrow) {
                throw error;
            } else {
                errors.push(error);
            }
        }
        const parts: (string | IndexedString)[] = this.rename.slice(1, -1).split(",");
        const ret: SToSMap = new SToSMap();
        for (let part of parts) {
            // @ts-ignore
            let words: (string | IndexedString)[] = part.split("->").map(w => w.trim());
            let beforeError = false; // true when there was an error in before in "before -> after"
            let afterError = false;  // true when there was an error in after in "before -> after"
            if (words.length !== 2) {
                let range = getRange(part);
                if (isEmpty(part) && this.stringRange !== undefined) {
                    range = {start: this.stringRange.start, end: this.stringRange.start};
                }
                handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.renameNode_parseChanges_missingArrow, range));
                beforeError = true;
                afterError = true;
            }
            if (!beforeError && ret.has(words[0].toString())) {
                handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.renameNode_parseChanges_multipleRenameOfTheColumn,
                    getRange(words[0]), words[0].toString()));
                beforeError = true;
            }
            if (!afterError && !StringUtils.isName(words[1].toString())) {
                handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.renameNode_parseChanges_invalidNewName,
                    getRange(words[1]), words[1].toString()));
                afterError = true;
            }
            if (!afterError && isForbiddenColumnName(words[1])) {
                handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.renameNode_parseChanges_keywordNewName,
                    getRange(words[1]), words[1].toString()));
                afterError = true;
            }
            // if no error found, adds original rename pair
            if (!beforeError && !afterError) {
                ret.set(words[0], words[1]);
            }
            // if no before error, fakes rename "before -> before"
            else if (!beforeError) {
                ret.set(words[0], words[0]);
            }
            // if no after error, fakes rename """ -> before", where empty string has undefined range
            else if (!afterError) {
                ret.set("", words[0]);
            }
            // if both errors, adds nothing
        }
        return ret;
    }

    /**
     * Expectations: original names in projection pair (original -> new) are subset of the source schema,
     * new names with rest of the source schema contain no duplicity
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const changes: SToSMap = this.parseChanges(true);
        const source: Relation = this.subtree.getResult();
        // check whether all columns to rename are in source relation
        changes.forEach((value, key) => {
             if (source.getColumnNames().indexOf(key.toString()) === -1) {
                 throw ErrorFactory.semanticError(SemanticErrorCodes.renameNode_eval_absentOriginalColumn,
                     getRange(key), key.toString());
             }
        });
        // rename of relational schema
        const result: Relation = new Relation(source.getName() + "<...>");
        const toChange: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>();
        // in first loop adds unchanged columns only
        source.forEachColumn((type, name) => {
            if (changes.has(name)) {
                toChange.set(name, type);
            }
            else {
                result.addColumn(name, type);
            }
        });
        // in second loop adds changed columns
        toChange.forEach((type, name) => {
            // @ts-ignore (changes must contain 'name' key now)
            if (!result.addColumn(changes.get(name).toString(), type)) {
                throw ErrorFactory.semanticError(SemanticErrorCodes.renameNode_eval_changeToDuplicitName,
                    getRange(this.rename), changes.get(name) as string);
            }
        });
        // rename of relation rows
        source.getRows().forEach(row => {
            const newRow: Row = new Row(result.getColumns());
            row.getValues().forEach((value, name) => {
                const returned = changes.get(name);
                if (typeof returned === "undefined") {
                    newRow.addValue(name, value);
                }
                else {
                    newRow.addValue(returned.toString(), value);
                }
            });
            result.addRow(newRow);
        });
        this.resultRelation = result;
    }

    /**
     * Strict expectations: original names in projection pair (original -> new) are subset of the source schema,
     * new names with rest of the source schema contain no duplicity
     * Returned schema: if the cursor is not after the arrow '->' returns
     * (source schema minus originals) union (news whose originals were in source schema),
     * otherwise returns empty array (does not whisper to what the user should rename)
     * Second possible approach would be to return (source schema minus originals) union (news) - less strict.
     */
    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        const source: {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} = this.subtree.fakeEval(cursorIndex);
        // checks whether the cursor is in this rename block
        let whispers = source.whispers;
        if (this.stringRange !== undefined && this.stringRange.start < cursorIndex && cursorIndex <= this.stringRange.end) {
            // if the last special character before cursor is '<' or ',' returns current available columns (subtree schema)
            const beforeCursor: string | IndexedString = this.rename.slice(0, cursorIndex - this.stringRange.start).trim();
            const regexMatch = beforeCursor.match(/.*[^\w\s]/);
            if (regexMatch !== null && (regexMatch[0].endsWith('<') || regexMatch[0].endsWith(','))) {
                whispers = source.result.getColumnNames();
            }
        }
        // adds errors from current expression
        const errors = source.errors;
        const changes: SToSMap = this.parseChanges(false, errors);
        // creates relational schema - "(source minus to-rename) union (renamed existing in source)"
        const result: Relation = new Relation(source.result.getName() + "<...>");
        // in first loop adds source columns which are not in changes.keys
        source.result.forEachColumn((type, name) => {
            if (!changes.has(name)) {
                result.addColumn(name, type);
            }
        });
        // in second loop adds changes.values whose changes.keys are in source
        const absent: (string | IndexedString)[] = [];
        const duplicit: (string | IndexedString)[] = [];
        changes.forEach((after, before) => {
            const beforeStr = before.toString();
            const afterStr = after.toString();
            if (!source.result.hasColumn(beforeStr) && before !== "") {
                absent.push(before);
            }
            // @ts-ignore source must have beforeStr now
            else if(!result.addColumn(afterStr, source.result.getColumns().get(beforeStr))) {
                duplicit.push(after);
            }
        });
        absent.forEach(column => {
            errors.push(ErrorFactory.semanticError(SemanticErrorCodes.renameNode_eval_absentOriginalColumn,
                getRange(column), column.toString()));
        });
        duplicit.forEach(column => {
            errors.push(ErrorFactory.semanticError(SemanticErrorCodes.renameNode_eval_changeToDuplicitName,
                getRange(column), column.toString()));
        });
        return {result, whispers, errors};
    }

    public printInLine(): string {
        return this.subtree.printInLine() + this.getOperationSymbol();
    }

    public getOperationName(): string {
        return "Rename";
    }

    public getOperationSymbol(): string {
        return this.rename.replace(/\s+/g, ' ');
    }
}