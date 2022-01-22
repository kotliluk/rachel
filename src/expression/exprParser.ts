import { Relation } from '../relation/relation'
import { ErrorFactory } from '../error/errorFactory'
import {
  BinaryOperatorToken,
  ClosingParenthesis,
  ExprToken,
  OpeningParenthesis,
  ParenthesisToken,
  RelationToken,
  UnaryOperatorToken,
} from './exprTokens'
import { StringUtils } from '../utils/stringUtils'
import { RATreeNode } from '../ratree/raTreeNode'
import { RelationNode } from '../ratree/relationNode'
import { IndexedString } from '../types/indexedString'
import { IndexedStringUtils } from '../utils/indexedStringUtils'
import { ErrorWithTextRange } from '../error/errorWithTextRange'
import { RATreeFactory } from '../ratree/raTreeFactory'
import { language } from '../language/language'
import { StartEndPair } from '../types/startEndPair'

/**
 * Fake parsing result in {@link ExprParser}.
 * @category Expression
 * @public
 */
export interface ExprFakeParseResult {
  /**
     * found words to whisper (relation or column names)
     * @type string[]
     * @public
     */
  whispers: string[]
  /**
     * detected errors
     * @type ErrorWithTextRange[]
     * @public
     */
  errors: ErrorWithTextRange[]
  /**
     * pairs of indexes with parentheses
     * @type StartEndPair[]
     * @public
     */
  parentheses: StartEndPair[]
}

/**
 * Parser of relational algebra expressions from textual inputs.
 * @category Expression
 * @public
 */
export class ExprParser {

  /**
     * Creates a parser with given source relations.
     *
     * @param relations map of relations used as source for leave nodes {@type Map<String, Relation>}
     * @param nullValuesSupport whether to support null values {@type boolean}
     * @public
     */
  constructor (readonly relations: Map<string, Relation>, readonly nullValuesSupport: boolean) {}

  /**
     * Parses given relational algebra expression 'expr' and returns tree of RA operations.
     * Expression is expected to respect following constraints:
     * - all relation's and column's names contain letters, numbers and underscores only
     * - all relation's and column's names start with a letter
     * - used operations must be in a simplified notation and be well-structured
     * - line comments begin with '//' and ends with newline
     * - block comments begins with '/*' and ends with '* /'
     *
     * Supported operations are:
     * - projection of columns: Relation[projectedColumn1, ...]
     * - selection of rows: Relation(condition)
     * - rename of columns: Relation<oldName -> newName, ...>
     * - cartesian product: A ⨯ B
     * - natural join: A * B
     * - theta join: A [condition] B
     * - left and right semijoin: A <* B and A *> B
     * - left and right antijoin: A ⊳ B and A ⊲ B
     * - left and right theta semijoin: A <condition] B and A [condition> B
     * - division: A ÷ B
     * - left, right and full outer join: A *L* B, A *R* B and A *F* B
     * - union, intersection and difference: A ∪ B, A ∩ B and A \ B
     *
     * See {@link ValueParser} for condition-subexpressions constraints.
     *
     * @param expr relational algebra expression in expected format {@type string}
     * @return tree structure of the given expression {@type RATreeNode}
     * @public
     */
  parse (expr: string): RATreeNode {
    const { str, err } = IndexedStringUtils.deleteAllComments(IndexedString.new(expr))
    if (err !== undefined) {
      throw err
    }
    const { tokens } = this.parseTokens(str)
    if (tokens.length === 0) {
      throw ErrorFactory.syntaxError(language().syntaxErrors.exprParser_emptyStringGiven, undefined)
    }
    this.assertValidInfixTokens(tokens)
    const rpn: ExprToken[] = this.toRPN(tokens)
    return this.rpnToRATree(rpn)
  }

