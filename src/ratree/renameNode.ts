import UnaryNode from "./unaryNode";
import RATreeNode from "./raTreeNode";
import StringUtils from "../utils/stringUtils";
import Relation from "../relation/relation";
import {SupportedColumnType} from "../relation/columnType";
import Row from "../relation/row";
import {IndexedString} from "../types/indexedString";
import {ErrorFactory} from "../error/errorFactory";
import {isForbiddenColumnName} from "../utils/keywords";
import ErrorWithTextRange from "../error/errorWithTextRange";
import {ISToISMap} from "../types/isToISMap";
import {language} from "../language/language";

/**
 * Renaming node of the relational algebra syntactic tree.
 */
export default class RenameNode extends UnaryNode {

    private readonly rename: IndexedString;
    private readonly stringRange: { start: number, end: number } | undefined;

    /**
     * Creates a new renaming node with given subtree.
     * The rename string is expected to start with '<' and end with '>'.
     *
     * @param rename string describing each renaming
     * @param subtree source subtree for renaming
     */
    public constructor(rename: IndexedString, subtree: RATreeNode) {
        super(subtree);
        this.rename = rename;
        this.stringRange = rename.getRange();
    }

    private parseChanges(doThrow: boolean, errors: ErrorWithTextRange[] = []): ISToISMap {
        const handleError = (error: SyntaxError) => {
            if (doThrow) {
                throw error;
            } else {
                errors.push(error);
            }
        }
        const parts: IndexedString[] = this.rename.slice(1, -1).split(",");
        const ret: ISToISMap = new ISToISMap();
        for (let part of parts) {
            // @ts-ignore
            let words: IndexedString[] = part.split("->").map(w => w.trim());
            let beforeError = false; // true when there was an error in before in "before -> after"
            let afterError = false;  // true when there was an error in after in "before -> after"
            if (words.length !== 2) {
                let range = part.getRange();
                if (part.isEmpty() && this.stringRange !== undefined) {
                    range = {start: this.stringRange.start, end: this.stringRange.start};
                }
                handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_missingArrow, range));
                beforeError = true;
                afterError = true;
            }
            if (!beforeError && ret.has(words[0])) {
                handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_multipleRenameOfTheColumn,
                    words[0].getRange(), words[0].toString()));
                beforeError = true;
            }
            if (!afterError && !StringUtils.isName(words[1].toString())) {
                handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_invalidNewName,
                    words[1].getRange(), words[1].toString()));
                afterError = true;
            }
            if (!afterError && isForbiddenColumnName(words[1])) {
                handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_keywordNewName,
                    words[1].getRange(), words[1].toString()));
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
                ret.set(IndexedString.empty(), words[0]);
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
        const changes: ISToISMap = this.parseChanges(true);
        const source: Relation = this.subtree.getResult();
        // check whether all columns to rename are in source relation
        changes.forEach((value, key) => {
             if (source.getColumnNames().indexOf(key.toString()) === -1) {
                 throw ErrorFactory.semanticError(language().semanticErrors.renameNode_absentOriginalColumn,
                     key.getRange(), key.toString());
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
                const newName = changes.get(name);
                throw ErrorFactory.semanticError(language().semanticErrors.renameNode_changeToDuplicit,
                    this.rename.getRange(), newName ? newName.toString() : "");
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
    public fakeEval(cursorIndex: number) {
        const source = this.subtree.fakeEval(cursorIndex);
        // checks whether the cursor is in this rename block
        let whispers = source.whispers;
        if (this.stringRange !== undefined && this.stringRange.start < cursorIndex && cursorIndex <= this.stringRange.end) {
            whispers = source.result.getColumnNames();
        }
        // adds errors from current expression
        const errors = source.errors;
        const changes: ISToISMap = this.parseChanges(false, errors);
        // creates relational schema - "(source minus to-rename) union (renamed existing in source)"
        const result: Relation = new Relation(source.result.getName() + "<...>");
        // in first loop adds source columns which are not in changes.keys
        source.result.forEachColumn((type, name) => {
            if (!changes.has(name)) {
                result.addColumn(name, type);
            }
        });
        // in second loop adds changes.values whose changes.keys are in source
        const absent: IndexedString[] = [];
        const duplicit: IndexedString[] = [];
        changes.forEach((after, before) => {
            const beforeStr = before.toString();
            const afterStr = after.toString();
            if (!source.result.hasColumn(beforeStr) && !before.isEmpty()) {
                absent.push(before);
            }
            // @ts-ignore source must have beforeStr now
            else if(!result.addColumn(afterStr, source.result.getColumns().get(beforeStr))) {
                duplicit.push(after);
            }
        });
        absent.forEach(column => {
            errors.push(ErrorFactory.semanticError(language().semanticErrors.renameNode_absentOriginalColumn,
                column.getRange(), column.toString()));
        });
        duplicit.forEach(column => {
            errors.push(ErrorFactory.semanticError(language().semanticErrors.renameNode_changeToDuplicit,
                column.getRange(), column.toString()));
        });
        return {result, whispers, errors};
    }

    public printInLine(): string {
        return this.subtree.printInLine() + this.getOperationSymbol();
    }

    public getOperationName(): string {
        return language().operations.rename;
    }

    public getOperationSymbol(): string {
        return this.rename.replace(/\s+/g, ' ');
    }
}