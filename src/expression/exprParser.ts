import Relation from "../relation/relation";
import {CodeErrorCodes, ErrorFactory, SemanticErrorCodes, SyntaxErrorCodes} from "../error/errorFactory";
import {
    BinaryOperatorToken,
    ClosingParentheses,
    ExprToken,
    OpeningParentheses,
    ParenthesisToken,
    RelationToken,
    UnaryOperatorToken
} from "./exprTokens";
import Parser from "../tools/parser";
import CodeError from "../error/codeError";
import RATreeNode from "../ratree/raTreeNode";
import RelationNode from "../ratree/relationNode";
import {
    containsAny,
    getRange,
    IndexedString,
    isEmpty,
    nextBorderedPart
} from "../tools/indexedString";
import ParserIndexed from "../tools/parserIndexed";
import ErrorWithTextRange from "../error/errorWithTextRange";
import RATreeFactory from "../ratree/raTreeFactory";

/**
 * Assertion types for assertValidInfixTokens function.
 */
enum AssertType {
    NOT_THROW,
    THROW_STRICT,
    THROW_NOT_STRICT
}

/**
 * Parser of relational algebra expressions. Provides parsing function parse(String expr) and additional
 * helping functions and predicates. Uses IndexedString to describe error ranges in thrown errors.
 */
export class ExprParser {

    /**
     * Creates a parser with given source relations.
     *
     * @param relations Map with relations' names as keys and relation themselves as values used as source for leave nodes
     * @param nullValuesSupport whether to support null values
     */
    public constructor(readonly relations: Map<string, Relation>, readonly nullValuesSupport: boolean) {}

