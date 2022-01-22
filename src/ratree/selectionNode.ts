import { UnaryNode } from './unaryNode'
import { RATreeNode } from './raTreeNode'
import { Relation } from '../relation/relation'
import { VEResult, VETreeNode } from '../vetree/veTreeNode'
import { IndexedString } from '../types/indexedString'
import { ValueParser } from '../expression/valueParser'
import { ErrorFactory } from '../error/errorFactory'
import { insertRangeIfUndefined } from '../error/errorWithTextRange'
import { isInRangeAndNotInQuotes } from './raTreeTools'
import { language } from '../language/language'
import { StartEndPair } from '../types/startEndPair'

/**
 * Selection node of the relational algebra syntactic tree.
 * @extends UnaryNode
 * @category RATree
 * @public
 */
export class SelectionNode extends UnaryNode {

  private readonly selection: IndexedString
  private readonly stringRange: StartEndPair | undefined
  private readonly nullValuesSupport: boolean

  /**
     * Creates a new SelectionNode.
     * Expects the selection string to start with '(' and end with ')'.
     *
     * @param selection logic-algebraic expression {@type IndexedString}
     * @param subtree source subtree for renaming {@type RATreeNode}
     * @param nullValuesSupport whether null values are supported {@type boolean}
     * @public
     */
  constructor (selection: IndexedString, subtree: RATreeNode, nullValuesSupport: boolean) {
    super(subtree)
    this.selection = selection
    this.stringRange = selection.getRange()
    this.nullValuesSupport = nullValuesSupport
  }

  /**
     * Evaluates the RA query in this node and its subtree.
     * After successful call, this.resultRelation must be set to valid Relation.
     * Expectations: condition is valid expression which evaluates to boolean
     * @public
     */
  eval (): void {
    if (this.isEvaluated()) {
      return
    }

    let boolExpr: VETreeNode
    try {
      boolExpr = ValueParser.parse(this.selection.slice(1, -1), this.nullValuesSupport)
    } catch (e) {
      throw insertRangeIfUndefined(e, this.stringRange)
    }

    const source: Relation = this.subtree.getResult()
    const result: Relation = new Relation(source.name + '(...)')
    source.forEachColumn((type, name) => result.addColumn(name, type))

    source.getRows().forEach(row => {
      const bool: VEResult = boolExpr.eval(row)
      if (bool.type !== 'boolean') {
        throw ErrorFactory.syntaxError(language().syntaxErrors.selectionNode_resultNotBoolean,
                    this.stringRange, this.selection.replace(/\s+/g, ' '), bool.type)
      }
      if (bool.value) {
        result.addRow(row)
      }
    })
    this.resultRelation = result
  }

  /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: columns names used in the condition exists in source schema
     * Returned schema: source schema
     * Usage of absent column names does not affect returned schema.
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
  fakeEval (cursorIndex: number) {
    let { result, whispers, errors } = this.subtree.fakeEval(cursorIndex)
    const newResult = new Relation(result.getName() + '(...)')
    result.forEachColumn((type, name) => {
      newResult.addColumn(name, type)
    })
    result = newResult
    // checks whether the cursor is in this selection block (and not in the string) - saves current available columns
    if (isInRangeAndNotInQuotes(cursorIndex, this.stringRange, this.selection)) {
      whispers = result.getColumnNames()
    }
    // checks empty selection input
    if (this.selection.toString().slice(1, -1).trim().length === 0) {
      errors.push(ErrorFactory.syntaxError(language().syntaxErrors.valueParser_emptyInput, this.stringRange))
    }
    // adds errors from current expression
    else {
      errors.push(...ValueParser.fakeParse(this.selection.slice(1, -1), this.nullValuesSupport, result.getColumnNames()))
    }
    // result schema is the same as the source
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
    return language().operations.selection
  }

  /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
  getOperationSymbol (): string {
    return this.selection.replace(/\s+/g, ' ')
  }
}
