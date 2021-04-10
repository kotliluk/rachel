import StringUtils from "../utils/stringUtils";
import {ComparingOperator, ComparingOperatorType} from "../vetree/comparingOperator";
import {LogicalOperator} from "../vetree/logicalOperator";
import {LiteralValue} from "../vetree/literalValue";
import {ReferenceValue} from "../vetree/referenceValue";
import {ComputingOperator} from "../vetree/computingOperator";
import {
    ClosingParentheses,
    ComparingToken,
    ComputingDivisionToken,
    ComputingMinusToken,
    ComputingMultiplicationToken,
    ComputingPlusToken,
    LiteralToken,
    LogicalAndToken,
    LogicalNotToken,
    LogicalOrToken,
    OpeningParentheses,
    OperatorToken,
    ParenthesisToken,
    ReferenceToken,
    ValueToken
} from "./valueTokens"
import {VETreeNode} from "../vetree/veTreeNode";
import {IndexedString} from "../types/indexedString";
import IndexedStringUtils from "../utils/indexedStringUtils";
import ErrorWithTextRange, {insertRangeIfUndefined} from "../error/errorWithTextRange";
import {CodeErrorCodes, ErrorFactory, SemanticErrorCodes, SyntaxErrorCodes} from "../error/errorFactory";
import RASyntaxError from "../error/raSyntaxError";

/**
 * StringUtils of string infix boolean and algebraic expression to value-evaluating tree.
 */
export default class ValueParser {

    /**
     * Parses given string infix boolean and algebraic expression into an value-evaluating tree and returns the tree.
     * Uses Shunting-yard algorithm (first, it transforms the string into reverse polish notation).
     * Supported expressions:
     * - logical: and (&&, &), or (||, |), not (!, ~)
     * - computing: addition (+), deduction (-), multiplication (*), division (/)
     * - comparing: equal (==, =), non-equal (!=, <>), less (<), more (>), less-or-equal (<=), more-or-equal (>=)
     * - literals: numbers (1, 5.02, etc.), strings ("String", "With inner \" symbol", etc.), nulls (null),
     * booleans (true, false)
     * - column references (ColumnNameAsStringWithoutQuotes, Id, etc.)
     *
     * @param str infix boolean and algebraic expression to be parsed
     * @param nullValuesSupport whether null values are supported
     * @return VETreeNode tree (its root)
     */
    public static parse(str: IndexedString, nullValuesSupport: boolean): VETreeNode {
        let tokens: ValueToken[] = ValueParser.parseTokens(str, nullValuesSupport, true);
        this.assertValidInfixTokens(tokens, true);
        tokens = this.simplify(tokens);
        try {
            const rpn: ValueToken[] = ValueParser.toRPN(tokens);
            return ValueParser.rpnToVETree(rpn);
        }
        catch (err) {
            throw insertRangeIfUndefined(err, str.getRange());
        }
    }

    /**
     * Parses given string infix boolean and algebraic expression and returns errors in it.
     * For supported operations see ValueParser.parse().
     *
     * @param str infix boolean and algebraic expression to be parsed
     * @param nullValuesSupport whether null values are supported
     * @param columns
     */
    public static fakeParse(str: IndexedString, nullValuesSupport: boolean, columns: string[]): ErrorWithTextRange[] {
        const errors: ErrorWithTextRange[] = [];
        let tokens: ValueToken[] = ValueParser.parseTokens(str, nullValuesSupport, false, errors);
        tokens.forEach(token => {
            if (token instanceof ReferenceToken && columns.indexOf(token.str.toString()) === -1) {
                errors.push(ErrorFactory.semanticError(SemanticErrorCodes.referenceValue_eval_absentColumn,
                    token.str.getRange(), token.str.toString(), columns.join(', ')));
            }
        })
        this.assertValidInfixTokens(tokens, false, errors);
        return errors;
    }