  /**
     * Parses given expression and finds words to whisper for the given cursorIndex.
     * If the cursor is located next to any RA operator, returns list of all defined relation names.
     * If the cursor is located inside any RA operator, which uses relation columns, returns list of available column
     * names at given place.
     * If a parsing error occurs, it is faked to work or ignored and reported in returning errors array.
     * For supported operations see {@link parse}.
     *
     * @param expr input expression to fake parse {@type string}
     * @param cursorIndex current index of the cursor {@type number}
     * @return parsed information {@type ExprFakeParseResult}
     * @public
     */
  fakeParse (expr: string, cursorIndex: number): ExprFakeParseResult {
    if (expr.trim() === '') {
      return { whispers: [...this.relations.keys()], errors: [], parentheses: [] }
    }
    const { str, err } = IndexedStringUtils.deleteAllComments(IndexedString.new(expr))
    const { whispers, tokens, errors, parentheses } = this.parseTokens(str, false, cursorIndex)
    if (err !== undefined) {
      errors.push(err)
    }
    // prevent errors in creation of RPN
    if (tokens.length === 0) {
      return { whispers: whispers, errors: errors, parentheses: parentheses }
    }
    // fakes found errors to valid parse
    this.assertValidInfixTokens(tokens, false, errors)
    const rpn: ExprToken[] = this.toRPN(tokens)
    const raTree: RATreeNode = this.rpnToRATree(rpn, false, errors)
    // tries to find whispers inside RA operations with parameters
    const innerResult: {whispers: string[], errors: ErrorWithTextRange[]} = raTree.fakeEval(cursorIndex)
    errors.push(...innerResult.errors)
    // if there are whispers from inner operators, returns them
    if (innerResult.whispers.length > 0) {
      return { whispers: innerResult.whispers, errors: errors, parentheses: parentheses }
    }
    // otherwise returns outer whispers (or empty array if no were found)
    return { whispers: whispers, errors: errors, parentheses: parentheses }
  }