    /**
     * Parses given relational algebra expression 'expr' and returns tree of RA operations.
     * Expression is expected to respect following constraints:
     * - all relation's and column's names contain letters, numbers and underscores only
     * - all relation's and column's names start with a letter
     * - used operations must be in a practical notation and be well-structured
     * - comment begins with '//' and ends with newline
     *
     * Supported operations are:
     * - projection of columns: Relation[projectedColumn1, ...]
     * - selection of rows: Relation(condition)
     * - rename of columns: Relation<oldName -> newName, ...>
     * - cartesian product: A \u2a2f B
     * - natural join: A * B
     * - theta join: A [condition] B
     * - left and right semijoin: A <* B and A *> B
     * - left and right antijoin: A \u22b3 B and A \u22b2 B
     * - left and right theta semijoin: A <condition] B and A [condition> B
     * - division: A \u00f7 B
     * - left, right and full outer join: A *L* B, A *R* B and A *F* B
     * - union, intersection and difference: A \u222a B, A \u2229 B and A \ B
     *
     * See ValueParser for condition constraints.
     *
     * @param expr relational algebra expression in expected format
     * @return tree structure of 'expr'
     */
    public parse(expr: string): RATreeNode {
        expr = Parser.deleteCommentLines(expr);
        if (expr.trim() === "") {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_parse_emptyStringGiven, undefined);
        }
        const tokens: ExprToken[] = this.parseTokens(expr);
        this.assertValidInfixTokens(tokens, AssertType.THROW_STRICT);
        const rpn: ExprToken[] = this.toRPN(tokens);
        return this.rpnToRATree(rpn, true);
    }

    /**
     * Indexed version of ExprParser.parse() function. Uses IndexedString to describe error ranges.
     * See ExprParser.parse for detailed description.
     *
     * @param expr relational algebra expression in expected format
     * @return tree structure of 'expr'
     */
    public indexedParse(expr: string): RATreeNode {
        const indexedExpr = ParserIndexed.deleteCommentLines(IndexedString.new(expr));
        if (indexedExpr.trim().isEmpty()) {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_parse_emptyStringGiven, undefined);
        }
        const tokens: ExprToken[] = this.parseTokens(indexedExpr);
        this.assertValidInfixTokens(tokens, AssertType.THROW_STRICT);
        const rpn: ExprToken[] = this.toRPN(tokens);
        return this.rpnToRATree(rpn, true);
    }

    /**
     * Parses given expression and finds words to whisper for the given cursorIndex.
     * If the cursor is located next to any RA operator, returns list of all defined relation names.
     * If the cursor is located inside any RA operator, which uses relation columns, returns list of available column
     * names at given place.
     * If a parsing error occurs, it is faked to work or ignored and reported in returning errors array.
     */
    public fakeParse(expr: string, cursorIndex: number): {whispers: string[], errors: ErrorWithTextRange[]} {
        const indexedExpr = ParserIndexed.deleteCommentLines(IndexedString.new(expr));
        if (indexedExpr.trim().isEmpty()) {
            return {whispers: [], errors: []};
        }
        const {whispers, tokens, errors} = this.fakeParseTokens(indexedExpr, cursorIndex);
        // prevent errors in creation of RPN
        if (tokens.length === 0) {
            return {whispers: [], errors: errors};
        }
        // fakes found errors to valid parse
        this.assertValidInfixTokens(tokens, AssertType.NOT_THROW, errors);
        const rpn: ExprToken[] = this.toRPN(tokens);
        const raTree: RATreeNode = this.rpnToRATree(rpn, false, errors);
        // tries to find whispers inside RA operations with parameters
        const innerResult: {whispers: string[], errors: ErrorWithTextRange[]} = raTree.fakeEval(cursorIndex);
        errors.push(...innerResult.errors);
        // if there are whispers from inner operators, returns them
        if (innerResult.whispers.length > 0) {
            return {whispers: innerResult.whispers, errors: errors};
        }
        // otherwise returns outer whispers (or empty array if no were found)
        return {whispers: whispers, errors: errors};
    }

    /**
     * Given expression string is expected to be without comment lines and not empty.
     *
     * @param expr IndexedString to parse the expression from
     * @param selectionExpected true if next part "(...)" should be treated as a selection = last part
     * was a relation or an unary operator (default false)
     */
    public parseTokens(expr: string | IndexedString, selectionExpected: boolean = false): ExprToken[] {
        let tokens: ExprToken[] = [];
        // alternative solution in case of finding "[...]"
        let alternativeTokens: ExprToken[] = [];
        let rest: string | IndexedString = expr;

        while (!isEmpty(rest)) {
            rest = rest.trim();
            // '(' can be a selection or a parentheses
            if (rest.startsWith("(")) {
                const split = nextBorderedPart(rest, '(', ')');
                // whole "(...)" part pushed as selection
                if (selectionExpected) {
                    tokens.push(UnaryOperatorToken.selection(split.first));
                }
                // inner of "(...)" part parsed as parentheses structure
                else {
                    tokens.push(new OpeningParentheses(split.first.slice(0, 1)));
                    tokens.push(...this.parseTokens(split.first.slice(1, -1)));
                    tokens.push(new ClosingParentheses(split.first.slice(-1)));
                    selectionExpected = true;
                }
                rest = split.second;
            }
            // '[' can be a projection, theta join, or right theta semi join
            else if (rest.startsWith("[")) {
                const split = nextBorderedPart(rest, '[', ']>');
                // right theta semijoin found
                if (split.first.endsWith('>')) {
                    tokens.push(BinaryOperatorToken.rightThetaSemijoin(split.first));
                    selectionExpected = false;
                    rest = split.second;
                }
                // the expression cannot end with a theta join (right source expected)
                else if (isEmpty(split.second)) {
                    tokens.push(UnaryOperatorToken.projection(split.first));
                    break;
                }
                // it is no known yet whether it is a projection or a theta join, recursively tries both possibilities
                else {
                    let errorAlternative: Error | undefined;
                    let error: Error | undefined;

                    // 1: treat as Theta join (it must copy tokens first)
                    try {
                        alternativeTokens.push(...tokens);
                        alternativeTokens.push(BinaryOperatorToken.thetaJoin(split.first));
                        alternativeTokens.push(...this.parseTokens(split.second, false));
                    }
                    catch (err) {
                        if (err instanceof CodeError) {
                            throw err;
                        }
                        errorAlternative = err;
                    }

                    // 2: treat as Projection
                    try {
                        tokens.push(UnaryOperatorToken.projection(split.first));
                        tokens.push(...this.parseTokens(split.second, true));
                    }
                    catch (err) {
                        if (err instanceof CodeError) {
                            throw err;
                        }
                        error = err;
                    }

                    // both branches have error - reports it to user
                    if (errorAlternative !== undefined && error !== undefined) {
                        // when errors were the same, throws one of them
                        if (errorAlternative.message === error.message) {
                            throw error;
                        }
                        // when errors were different, joins them
                        throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_parseTokens_bothBranchesError,
                            undefined, split.first.toString(), error.message, errorAlternative.message);
                    }
                    // does not use alternative tokens after error
                    if (errorAlternative !== undefined) {
                        alternativeTokens = [];
                    }
                    // uses alternative tokens after error in second branch
                    if (error !== undefined) {
                        tokens = alternativeTokens;
                        alternativeTokens = [];
                    }
                    // breaks the while - the rest was parsed recursively
                    break;
                }
            }
            // BINARY OPERATORS
            else if (rest.startsWith("*F*") || rest.startsWith("*L*") || rest.startsWith("*R*")) {
                if (!this.nullValuesSupport) {
                    let errorRange: {start: number, end: number} | undefined = undefined;
                    if (rest instanceof IndexedString && rest.getFirstNonNaNIndex() !== undefined) {
                        // @ts-ignore
                        errorRange = {start: rest.getFirstNonNaNIndex(), end: rest.getFirstNonNaNIndex() + 2};
                    }
                    throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_parseTokens_outerJoinWhenNullNotSupported,
                        errorRange, "*F*");
                }
                if (rest.startsWith("*F")) {
                    tokens.push(BinaryOperatorToken.fullOuterJoin(rest.slice(0, 3)));
                }
                else if (rest.startsWith("*L")) {
                    tokens.push(BinaryOperatorToken.leftOuterJoin(rest.slice(0, 3)));
                }
                else {
                    tokens.push(BinaryOperatorToken.rightOuterJoin(rest.slice(0, 3)));
                }
                rest = rest.slice(3);
                selectionExpected = false;
            }
            else if (rest.startsWith("<*")) {
                tokens.push(BinaryOperatorToken.leftSemijoin(rest.slice(0, 2)));
                rest = rest.slice(2);
                selectionExpected = false;
            }
            else if (rest.startsWith("*>")) {
                tokens.push(BinaryOperatorToken.rightSemijoin(rest.slice(0, 2)));
                rest = rest.slice(2);
                selectionExpected = false;
            }
            else if (rest.startsWith("*")) {
                tokens.push(BinaryOperatorToken.naturalJoin(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\u2a2f")) {
                tokens.push(BinaryOperatorToken.cartesianProduct(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\u222a")) {
                tokens.push(BinaryOperatorToken.union(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\u2229")) {
                tokens.push(BinaryOperatorToken.intersection(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\\")) {
                tokens.push(BinaryOperatorToken.difference(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\u22b3")) {
                tokens.push(BinaryOperatorToken.leftAntijoin(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\u22b2")) {
                tokens.push(BinaryOperatorToken.rightAntijoin(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            else if (rest.startsWith("\u00f7")) {
                tokens.push(BinaryOperatorToken.division(rest.slice(0, 1)));
                rest = rest.slice(1);
                selectionExpected = false;
            }
            // '<' can be a rename or left theta semi join - this "if" must be after <* and *>
            else if (rest.startsWith('<')) {
                const split = nextBorderedPart(rest, '<', '>]', '-');
                if (split.first.endsWith('>')) {
                    tokens.push(UnaryOperatorToken.rename(split.first));
                    selectionExpected = true;
                }
                else {
                    tokens.push(BinaryOperatorToken.leftThetaSemijoin(split.first));
                    selectionExpected = false;
                }
                rest = split.second;
            }
            // RELATION REFERENCE
            else if (Parser.isLetter(rest.charAt(0)) || rest.charAt(0) === '_') {
                const split = (rest instanceof IndexedString) ? ParserIndexed.nextName(rest) : Parser.nextName(rest);
                tokens.push(new RelationToken(split.first));
                rest = split.second;
                selectionExpected = true;
            }
            // UNEXPECTED PART
            else {
                const split = (rest instanceof IndexedString) ? ParserIndexed.nextNonWhitespacePart(rest) : Parser.nextNonWhitespacePart(rest);
                throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_parseTokens_unexpectedPart,
                    getRange(split.first), split.first.toString());
            }
        }
        // checks whether alternative tokens are valid when used
        if (alternativeTokens.length > 0) {
            try {
                // assert not strict validity (because this can be in nested recursion call where some rules are not held)
                this.assertValidInfixTokens(alternativeTokens, AssertType.THROW_NOT_STRICT, []);
                // if error not thrown, returns alternative tokens
                return alternativeTokens;
            }
            catch (ignored) {}
        }
        // when alternative tokens are not set or valid, returns tokens
        return tokens;
    }

    /**
     * Parses given expression to ExprToken array. While parsing, it tries to find cursor index and returns whispers.
     * Parsing errors are not thrown but stored in errors array.
     *
     * @param expr IndexedString to parse the expression from
     * @param cursorIndex
     * @param selectionExpected true if next part "(...)" should be treated as a selection = last part
     * was a relation or an unary operator (default false)
     */
    public fakeParseTokens(expr: IndexedString, cursorIndex: number, selectionExpected: boolean = false):
        { tokens: ExprToken[], whispers: string[], errors: ErrorWithTextRange[] } {
        // found whispers
        let whispers: string[] = [];

        let tokens: ExprToken[] = [];
        let errors: ErrorWithTextRange[] = [];
        let rest: IndexedString = expr;

        while (!rest.isEmpty()) {
            // checks whether the cursor was reached
            const restStartIndex: number | undefined = rest.getFirstNonNaNIndex();
            if (restStartIndex === cursorIndex) {
                whispers = [...this.relations.keys()];
            }

            rest = rest.trim();
            // '(' can be a selection or a parentheses
            if (rest.startsWith("(")) {
                let split: {first: IndexedString, second: IndexedString};
                try {
                    split = ParserIndexed.nextBorderedPart(rest, '(', ')');
                }
                // catches error from nextBorderedPart
                catch (err) {
                    // saves error
                    if (err instanceof ErrorWithTextRange) {
                        errors.push(err);
                    }

                    if (selectionExpected) {
                        // it fakes the unclosed expression part as a selection operator
                        // pushes space with valid index and parentheses with NaN index for expected behavior (error
                        // indexing) in fakeEval in selection/theta join nodes and fakeEval in ValueParser
                        tokens.push(UnaryOperatorToken.selection(rest.concat(IndexedString.newFromArray([
                            {char: ' ', index: rest.getNextIndexOrNaN()}, {char: ')', index: NaN}]))));
                    }
                    else {
                        // checks whether the cursor was reached after the opening parentheses
                        if (restStartIndex === cursorIndex - 1) {
                            whispers = [...this.relations.keys()];
                        }

                        // it fakes the unclosed expression as nested expression in parentheses
                        tokens.push(new OpeningParentheses(rest.slice(0, 1)));
                        // parses inner part between parentheses
                        const recursiveReturn = this.fakeParseTokens(rest.slice(1), cursorIndex);
                        errors.push(...recursiveReturn.errors);
                        whispers.push(...recursiveReturn.whispers);
                        tokens.push(...recursiveReturn.tokens);
                        // gives invalid index (NaN for not reporting errors with this imaginary parentheses
                        tokens.push(new ClosingParentheses(IndexedString.new(')', NaN)));
                    }
                    // breaks the while cycle because rest was parsed recursively
                    break;
                }

                // whole "(...)" part pushed as selection
                if (selectionExpected) {
                    tokens.push(UnaryOperatorToken.selection(split.first));
                }
                // inner of "(...)" part parsed as parentheses structure
                else {
                    tokens.push(new OpeningParentheses(split.first.slice(0, 1)));
                    const recursiveReturn = this.fakeParseTokens(split.first.slice(1, -1), cursorIndex);
                    errors.push(...recursiveReturn.errors);
                    whispers.push(...recursiveReturn.whispers);
                    tokens.push(...recursiveReturn.tokens);
                    tokens.push(new ClosingParentheses(split.first.slice(-1)));
                    selectionExpected = true;
                }
                rest = split.second;
            }
            // '[' can be a projection, theta join, or right theta semi join
            else if (rest.startsWith("[")) {
                let split: {first: IndexedString, second: IndexedString};
                let error: boolean = false;
                try {
                    split = ParserIndexed.nextBorderedPart(rest, '[', ']>');
                }
                    // catches error from nextBorderedPart
                catch (err) {
                    // saves error
                    if (err instanceof ErrorWithTextRange) {
                        errors.push(err);
                    }
                    // it fakes the unclosed expression part as a projection operator
                    //tokens.push(UnaryOperatorToken.projection(rest.concat(IndexedString.new(']', rest.getNextIndexOrNaN()))));
                    // breaks the while cycle because the whole rest was used
                    //break;
                    error = true;
                    split = {first: rest.concat(IndexedString.new(']', rest.getNextIndexOrNaN())), second: IndexedString.empty()};
                }

                // checks whether the cursor was reached
                const operatorEndIndex: number | undefined = split.first.getLastNonNaNIndex();
                if (!error && operatorEndIndex === cursorIndex - 1) {
                    whispers = [...this.relations.keys()];
                }

                // right theta semijoin found "[...>"
                if (split.first.endsWith('>')) {
                    tokens.push(BinaryOperatorToken.rightThetaSemijoin(split.first));
                    selectionExpected = false;
                    rest = split.second;
                }
                // the expression cannot end with a theta join (theta join expects right source)
                else if (split.second.isEmpty()) {
                    tokens.push(UnaryOperatorToken.projection(split.first));
                    // breaks the while cycle because the whole rest was used
                    break;
                }
                // if the next part contains any character from =<>+/*&|~"()! it cannot be a valid Projection
                else if (containsAny(split.first, '=<>+/*&|~"()!')) {
                    tokens.push(BinaryOperatorToken.thetaJoin(split.first));
                    selectionExpected = false;
                    rest = split.second;
                }
                // else suppose it is a projection
                else {
                    tokens.push(UnaryOperatorToken.projection(split.first));
                    selectionExpected = true;
                    rest = split.second;
                }
            }
            // BINARY OPERATORS
            else if (rest.startsWith("*F*") || rest.startsWith("*L*") || rest.startsWith("*R*")) {
                const operator: IndexedString = rest.slice(0, 3);
                // checks whether the cursor was reached
                const operatorEndIndex: number | undefined = operator.getLastNonNaNIndex();
                if (operatorEndIndex === cursorIndex - 1) {
                    whispers = [...this.relations.keys()];
                }

                if (rest.startsWith("*F")) {
                    tokens.push(BinaryOperatorToken.fullOuterJoin(operator));
                }
                else if (rest.startsWith("*L")) {
                    tokens.push(BinaryOperatorToken.leftOuterJoin(operator));
                }
                else {
                    tokens.push(BinaryOperatorToken.rightOuterJoin(operator));
                }
                rest = rest.slice(3);
                selectionExpected = false;
            }
            // operators of 2 characters
            else if (rest.startsWith("<*") || rest.startsWith("*>")) {
                const operator: IndexedString = rest.slice(0, 2);
                // checks whether the cursor was reached
                const operatorEndIndex: number | undefined = operator.getLastNonNaNIndex();
                if (operatorEndIndex === cursorIndex - 1) {
                    whispers = [...this.relations.keys()];
                }

                if (rest.startsWith("<*")) {
                    tokens.push(BinaryOperatorToken.leftSemijoin(operator));
                }
                else {
                    tokens.push(BinaryOperatorToken.rightSemijoin(operator));
                }
                rest = rest.slice(2);
                selectionExpected = false;
            }
            // operators of 1 character
            else if ("*\u2a2f\u222a\u2229\\\u22b3\u22b2\u00f7".indexOf(rest.charAt(0)) > -1) {
                const operator: IndexedString = rest.slice(0, 1);
                // checks whether the cursor was reached
                const operatorEndIndex: number | undefined = operator.getLastNonNaNIndex();
                if (operatorEndIndex === cursorIndex - 1) {
                    whispers = [...this.relations.keys()];
                }

                if (rest.startsWith("*")) {
                    tokens.push(BinaryOperatorToken.naturalJoin(operator));
                }
                else if (rest.startsWith("\u2a2f")) {
                    tokens.push(BinaryOperatorToken.cartesianProduct(operator));
                }
                else if (rest.startsWith("\u222a")) {
                    tokens.push(BinaryOperatorToken.union(operator));
                }
                else if (rest.startsWith("\u2229")) {
                    tokens.push(BinaryOperatorToken.intersection(operator));
                }
                else if (rest.startsWith("\\")) {
                    tokens.push(BinaryOperatorToken.difference(operator));
                }
                else if (rest.startsWith("\u22b3")) {
                    tokens.push(BinaryOperatorToken.leftAntijoin(operator));
                }
                else if (rest.startsWith("\u22b2")) {
                    tokens.push(BinaryOperatorToken.rightAntijoin(operator));
                }
                else if (rest.startsWith("\u00f7")) {
                    tokens.push(BinaryOperatorToken.division(operator));
                }
                rest = rest.slice(1);
                selectionExpected = false;
            }
            // '<' can be a rename or left theta semi join - this "if" must be after <*
            else if (rest.startsWith('<')) {
                try {
                    const split = ParserIndexed.nextBorderedPart(rest, '<', '>]', '-');
                    // found rename
                    if (split.first.endsWith('>')) {
                        // checks whether the cursor was reached - after unary rename operator it does not whisper
                        const operatorEndIndex: number | undefined = split.first.getLastNonNaNIndex();
                        if (operatorEndIndex === cursorIndex - 1) {
                            whispers = [];
                        }

                        tokens.push(UnaryOperatorToken.rename(split.first));
                        selectionExpected = true;
                    }
                    // found left theta semi join
                    else {
                        // checks whether the cursor was reached
                        const operatorEndIndex: number | undefined = split.first.getLastNonNaNIndex();
                        if (operatorEndIndex === cursorIndex - 1) {
                            whispers = [...this.relations.keys()];
                        }

                        tokens.push(BinaryOperatorToken.leftThetaSemijoin(split.first));
                        selectionExpected = false;
                    }
                    rest = split.second;
                }
                    // catches error from nextBorderedPart
                catch (e) {
                    // it fakes the unclosed expression part as a rename operator
                    tokens.push(UnaryOperatorToken.rename(rest.concat(IndexedString.new('>', rest.getNextIndexOrNaN()))));
                    // breaks the while cycle as all was used
                    break;
                }
            }
            // RELATION REFERENCE
            else if (Parser.isLetter(rest.charAt(0)) || rest.charAt(0) === '_') {
                const split = ParserIndexed.nextName(rest);

                // checks whether the cursor was reached in the relation reference string
                const relationStartIndex: number | undefined = split.first.getFirstNonNaNIndex();
                const relationEndIndex: number | undefined = split.first.getLastNonNaNIndex();
                if (typeof relationStartIndex === "number" && typeof relationEndIndex === "number" &&
                    relationStartIndex <= cursorIndex - 1 && cursorIndex - 1 <= relationEndIndex) {
                    whispers = [...this.relations.keys()];
                }

                tokens.push(new RelationToken(split.first));
                rest = split.second;
                selectionExpected = true;
            }
            // UNEXPECTED PART
            else {
                const split = ParserIndexed.nextNonWhitespacePart(rest);
                errors.push(ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_parseTokens_unexpectedPart,
                    getRange(split.first), split.first.toString()));
                // tries to skip first unexpected character
                rest = rest.slice(split.first.length());
            }
        }
        return { tokens, whispers, errors };
    }

    /**
     * Checks the validity of the given infix token array.
     * If the type is THROW_STRICT or THROW_NOT_STRICT, it throws found errors. Strict version checks the first
     * token in the array, not strict version does not. In both throw version is the errors parameter ignored.
     * If the type is NOT_THROW, it adds fake tokens if the array is not valid.
     * Fake tokens are relations with empty name "", or natural joins "*", their error ranges are undefined.
     * All faked errors are reported pushed in given errors array.
     * Expects validly nested parentheses: yes "(()())", no ")()", ")(". Expects not empty array.
     *
     * @param tokens token array to check
     * @param type type of the assertion
     * @param errors array for pushing faked errors for NOT_THROW type
     */
    public assertValidInfixTokens(tokens: ExprToken[], type: AssertType, errors: ErrorWithTextRange[] = []): void {
        /**
         * Handles the error described by given error code, params and range. If doThrow is true, throws the described
         * error. Otherwise, fakes it by inserting a new token at given index. The token is binary (natural join) if
         * missing is "binary", otherwise, it is a relation with empty name.
         */
        const handleError = (index: number, missing: "binary" | "relation",
                             code: SyntaxErrorCodes, range: {start: number, end: number} | undefined, ...params: string[]) => {
            const error = ErrorFactory.syntaxError(code, range, ...params);
            if (type !== AssertType.NOT_THROW) {
                throw error;
            }
            else if (missing === "binary") {
                errors.push(error);
                tokens.splice(index, 0, BinaryOperatorToken.naturalJoin("*"));
            }
            else {
                errors.push(error);
                tokens.splice(index, 0, new RelationToken(""));
            }
        }

        if (type !== AssertType.THROW_NOT_STRICT) {
            // checks start of an array: it must start with '(' or relation
            if (tokens[0] instanceof UnaryOperatorToken || tokens[0] instanceof BinaryOperatorToken || tokens[0] instanceof ClosingParentheses) {
                handleError(0, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidStart,
                    tokens[0].getRange(), tokens[0].str.toString());
            }
        }

        // checks end of an array: it must end with ')', relation or an unary operator
        if (tokens[tokens.length - 1] instanceof OpeningParentheses || tokens[tokens.length - 1] instanceof BinaryOperatorToken) {
            handleError(tokens.length, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidEnd,
                tokens[tokens.length - 1].getRange(), tokens[tokens.length - 1].str.toString());
        }

        // checks adjacent pairs of tokens
        let i2: number = 1;
        while (i2 < tokens.length) {
            const token1: ExprToken = tokens[i2 - 1];
            const token2: ExprToken = tokens[i2];

            // valid predecessors: binary operator or '('
            if (token2 instanceof RelationToken) {
                if (token1 instanceof RelationToken) {
                    handleError(i2, "binary", SyntaxErrorCodes.exprParser_assertValidInfixTokens_relationAfterRelation,
                        token2.getRange(), token2.str.toString(), token1.str.toString());
                }
                if (token1 instanceof UnaryOperatorToken) {
                    handleError(i2, "binary", SyntaxErrorCodes.exprParser_assertValidInfixTokens_relationAfterUnary,
                        token2.getRange(), token2.str.toString(), token1.str.toString());
                }
                if (token1 instanceof ClosingParentheses) {
                    handleError(i2, "binary", SyntaxErrorCodes.exprParser_assertValidInfixTokens_relationAfterClosing,
                        token2.getRange(), token2.str.toString());
                }
            }
            // valid predecessors: relation, unary operator or ')'
            else if (token2 instanceof UnaryOperatorToken) {
                if (token1 instanceof BinaryOperatorToken) {
                    handleError(i2, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_unaryAfterBinary,
                        token2.getRange(), token2.str.toString(), token1.str.toString());
                }
                if (token1 instanceof OpeningParentheses) {
                    handleError(i2, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_unaryAfterOpening,
                        token2.getRange(), token2.str.toString());
                }
            }
            // valid predecessors: relation, unary operator or ')'
            else if (token2 instanceof BinaryOperatorToken) {
                if (token1 instanceof BinaryOperatorToken) {
                    handleError(i2, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_binaryAfterBinary,
                        token2.getRange(), token2.str.toString(), token1.str.toString());
                }
                if (token1 instanceof OpeningParentheses) {
                    handleError(i2, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_binaryAfterOpening,
                        token2.getRange(), token2.str.toString());
                }
            }
            // valid predecessors: binary operator or '('
            else if (token2 instanceof OpeningParentheses) {
                if (token1 instanceof RelationToken) {
                    handleError(i2, "binary", SyntaxErrorCodes.exprParser_assertValidInfixTokens_openingAfterRelation,
                        token2.getRange(), token1.str.toString());
                }
                if (token1 instanceof UnaryOperatorToken) {
                    handleError(i2, "binary", SyntaxErrorCodes.exprParser_assertValidInfixTokens_openingAfterUnary,
                        token2.getRange(), token1.str.toString());
                }
                if (token1 instanceof ClosingParentheses) {
                    handleError(i2, "binary", SyntaxErrorCodes.exprParser_assertValidInfixTokens_openingAfterClosing,
                        token2.getRange());
                }
            }
            // valid predecessors: relation, unary operator or ')'
            else if (token2 instanceof ClosingParentheses) {
                if (token1 instanceof BinaryOperatorToken) {
                    handleError(i2, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_closingAfterBinary,
                        token2.getRange(), token1.str.toString());
                }
                if (token1 instanceof OpeningParentheses) {
                    handleError(i2, "relation", SyntaxErrorCodes.exprParser_assertValidInfixTokens_closingAfterOpening,
                        token2.getRange());
                }
            }
            else {
                throw ErrorFactory.codeError(CodeErrorCodes.exprParser_isValidSequence_unexpectedToken, JSON.stringify(token2));
            }
            ++i2;
        }
    }

    /**
     * Transforms given infix relation algebra expression into postfix (reverse polish) form.
     * Throws error when invalid parentheses structure is given.
     *
     * @param tokens infix relational algebra expression as Token array
     * @return postfix (reverse polish) form of given array
     */
    public toRPN(tokens: ExprToken[]): ExprToken[] {
        const rpnQueue: ExprToken[] = [];
        const operatorsStack: Array<BinaryOperatorToken | ParenthesisToken> = [];
        tokens.forEach(token => {
            if (token instanceof RelationToken || token instanceof UnaryOperatorToken) {
                rpnQueue.push(token);
            }
            else if (token instanceof BinaryOperatorToken) {
                while (operatorsStack.length > 0 && operatorsStack[operatorsStack.length - 1] instanceof BinaryOperatorToken) {
                    // @ts-ignore (token must be of BinaryOperatorToken class)
                    let other: BinaryOperatorToken = operatorsStack[operatorsStack.length - 1];
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
                        throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidParentheses,
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
            const curToken: ExprToken = operatorsStack.pop();
            if (curToken instanceof OpeningParentheses) {
                throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidParentheses,
                    undefined);
            }
            else {
                rpnQueue.push(curToken);
            }
        }
        return rpnQueue;
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
     * @param errors
     * @return RATreeNode tree (its root)
     */
    public rpnToRATree(tokens: ExprToken[], doThrow: boolean, errors: ErrorWithTextRange[] = []): RATreeNode {
        const ret: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors);
        // not all tokens were used
        if (tokens.length > 0) {
            if (doThrow) {
                throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_rpnToVETree_invalidExpression, undefined);
            }
            else {
                return new RelationNode(new Relation(""));
            }
        }
        return ret;
    }

    public rpnToRATreeRecursive(tokens: ExprToken[], doThrow: boolean, errors: ErrorWithTextRange[]): RATreeNode {
        if (tokens.length === 0) {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.exprParser_rpnToVETree_invalidExpression, undefined);
        }
        // @ts-ignore (there must be a token)
        const token: ExprToken = tokens.pop();
        // RELATION REFERENCE
        if (token instanceof RelationToken) {
            const relation: Relation | undefined = this.relations.get(token.str.toString());
            // when the relation does not exist, throws or fakes it with an empty relation
            if (relation === undefined) {
                const error = ErrorFactory.semanticError(SemanticErrorCodes.exprParser_parse_relationNotDefined,
                    token.getRange(), token.str.toString());
                if (doThrow) {
                    throw error;
                }
                else {
                    errors.push(error);
                    return new RelationNode(new Relation(""));
                }
            }
            return new RelationNode(relation);
        }
        // UNARY OPERATORS
        if (token instanceof UnaryOperatorToken) {
            const subtree: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors);
            return RATreeFactory.createUnary(token.type, subtree, this.nullValuesSupport, token.str);
        }
        // BINARY OPERATORS
        if (token instanceof BinaryOperatorToken) {
            const right: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors);
            const left: RATreeNode = this.rpnToRATreeRecursive(tokens, doThrow, errors);
            return RATreeFactory.createBinary(token.type, left, right, this.nullValuesSupport, token.str);
        }
        // should never happen
        throw ErrorFactory.codeError(CodeErrorCodes.exprParser_rpnToVETreeRecursive_unexpectedToken, JSON.stringify(token));
    }
}