    /**
     * Parses given string infix boolean and algebraic expression into an array of Tokens.
     * Tokens are returned infix (in order parsed from string).
     * If doThrow is true, found errors are thrown. Otherwise, they are added in errors array and ignored.
     *
     * @param str infix boolean and algebraic expression to be parsed
     * @param nullValuesSupport whether null values are supported
     * @param doThrow true if errors should be thrown
     * @param errors array for storing not thrown errors
     * @return infix array of parsed Tokens
     */
    public static parseTokens(str: IndexedString, nullValuesSupport: boolean, doThrow: boolean,
                              errors: ErrorWithTextRange[] = []): ValueToken[] {
        const handleError = (error: RASyntaxError) => {
            if (doThrow) {
                throw error;
            }
            else {
                errors.push(error);
            }
        }
        let rest: IndexedString = str.trim();
        if (rest.isEmpty()) {
            handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_parseTokens_emptyInput, undefined));
        }
        const tokens: ValueToken[] = [];
        while (!rest.isEmpty()) {
            rest = rest.trim();
            // PARENTHESES
            if (rest.startsWith('(')) {
                tokens.push(new OpeningParentheses(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith(')')) {
                tokens.push(new ClosingParentheses(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            // COMPUTING OPERATORS
            else if (rest.startsWith('+')) {
                tokens.push(new ComputingPlusToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('-')) {
                tokens.push(new ComputingMinusToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('*')) {
                tokens.push(new ComputingMultiplicationToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('/')) {
                tokens.push(new ComputingDivisionToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            // COMPARING OPERATORS
            else if (rest.startsWith('==')) {
                tokens.push(new ComparingToken(ComparingOperatorType.equal, rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('=')) {     // NOTE: needs to be after '==' check
                tokens.push(new ComparingToken(ComparingOperatorType.equal, rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('!=')) {
                tokens.push(new ComparingToken(ComparingOperatorType.nonEqual, rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('<>')) {
                tokens.push(new ComparingToken(ComparingOperatorType.nonEqual, rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('<=')) {
                tokens.push(new ComparingToken(ComparingOperatorType.lessOrEqual, rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('>=')) {
                tokens.push(new ComparingToken(ComparingOperatorType.moreOrEqual, rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('<')) {
                tokens.push(new ComparingToken(ComparingOperatorType.less, rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('>')) {
                tokens.push(new ComparingToken(ComparingOperatorType.more, rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            // LOGICAL OPERATORS
            else if (rest.startsWith('!') || rest.startsWith('~')
                || rest.startsWith('\u00ac')) { // NOTE: needs to be after '!=' check
                tokens.push(new LogicalNotToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('&&')) {
                tokens.push(new LogicalAndToken(rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('&') || rest.startsWith('\u2227')) { // NOTE: needs to be after '&&' check
                tokens.push(new LogicalAndToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            else if (rest.startsWith('||')) {
                tokens.push(new LogicalOrToken(rest.slice(0, 2)));
                rest = rest.slice(2);
            }
            else if (rest.startsWith('|') || rest.startsWith('\u2228')) { // NOTE: needs to be after '||' check
                tokens.push(new LogicalOrToken(rest.slice(0, 1)));
                rest = rest.slice(1);
            }
            // LITERALS
            else if (rest.startsWith('"')) {
                const split = IndexedStringUtils.nextQuotedString(rest);
                if (split.error !== undefined) {
                    handleError(split.error);
                }
                const end = split.first.length() > 1 ? -1 : undefined;
                const str = split.first.slice(1, end);
                tokens.push(new LiteralToken(str, str.toString(), "string"));
                rest = split.second;
            }
            else if (StringUtils.isDigit(rest.charAt(0))) {
                let split = IndexedStringUtils.nextNumber(rest);
                tokens.push(new LiteralToken(split.first, Number(split.first.toString()), "number"));
                rest = split.second;
            }
            else if (rest.startsWith('null')) {
                if (!nullValuesSupport) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_parseTokens_unsupportedNull,
                        rest.slice(0, 4).getRange()));
                }
                tokens.push(new LiteralToken(rest.slice(0, 4), null, "null"));
                rest = rest.slice(4);
            }
            else if (rest.startsWith('true') || rest.startsWith('True') || rest.startsWith('TRUE')) {
                tokens.push(new LiteralToken(rest.slice(0, 4), true, "boolean"));
                rest = rest.slice(4);
            }
            else if (rest.startsWith('false') || rest.startsWith('False') || rest.startsWith('FALSE')) {
                tokens.push(new LiteralToken(rest.slice(0, 5), false, "boolean"));
                rest = rest.slice(5);
            }
            // COLUMN REFERENCE
            else if (StringUtils.isLetter(rest.charAt(0)) || rest.charAt(0) === '_') {
                let split = IndexedStringUtils.nextName(rest);
                tokens.push(new ReferenceToken(split.first));
                rest = split.second;
            }
            // UNEXPECTED PART
            else {
                const split = IndexedStringUtils.nextNonWhitespacePart(rest);
                handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_parseTokens_unexpectedPart,
                    split.first.getRange(), split.first.toString()));
                rest = rest.slice(split.first.length());
            }
        }
        return tokens;
    }

    /**
     * It checks whether all adjacent pairs of tokens are possible and if the array start and end are valid
     * (e.i., it starts with '(', literal, column reference or '!' and it ends with ')', literal or column reference).
     * If doThrow is true, found errors are thrown. Otherwise, they are added in errors array and ignored.
     */
    public static assertValidInfixTokens(tokens: ValueToken[], doThrow: boolean, errors: ErrorWithTextRange[] = []) {
        if (tokens.length === 0) {
            return;
        }
        
        const handleError = (error: RASyntaxError) => {
            if (doThrow) {
                throw error;
            }
            else {
                errors.push(error);
            }
        }
        
        // checks start of an array: it must start with '(', literal, reference or '!'
        // it cannot start with binary operator or ')'
        if ((tokens[0] instanceof ClosingParentheses) || ((tokens[0] instanceof OperatorToken) && !(tokens[0] instanceof LogicalNotToken))) {
            handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_invalidStart,
                tokens[0].getRange(), tokens[0].str.toString()));
        }
        // checks end of an array: it must end with ')', literal or reference
        // it cannot end with operator or '('
        if ((tokens[tokens.length - 1] instanceof OpeningParentheses) || (tokens[tokens.length - 1] instanceof OperatorToken)) {
            handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_invalidEnd,
                tokens[tokens.length - 1].getRange(), tokens[tokens.length - 1].str.toString()));
        }
        // checks adjacent pairs of tokens
        let i2: number = 1;
        while (i2 < tokens.length) {
            const token1: ValueToken = tokens[i2 - 1];
            const token2: ValueToken = tokens[i2];
            ++i2;

            // valid predecessors: operator or '('
            // invalid predecessors: literal, reference or ')'
            if (token2 instanceof LiteralToken) {
                if (token1 instanceof LiteralToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_literalAfterLiteral,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof ReferenceToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_literalAfterReference,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof ClosingParentheses) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_literalAfterClosing,
                        token2.getRange(), token2.str.toString()));
                }
            }
            // valid predecessors: operator or '('
            // invalid predecessors: literal, reference or ')'
            else if (token2 instanceof ReferenceToken) {
                if (token1 instanceof LiteralToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_referenceAfterLiteral,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof ReferenceToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_referenceAfterReference,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof ClosingParentheses) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_referenceAfterClosing,
                        token2.getRange(), token2.str.toString()));
                }
            }
            // valid predecessors: operator or '('
            // invalid predecessors: literal, reference or ')'
            else if (token2 instanceof LogicalNotToken) {
                if (token1 instanceof LiteralToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_notAfterLiteral,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof ReferenceToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_notAfterReference,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof ClosingParentheses) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_notAfterClosing,
                        token2.getRange(), token2.str.toString()));
                }
            }
            // valid predecessors: literal, reference or ')'
            // invalid predecessors: operator or '('
            else if (token2 instanceof OperatorToken /* only binary (without LogicalNotToken) */ ) {
                if (token1 instanceof OperatorToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_binaryAfterOperator,
                        token2.getRange(), token2.str.toString(), token1.str.toString()));
                }
                if (token1 instanceof OpeningParentheses) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_binaryAfterOpening,
                        token2.getRange(), token2.str.toString()));
                }
            }
            // valid predecessors: operator or '('
            // invalid predecessors: literal, reference or ')'
            else if (token2 instanceof OpeningParentheses) {
                if (token1 instanceof LiteralToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_openingAfterLiteral,
                        token2.getRange(), token1.str.toString()));
                }
                if (token1 instanceof ReferenceToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_openingAfterReference,
                        token2.getRange(), token1.str.toString()));
                }
                if (token1 instanceof ClosingParentheses) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_openingAfterClosing,
                        token2.getRange()));
                }
            }
            // valid predecessors: literal or reference
            // invalid predecessors: operator, '(' or ')'
            else if (token2 instanceof ClosingParentheses) {
                if (token1 instanceof OperatorToken) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_closingAfterOperator,
                        token2.getRange(), token1.str.toString()));
                }
                if (token1 instanceof OpeningParentheses) {
                    handleError(ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_closingAfterOpening,
                        token2.getRange()));
                }
            }
        }
    }

    /**
     * Simplifies given token array in infix form. That means all groups of LogicalNotTokens ('!') are reduced to 1 or 0
     * tokens ("!" => "!", "!!" => "", "!!!" => "!", "!!!!" => "", ...).
     *
     * @param tokens tokens to simplify
     */
    public static simplify(tokens: ValueToken[]): ValueToken[] {
        const notIndexes: number[] = [];
        const indexesToRemove: Set<number> = new Set<number>();
        // finds indexes in tokens where '!'s are
        tokens.forEach((token, i) => {
            if (token instanceof LogicalNotToken) {
                notIndexes.push(i);
            }
        });
        for (let i = 1; i < notIndexes.length; ++i) {
            // if there is "x - 1" and "x" next to each other, adds them to remove
            if (notIndexes[i - 1] + 1 === notIndexes[i]) {
                indexesToRemove.add(notIndexes[i - 1]);
                indexesToRemove.add(notIndexes[i]);
                notIndexes[i] = NaN; // sets to NaN to not remove possible third '!' in a row
            }
        }
        if (indexesToRemove.size === 0) {
            return tokens;
        }
        return tokens.filter((t, i) => !indexesToRemove.has(i));
    }

    /**
     * Transforms given infix boolean and algebraic expression into postfix (reverse polish) form.
     *
     * @param tokens infix boolean and algebraic expression as Token array
     * @return postfix (reverse polish) form of given array
     */
    public static toRPN(tokens: ValueToken[]): ValueToken[] {
        const rpnQueue: ValueToken[] = [];
        const operatorsStack: Array<OperatorToken | ParenthesisToken> = [];
        tokens.forEach(token => {
            if (token instanceof LiteralToken || token instanceof ReferenceToken) {
                rpnQueue.push(token);
            }
            else if (token instanceof OperatorToken) {
                while (operatorsStack.length > 0 && operatorsStack[operatorsStack.length - 1] instanceof OperatorToken) {
                    // @ts-ignore (token must be of OperatorToken class)
                    let other: OperatorToken = operatorsStack[operatorsStack.length - 1];
                    // all used operators have left associativity
                    if (token.precedence <= other.precedence) {
                        // @ts-ignore (token must be present)
                        rpnQueue.push(operatorsStack.pop());
                    }
                    else {
                        break;
                    }
                }
                operatorsStack.push(token);
            }
            else if (token instanceof OpeningParentheses) {
                operatorsStack.push(token);
            }
            else if (token instanceof ClosingParentheses) {
                while (true) {
                    if (operatorsStack.length === 0) {
                        throw ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_toRPN_missingOpeningParenthesis,
                            undefined);
                    }
                    if (operatorsStack[operatorsStack.length - 1] instanceof OpeningParentheses) {
                        operatorsStack.pop();
                        break;
                    }
                    // @ts-ignore (token must be present)
                    rpnQueue.push(operatorsStack.pop());
                }
            }
        });
        while (operatorsStack.length > 0) {
            // @ts-ignore (token must be present)
            const curToken: ValueToken = operatorsStack.pop();
            if (curToken instanceof OpeningParentheses) {
                throw ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_toRPN_missingClosingParenthesis,
                    undefined);
            }
            else {
                rpnQueue.push(curToken);
            }
        }
        return rpnQueue;
    }

    /**
     * Creates a value-evaluating tree from the given array of tokens in reverse polish form.
     * Wraps recursive function rpnToVETreeRecursive(tokens), when not all tokens are used, throws error.
     *
     * @param tokens value-evaluating expression in reverse polish form
     * @return VETreeNode tree (its root)
     */
    public static rpnToVETree(tokens: ValueToken[]): VETreeNode {
        const ret: VETreeNode = this.rpnToVETreeRecursive(tokens);
        // not all tokens were used
        if (tokens.length > 0) {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_invalidExpression, undefined);
        }
        return ret;
    }

    /**
     * Creates a value-evaluating tree from the given array of tokens in reverse polish form.
     *
     * @param tokens value-evaluating expression in reverse polish form
     * @return VETreeNode tree (its root)
     */
    public static rpnToVETreeRecursive(tokens: ValueToken[]): VETreeNode {
        if (tokens.length === 0) {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.valueParser_rpnToVETree_invalidExpression, undefined);
        }
        // @ts-ignore (there must be a token)
        const token: ValueToken = tokens.pop();
        if (token instanceof LogicalNotToken) {
            const subtree: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return LogicalOperator.not(token.str, subtree);
        }
        if (token instanceof LogicalAndToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return LogicalOperator.and(token.str, left, right);
        }
        if (token instanceof LogicalOrToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return LogicalOperator.or(token.str, left, right);
        }
        if (token instanceof ComparingToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return new ComparingOperator(token.type, token.str, left, right);
        }
        if (token instanceof LiteralToken) {
            return new LiteralValue(token.value, token.type);
        }
        if (token instanceof ReferenceToken) {
            return new ReferenceValue(token.str);
        }
        if (token instanceof ComputingPlusToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return ComputingOperator.add(left, right, token.getRange());
        }
        if (token instanceof ComputingMinusToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return ComputingOperator.deduct(left, right, token.getRange());
        }
        if (token instanceof ComputingMultiplicationToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return ComputingOperator.multiply(left, right, token.getRange());
        }
        if (token instanceof ComputingDivisionToken) {
            const right: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            const left: VETreeNode = ValueParser.rpnToVETreeRecursive(tokens);
            return ComputingOperator.divide(left, right, token.getRange());
        }
        // should never happen
        throw ErrorFactory.codeError(CodeErrorCodes.valueParser_rpnToVETreeRecursive_unexpectedToken, JSON.stringify(token));
    }
}