  /**
     * Parses given expression to ExprToken array. While parsing, it tries to find cursor index and returns whispers.
     * When doThrow is false, parsing errors are not thrown but stored in errors array. Returns found pair characters
     * (e.g., parentheses).
     *
     * @param expr IndexedString to parse the expression from
     * @param cursorIndex current cursor index
     * @param doThrow whether to throw encountered errors was a relation or an unary operator (default false)
     */
  parseTokens (expr: IndexedString, doThrow = true, cursorIndex = NaN):
  { tokens: ExprToken[], whispers: string[], errors: ErrorWithTextRange[], parentheses: StartEndPair[] } {
    // handles empty string
    if (expr.isEmpty()) {
      return { tokens: [], whispers: [...this.relations.keys()], errors: [], parentheses: [] }
    }

    const tokens: ExprToken[] = []
    let whispers: string[] = cursorIndex === 0 ? [...this.relations.keys()] : []
    const errors: ErrorWithTextRange[] = []
    const parentheses: StartEndPair[] = []

    // throws the error if doThrow is true, otherwise adds it to the errors array
    const handleError = (err: ErrorWithTextRange) => {
      if (doThrow) {
        throw err
      }
      errors.push(err)
    }

    // adds new pair of parentheses from margins of the given string
    const pushParentheses = (str: IndexedString) => {
      parentheses.push({ start: str.getFirstIndex(), end: str.getLastIndex() })
    }

    let selectionExpected = false
    let rest: IndexedString = expr
    while (!rest.isEmpty()) {
      // checks whether the cursor was reached
      const restStartIndex: number = rest.getFirstIndex()
      if (restStartIndex === cursorIndex) {
        whispers = [...this.relations.keys()]
      }

      // '(' can be a selection or a parentheses
      if (rest.startsWith('(')) {
        let split: {first: IndexedString, second: IndexedString}
        try {
          split = IndexedStringUtils.nextBorderedPart(rest, '(', ')')
        }
        // catches error from nextBorderedPart
        catch (err) {
          // saves error
          if (err instanceof ErrorWithTextRange) {
            handleError(err)
          }

          if (selectionExpected) {
            // it fakes the unclosed expression part as a selection operator
            tokens.push(UnaryOperatorToken.selection(rest.concat(IndexedString.new(')', rest.getLastIndex() + 1))))
          } else {
            // it fakes the unclosed expression as nested expression in parentheses
            tokens.push(new OpeningParenthesis(rest.slice(0, 1)))
            // parses inner part between parentheses
            const recursiveReturn = this.parseTokens(rest.slice(1), doThrow, cursorIndex)
            errors.push(...recursiveReturn.errors)
            if (whispers.length === 0) {
              whispers.push(...recursiveReturn.whispers)
            }
            tokens.push(...recursiveReturn.tokens)
            parentheses.push(...recursiveReturn.parentheses)
            // gives invalid index (NaN for not reporting errors with this imaginary parentheses
            tokens.push(new ClosingParenthesis(IndexedString.new(')', NaN)))
          }
          // breaks the while cycle because rest was parsed recursively
          break
        }

        // saves parentheses
        pushParentheses(split.first)

        // whole "(...)" part pushed as selection
        if (selectionExpected) {
          tokens.push(UnaryOperatorToken.selection(split.first))
        }
        // inner of "(...)" part parsed as parentheses structure
        else {
          tokens.push(new OpeningParenthesis(split.first.slice(0, 1)))
          const recursiveReturn = this.parseTokens(split.first.slice(1, -1), doThrow, cursorIndex)
          errors.push(...recursiveReturn.errors)
          if (whispers.length === 0) {
            whispers.push(...recursiveReturn.whispers)
          }
          tokens.push(...recursiveReturn.tokens)
          parentheses.push(...recursiveReturn.parentheses)
          tokens.push(new ClosingParenthesis(split.first.slice(-1)))
          selectionExpected = true
        }
        rest = split.second
      }
      // '[' can be a projection, theta join, or right theta semi join
      else if (rest.startsWith('[')) {
        let split: {first: IndexedString, second: IndexedString}
        let error = false
        try {
          split = IndexedStringUtils.nextBorderedPart(rest, '[', ']\u27e9')
        }
        // catches error from nextBorderedPart
        catch (err) {
          error = true
          // saves error
          if (err instanceof ErrorWithTextRange) {
            handleError(err)
          }
          // it fakes the unclosed expression part as a projection operator
          split = { first: rest.concat(IndexedString.new(']', rest.getLastIndex() + 1)), second: IndexedString.empty() }
        }

        // saves parentheses
        pushParentheses(split.first)

        // checks whether the cursor was reached
        if (!error && split.first.getLastIndex() === cursorIndex - 1) {
          whispers = [...this.relations.keys()]
        }

        // right theta semijoin found "[...⟩"
        if (split.first.endsWith('\u27e9')) {
          tokens.push(BinaryOperatorToken.rightThetaSemijoin(split.first))
          selectionExpected = false
          rest = split.second
        }
        // if the next part contains any character from =<>+/*&|~"()! it cannot be a valid Projection
        else if (split.first.containsAny('=<>+/*&|~"()!')) {
          tokens.push(BinaryOperatorToken.thetaJoin(split.first))
          selectionExpected = false
          rest = split.second
        }
        // else suppose it is a projection
        else {
          tokens.push(UnaryOperatorToken.projection(split.first))
          selectionExpected = true
          rest = split.second
        }
      }
      // BINARY OPERATORS
      else if (rest.startsWith('*F*') || rest.startsWith('*L*') || rest.startsWith('*R*')) {
        const operator: IndexedString = rest.slice(0, 3)
        // checks whether the cursor was reached
        if (operator.getLastIndex() === cursorIndex - 1) {
          whispers = [...this.relations.keys()]
        }

        if (rest.startsWith('*F')) {
          tokens.push(BinaryOperatorToken.fullOuterJoin(operator))
        } else if (rest.startsWith('*L')) {
          tokens.push(BinaryOperatorToken.leftOuterJoin(operator))
        } else {
          tokens.push(BinaryOperatorToken.rightOuterJoin(operator))
        }
        rest = rest.slice(3)
        selectionExpected = false
      }
      // operators of 2 characters
      else if (rest.startsWith('<*') || rest.startsWith('*>')) {
        const operator: IndexedString = rest.slice(0, 2)
        // checks whether the cursor was reached
        if (operator.getLastIndex() === cursorIndex - 1) {
          whispers = [...this.relations.keys()]
        }

        if (rest.startsWith('<*')) {
          tokens.push(BinaryOperatorToken.leftSemijoin(operator))
        } else {
          tokens.push(BinaryOperatorToken.rightSemijoin(operator))
        }
        rest = rest.slice(2)
        selectionExpected = false
      }
      // operators of 1 character
      else if ('*\u2a2f\u222a\u2229\\\u22b3\u22b2\u00f7'.includes(rest.charAt(0))) {
        const operator: IndexedString = rest.slice(0, 1)
        // checks whether the cursor was reached
        if (operator.getLastIndex() === cursorIndex - 1) {
          whispers = [...this.relations.keys()]
        }

        if (rest.startsWith('*')) {
          tokens.push(BinaryOperatorToken.naturalJoin(operator))
        } else if (rest.startsWith('\u2a2f')) {
          tokens.push(BinaryOperatorToken.cartesianProduct(operator))
        } else if (rest.startsWith('\u222a')) {
          tokens.push(BinaryOperatorToken.union(operator))
        } else if (rest.startsWith('\u2229')) {
          tokens.push(BinaryOperatorToken.intersection(operator))
        } else if (rest.startsWith('\\')) {
          tokens.push(BinaryOperatorToken.difference(operator))
        } else if (rest.startsWith('\u22b3')) {
          tokens.push(BinaryOperatorToken.leftAntijoin(operator))
        } else if (rest.startsWith('\u22b2')) {
          tokens.push(BinaryOperatorToken.rightAntijoin(operator))
        } else if (rest.startsWith('\u00f7')) {
          tokens.push(BinaryOperatorToken.division(operator))
        }
        rest = rest.slice(1)
        selectionExpected = false
      }
      // '<' can be a rename or left theta semi join - this "if" must be after <*
      else if (rest.startsWith('<')) {
        try {
          const split = IndexedStringUtils.nextBorderedPart(rest, '<', '>', '-')
          // saves parentheses
          pushParentheses(split.first)
          // checks whether the cursor was reached
          if (split.first.getLastIndex() === cursorIndex - 1) {
            whispers = [...this.relations.keys()]
          }
          tokens.push(UnaryOperatorToken.rename(split.first))
          selectionExpected = true
          rest = split.second
        }
        // catches error from nextBorderedPart
        catch (err) {
          // saves error
          if (err instanceof ErrorWithTextRange) {
            handleError(err)
          }
          // it fakes the unclosed expression part as a rename operator
          tokens.push(UnaryOperatorToken.rename(rest.concat(IndexedString.new('>', rest.getLastIndex() + 1))))
          // breaks the while cycle as all was used
          break
        }
      }
      // '⟨' can be a rename or left theta semi join - this "if" must be after <*
      else if (rest.startsWith('\u27e8')) {
        try {
          const split = IndexedStringUtils.nextBorderedPart(rest, '\u27e8', ']')
          // saves parentheses
          pushParentheses(split.first)
          // checks whether the cursor was reached
          if (split.first.getLastIndex() === cursorIndex - 1) {
            whispers = [...this.relations.keys()]
          }
          tokens.push(BinaryOperatorToken.leftThetaSemijoin(split.first))
          selectionExpected = false
          rest = split.second
        }
        // catches error from nextBorderedPart
        catch (err) {
          // saves error
          if (err instanceof ErrorWithTextRange) {
            handleError(err)
          }
          // it fakes the unclosed expression part as a theta join operator
          tokens.push(BinaryOperatorToken.leftThetaSemijoin(rest.concat(IndexedString.new(']', rest.getLastIndex() + 1))))
          // breaks the while cycle as all was used
          break
        }
      }
      // RELATION REFERENCE
      else if (StringUtils.isLetter(rest.charAt(0)) || rest.charAt(0) === '_') {
        const split = IndexedStringUtils.nextName(rest)

        // checks whether the cursor was reached in the relation reference string
        if (split.first.getFirstIndex() <= cursorIndex - 1 && cursorIndex - 1 <= split.first.getLastIndex()) {
          whispers = [...this.relations.keys()]
        }

        tokens.push(new RelationToken(split.first))
        rest = split.second
        selectionExpected = true
      }
      // WHITE SPACE
      else if (/\s/.exec(rest.charAt(0))) {
        let i = 0
        while (i < rest.length() && (/\s/.exec(rest.charAt(i)))) {
          if (rest.indexAt(i) === cursorIndex - 1) {
            whispers = [...this.relations.keys()]
          }
          ++i
        }
        rest = rest.slice(i)
      }
      // UNEXPECTED PART
      else {
        const split = IndexedStringUtils.nextNonWhitespacePart(rest)
        handleError(ErrorFactory.syntaxError(language().syntaxErrors.exprParser_unexpectedPart,
                    split.first.getRange(), split.first.toString()))
        // tries to skip first unexpected character
        rest = rest.slice(split.first.length())
      }
    }
    return { tokens, whispers, errors, parentheses }
  }

