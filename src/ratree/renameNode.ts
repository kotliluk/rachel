import { UnaryNode } from './unaryNode'
import { RATreeNode } from './raTreeNode'
import { StringUtils } from '../utils/stringUtils'
import { Relation } from '../relation/relation'
import { SupportedColumnType } from '../relation/columnType'
import { Row } from '../relation/row'
import { IndexedString } from '../types/indexedString'
import { ErrorFactory } from '../error/errorFactory'
import { isForbiddenColumnName } from '../utils/keywords'
import { ErrorWithTextRange } from '../error/errorWithTextRange'
import { ISToISMap } from '../types/isToISMap'
import { language } from '../language/language'
import { StartEndPair } from '../types/startEndPair'

/**
 * Renaming node of the relational algebra syntactic tree.
 * @extends UnaryNode
 * @category RATree
 * @public
 */
export class RenameNode extends UnaryNode {

  private readonly rename: IndexedString
  private readonly stringRange: StartEndPair | undefined

  /**
     * Creates a new RenameNode.
     * The rename string is expected to start with '<' and end with '>'.
     *
     * @param rename string describing each renaming {@type IndexedString}
     * @param subtree source subtree {@type RATreeNode}
     * @public
     */
  constructor (rename: IndexedString, subtree: RATreeNode) {
    super(subtree)
    this.rename = rename
    this.stringRange = rename.getRange()
  }

  private parseChanges (doThrow: boolean, errors: ErrorWithTextRange[] = []): ISToISMap {
    const handleError = (error: SyntaxError) => {
      if (doThrow) {
        throw error
      } else {
        errors.push(error)
      }
    }
    const parts: IndexedString[] = this.rename.slice(1, -1).split(',')
    const ret: ISToISMap = new ISToISMap()
    for (const part of parts) {
      // @ts-ignore
      const words: IndexedString[] = part.split('->').map(w => w.trim())
      let beforeError = false // true when there was an error in before in "before -> after"
      let afterError = false  // true when there was an error in after in "before -> after"
      if (words.length !== 2) {
        let range = part.getRange()
        if (part.isEmpty() && this.stringRange !== undefined) {
          range = { start: this.stringRange.start, end: this.stringRange.start }
        }
        handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_missingArrow, range))
        beforeError = true
        afterError = true
      }
      if (!beforeError && ret.has(words[0])) {
        handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_multipleRenameOfTheColumn,
                    words[0].getRange(), words[0].toString()))
        beforeError = true
      }
      if (!afterError && !StringUtils.isName(words[1].toString())) {
        handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_invalidNewName,
                    words[1].getRange(), words[1].toString()))
        afterError = true
      }
      if (!afterError && isForbiddenColumnName(words[1])) {
        handleError(ErrorFactory.syntaxError(language().syntaxErrors.renameNode_keywordNewName,
                    words[1].getRange(), words[1].toString()))
        afterError = true
      }
      // if no error found, adds original rename pair
      if (!beforeError && !afterError) {
        ret.set(words[0], words[1])
      }
      // if no before error, fakes rename "before -> before"
      else if (!beforeError) {
        ret.set(words[0], words[0])
      }
      // if no after error, fakes rename """ -> before", where empty string has undefined range
      else if (!afterError) {
        ret.set(IndexedString.empty(), words[0])
      }
      // if both errors, adds nothing
    }
    return ret
  }

  /**
     * Evaluates the RA query in this node and its subtree.
     * After successful call, this.resultRelation must be set to valid Relation.
     * Expectations: original names in projection pair (original -> new) are subset of the source schema,
     * new names with rest of the source schema contain no duplicity
     * @public
     */
  eval (): void {
    if (this.isEvaluated()) {
      return
    }
    const changes: ISToISMap = this.parseChanges(true)
    const source: Relation = this.subtree.getResult()
    // check whether all columns to rename are in source relation
    changes.forEach((value, key) => {
      if (!source.getColumnNames().includes(key.toString())) {
        throw ErrorFactory.semanticError(language().semanticErrors.renameNode_absentOriginalColumn,
                     key.getRange(), key.toString())
      }
    })
    // rename of relational schema
    const result: Relation = new Relation(source.getName() + '<...>')
    const toChange: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>()
    // in first loop adds unchanged columns only
    source.forEachColumn((type, name) => {
      if (changes.has(name)) {
        toChange.set(name, type)
      } else {
        result.addColumn(name, type)
      }
    })
    // in second loop adds changed columns
    toChange.forEach((type, name) => {
      // @ts-ignore (changes must contain 'name' key now)
      if (!result.addColumn(changes.get(name).toString(), type)) {
        const newName = changes.get(name)
        throw ErrorFactory.semanticError(language().semanticErrors.renameNode_changeToDuplicit,
                    this.rename.getRange(), newName ? newName.toString() : '')
      }
    })
    // rename of relation rows
    source.getRows().forEach(row => {
      const newRow: Row = new Row(result.getColumns())
      row.getValues().forEach((value, name) => {
        const returned = changes.get(name)
        if (typeof returned === 'undefined') {
          newRow.addValue(name, value)
        } else {
          newRow.addValue(returned.toString(), value)
        }
      })
      result.addRow(newRow)
    })
    this.resultRelation = result
  }

  /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: original names in projection pair (original -> new) are subset of the source schema,
     * new names with rest of the source schema contain no duplicity
     * Returned schema: if the cursor is not after the arrow '->' returns
     * (source schema minus originals) union (news whose originals were in source schema),
     * otherwise returns empty array (does not whisper to what the user should rename)
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
  fakeEval (cursorIndex: number) {
    const source = this.subtree.fakeEval(cursorIndex)
    // checks whether the cursor is in this rename block
    let whispers = source.whispers
    if (this.stringRange !== undefined && this.stringRange.start < cursorIndex && cursorIndex <= this.stringRange.end) {
      whispers = source.result.getColumnNames()
    }
    // adds errors from current expression
    const errors = source.errors
    const changes: ISToISMap = this.parseChanges(false, errors)
    // creates relational schema - "(source minus to-rename) union (renamed existing in source)"
    const result: Relation = new Relation(source.result.getName() + '<...>')
    // in first loop adds source columns which are not in changes.keys
    source.result.forEachColumn((type, name) => {
      if (!changes.has(name)) {
        result.addColumn(name, type)
      }
    })
    // in second loop adds changes.values whose changes.keys are in source
    const absent: IndexedString[] = []
    const duplicit: IndexedString[] = []
    changes.forEach((after, before) => {
      const beforeStr = before.toString()
      const afterStr = after.toString()
      if (!source.result.hasColumn(beforeStr) && !before.isEmpty()) {
        absent.push(before)
      }
      // @ts-ignore source must have beforeStr now
      else if (!result.addColumn(afterStr, source.result.getColumns().get(beforeStr))) {
        duplicit.push(after)
      }
    })
    absent.forEach(column => {
      errors.push(ErrorFactory.semanticError(language().semanticErrors.renameNode_absentOriginalColumn,
                column.getRange(), column.toString()))
    })
    duplicit.forEach(column => {
      errors.push(ErrorFactory.semanticError(language().semanticErrors.renameNode_changeToDuplicit,
                column.getRange(), column.toString()))
    })
    return { result, whispers, errors }
  }

  /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line {@type string}
     * @public
     */
  printInLine (): string {
    return this.subtree.printInLine() + this.getOperationSymbol()
  }

  /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
  getOperationName (): string {
    return language().operations.rename
  }

  /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
  getOperationSymbol (): string {
    return this.rename.replace(/\s+/g, ' ')
  }
}