  /**
     * Checks the validity of the given infix token array. If doThrow is false, pushes found errors to the given errors
     * array. Fake tokens are relations with empty name "", or natural joins "*", their error ranges are undefined.
     * All faked errors are pushed in given errors array.
     * Expects validly nested parentheses: yes "(()())", no ")()", ")(". Expects not empty array.
     *
     * @param tokens token array to check
     * @param doThrow whether to throw found errors
     * @param errors array for pushing faked errors for NOT_THROW type
     */
  assertValidInfixTokens (tokens: ExprToken[], doThrow = true, errors: ErrorWithTextRange[] = []): void {
    /**
         * Handles the error described by given error code, params and range. If doThrow is true, throws the described
         * error. Otherwise, fakes it by inserting a new token at given index. The token is binary (natural join) if
         * missing is "binary", otherwise, it is a relation with empty name.
         */
    const handleError = (index: number, missing: 'binary' | 'relation',
                             msg: string[], range: StartEndPair | undefined, ...params: string[]) => {
      const error = ErrorFactory.syntaxError(msg, range, ...params)
      if (doThrow) {
        throw error
      } else if (missing === 'binary') {
        errors.push(error)
        tokens.splice(index, 0, BinaryOperatorToken.naturalJoin(IndexedString.new('*')))
      } else {
        errors.push(error)
        tokens.splice(index, 0, new RelationToken(IndexedString.new('')))
      }
    }

    // checks start of an array: it must start with '(' or relation
    if (tokens[0] instanceof UnaryOperatorToken || tokens[0] instanceof BinaryOperatorToken || tokens[0] instanceof ClosingParenthesis) {
      handleError(0, 'relation', language().syntaxErrors.exprParser_invalidStart,
                tokens[0].getRange(), tokens[0].str.toString())
    }

    // checks end of an array: it must end with ')', relation or an unary operator
    if (tokens[tokens.length - 1] instanceof OpeningParenthesis || tokens[tokens.length - 1] instanceof BinaryOperatorToken) {
      handleError(tokens.length, 'relation', language().syntaxErrors.exprParser_invalidEnd,
                tokens[tokens.length - 1].getRange(), tokens[tokens.length - 1].str.toString())
    }

    // checks adjacent pairs of tokens
    let i2 = 1
    while (i2 < tokens.length) {
      const token1: ExprToken = tokens[i2 - 1]
      const token2: ExprToken = tokens[i2]

      // valid predecessors: binary operator or '('
      if (token2 instanceof RelationToken) {
        if (token1 instanceof RelationToken) {
          handleError(i2, 'binary', language().syntaxErrors.exprParser_relationAfterRelation,
                        token2.getRange(), token2.str.toString(), token1.str.toString())
        }
        if (token1 instanceof UnaryOperatorToken) {
          handleError(i2, 'binary', language().syntaxErrors.exprParser_relationAfterUnary,
                        token2.getRange(), token2.str.toString(), token1.str.toString())
        }
        if (token1 instanceof ClosingParenthesis) {
          handleError(i2, 'binary', language().syntaxErrors.exprParser_relationAfterClosing,
                        token2.getRange(), token2.str.toString())
        }
      }
      // valid predecessors: relation, unary operator or ')'
      else if (token2 instanceof UnaryOperatorToken) {
        if (token1 instanceof BinaryOperatorToken) {
          handleError(i2, 'relation', language().syntaxErrors.exprParser_unaryAfterBinary,
                        token2.getRange(), token2.str.toString(), token1.str.toString())
        }
        if (token1 instanceof OpeningParenthesis) {
          handleError(i2, 'relation', language().syntaxErrors.exprParser_unaryAfterOpening,
                        token2.getRange(), token2.str.toString())
        }
      }
      // valid predecessors: relation, unary operator or ')'
      else if (token2 instanceof BinaryOperatorToken) {
        if (token1 instanceof BinaryOperatorToken) {
          handleError(i2, 'relation', language().syntaxErrors.exprParser_binaryAfterBinary,
                        token2.getRange(), token2.str.toString(), token1.str.toString())
        }
        if (token1 instanceof OpeningParenthesis) {
          handleError(i2, 'relation', language().syntaxErrors.exprParser_binaryAfterOpening,
                        token2.getRange(), token2.str.toString())
        }
      }
      // valid predecessors: binary operator or '('
      else if (token2 instanceof OpeningParenthesis) {
        if (token1 instanceof RelationToken) {
          handleError(i2, 'binary', language().syntaxErrors.exprParser_openingAfterRelation,
                        token2.getRange(), token1.str.toString())
        }
        if (token1 instanceof UnaryOperatorToken) {
          handleError(i2, 'binary', language().syntaxErrors.exprParser_openingAfterUnary,
                        token2.getRange(), token1.str.toString())
        }
        if (token1 instanceof ClosingParenthesis) {
          handleError(i2, 'binary', language().syntaxErrors.exprParser_openingAfterClosing,
                        token2.getRange())
        }
      }
      // valid predecessors: relation, unary operator or ')'
      else if (token2 instanceof ClosingParenthesis) {
        if (token1 instanceof BinaryOperatorToken) {
          handleError(i2, 'relation', language().syntaxErrors.exprParser_closingAfterBinary,
                        token2.getRange(), token1.str.toString())
        }
        if (token1 instanceof OpeningParenthesis) {
          handleError(i2, 'relation', language().syntaxErrors.exprParser_closingAfterOpening,
                        token2.getRange())
        }
      } else {
        throw ErrorFactory.codeError(language().codeErrors.exprParser_unexpectedToken, JSON.stringify(token2))
      }
      ++i2
    }
  }

  /**
     * Transforms given infix relation algebra expression into postfix (reverse polish) form.
     * Throws error when invalid parentheses structure is given.
     *
     * @param tokens infix relational algebra expression as Token array
     * @return postfix (reverse polish) form of given array
     */
  toRPN (tokens: ExprToken[]): ExprToken[] {
    const rpnQueue: ExprToken[] = []
    const operatorsStack: Array<BinaryOperatorToken | ParenthesisToken> = []
    tokens.forEach(token => {
      if (token instanceof RelationToken || token instanceof UnaryOperatorToken) {
        rpnQueue.push(token)
      } else if (token instanceof BinaryOperatorToken) {
        while (operatorsStack.length > 0 && operatorsStack[operatorsStack.length - 1] instanceof BinaryOperatorToken) {
          // @ts-ignore (token must be of BinaryOperatorToken class)
          const other: BinaryOperatorToken = operatorsStack[operatorsStack.length - 1]
          // all used operators have left associativity
          if (token.precedence <= other.precedence) {
            // @ts-ignore (token must be present)
            rpnQueue.push(operatorsStack.pop())
          } else {
            break
          }
        }
        operatorsStack.push(token)
      } else if (token instanceof OpeningParenthesis) {
        operatorsStack.push(token)
      } else if (token instanceof ClosingParenthesis) {
        while (true) {
          if (operatorsStack.length === 0) {
            throw ErrorFactory.syntaxError(language().syntaxErrors.exprParser_invalidParentheses,
                            undefined)
          }
          if (operatorsStack[operatorsStack.length - 1] instanceof OpeningParenthesis) {
            operatorsStack.pop()
            break
          }
          // @ts-ignore (token must be present)
          rpnQueue.push(operatorsStack.pop())
        }
      }
    })
    while (operatorsStack.length > 0) {
      // @ts-ignore (token must be present)
      const curToken: ExprToken = operatorsStack.pop()
      if (curToken instanceof OpeningParenthesis) {
        throw ErrorFactory.syntaxError(language().syntaxErrors.exprParser_invalidParentheses,
                    undefined)
      } else {
        rpnQueue.push(curToken)
      }
    }
    return rpnQueue
  }

  /**
     * Creates a RA expression evaluating tree from the given array of tokens in reverse polish form.
     * Wraps recursive function rpnToRATreeRecursive(tokens).
     * Possible errors:
     * - not all tokens were used (invalid RPN structure was given, should not happen if the previous infix structure
     * was asserted/faked) - if doThrow = false, returns a RelationNode with an empty relation
     * - reference to a relation which does not exist found - if doThrow = false, replaces it with an empty relation
     *
     * @param tokens value-evaluating expression in reverse polish form
     * @param doThrow if true and an error occurs, throws an error, if false and an error occurs, fakes it and does
     * not throw
     * @param errors array to store found errors when doThrow = false
     * @return RATreeNode tree (its root)
     */
  rpnToRATree (tokens: ExprToken[], doThrow = true, errors: ErrorWithTextRange[] = []): RATreeNode {
    const ret: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors)
    // not all tokens were used
    if (tokens.length > 0) {
      if (doThrow) {
        throw ErrorFactory.syntaxError(language().syntaxErrors.exprParser_invalidExpression, undefined)
      } else {
        return new RelationNode(new Relation(''))
      }
    }
    return ret
  }

  /**
     * Helper function for rpnToRATree.
     */
  rpnToRATreeRecursive (tokens: ExprToken[], doThrow: boolean, errors: ErrorWithTextRange[]): RATreeNode {
    if (tokens.length === 0) {
      throw ErrorFactory.syntaxError(language().syntaxErrors.exprParser_invalidExpression, undefined)
    }
    // @ts-ignore (there must be a token)
    const token: ExprToken = tokens.pop()
    // RELATION REFERENCE
    if (token instanceof RelationToken) {
      const relation: Relation | undefined = this.relations.get(token.str.toString())
      // when the relation does not exist, throws or fakes it with an empty relation
      if (relation === undefined) {
        const error = ErrorFactory.semanticError(language().semanticErrors.exprParser_relationNotDefined,
                    token.getRange(), token.str.toString())
        if (doThrow) {
          throw error
        } else {
          errors.push(error)
          return new RelationNode(new Relation(''))
        }
      }
      return new RelationNode(relation)
    }
    // UNARY OPERATORS
    if (token instanceof UnaryOperatorToken) {
      const subtree: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors)
      // @ts-ignore
      return RATreeFactory.createUnary(token.type, subtree, this.nullValuesSupport, token.str)
    }
    // BINARY OPERATORS
    if (token instanceof BinaryOperatorToken) {
      const right: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors)
      const left: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors)
      // @ts-ignore
      return RATreeFactory.createBinary(token.type, left, right, this.nullValuesSupport, token.str)
    }
    // should never happen
    throw ErrorFactory.codeError(language().codeErrors.exprParser_unexpectedToken, JSON.stringify(token))
  }
}
