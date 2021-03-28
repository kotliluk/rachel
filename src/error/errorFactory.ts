import RASemanticError from "./raSemanticError";
import RASyntaxError from "./raSyntaxError";
import CodeError from "./codeError";

/**
 * Codes for CodeErrors.
 */
export enum CodeErrorCodes {
    resultSection_getCurrentRelation_nodeIndexNotFound = 1,
    resultSection_getCurrentRelation_evalError,
    resultSection_saveResultRelation_nullRelationToSave,
    resultSection_handleAddRelation_nullRelationToAdd,

    row_getOrderedValues_absentColumn,

    valueParser_rpnToVETreeRecursive_unexpectedToken,

    exprParser_isValidSequence_unexpectedToken,
    exprParser_rpnToVETreeRecursive_unexpectedToken,
    exprParser_parseTokensForWhisper_thetaJoinBranchError,
    exprParser_parseTokensForWhisper_projectionBranchError
}

/**
 * Codes for RASemanticErrors.
 */
export enum SemanticErrorCodes {
    exprParser_parse_relationNotDefined = 1001,

    binaryNode_eval_commonColumnsInSources,
    setOperationNode_eval_notEqualColumnsInSources,
    divisionNode_eval_rightColumnsNotSubsetOfLeft,
    divisionNode_eval_rightColumnsNotProperSubsetOfLeft,
    renameNode_eval_absentOriginalColumn,
    renameNode_eval_changeToDuplicitName,
    projectionNode_eval_absentColumn,

    referenceValue_eval_absentColumn
}

/**
 * Codes for RASyntaxErrors.
 */
export enum SyntaxErrorCodes {
    exprParser_parse_emptyStringGiven = 2001,
    exprParser_parseTokens_outerJoinWhenNullNotSupported,
    exprParser_parseTokens_unexpectedPart,
    exprParser_parseTokens_bothBranchesError,
    exprParser_rpnToVETree_invalidExpression,
    exprParser_assertValidInfixTokens_invalidParentheses,
    exprParser_assertValidInfixTokens_invalidStart,
    exprParser_assertValidInfixTokens_invalidEnd,
    exprParser_assertValidInfixTokens_relationAfterRelation,
    exprParser_assertValidInfixTokens_relationAfterUnary,
    exprParser_assertValidInfixTokens_relationAfterClosing,
    exprParser_assertValidInfixTokens_unaryAfterBinary,
    exprParser_assertValidInfixTokens_unaryAfterOpening,
    exprParser_assertValidInfixTokens_binaryAfterBinary,
    exprParser_assertValidInfixTokens_binaryAfterOpening,
    exprParser_assertValidInfixTokens_openingAfterRelation,
    exprParser_assertValidInfixTokens_openingAfterUnary,
    exprParser_assertValidInfixTokens_openingAfterClosing,
    exprParser_assertValidInfixTokens_closingAfterBinary,
    exprParser_assertValidInfixTokens_closingAfterOpening,

    valueParser_parseTokens_emptyInput,
    valueParser_parseTokens_unsupportedNull,
    valueParser_parseTokens_unexpectedPart,
    valueParser_toRPN_missingOpeningParenthesis,
    valueParser_toRPN_missingClosingParenthesis,
    valueParser_rpnToVETree_invalidExpression,
    valueParser_rpnToVETree_invalidStart,
    valueParser_rpnToVETree_invalidEnd,
    valueParser_rpnToVETree_literalAfterLiteral,
    valueParser_rpnToVETree_literalAfterReference,
    valueParser_rpnToVETree_literalAfterClosing,
    valueParser_rpnToVETree_referenceAfterLiteral,
    valueParser_rpnToVETree_referenceAfterReference,
    valueParser_rpnToVETree_referenceAfterClosing,
    valueParser_rpnToVETree_notAfterLiteral,
    valueParser_rpnToVETree_notAfterReference,
    valueParser_rpnToVETree_notAfterClosing,
    valueParser_rpnToVETree_binaryAfterOperator,
    valueParser_rpnToVETree_binaryAfterOpening,
    valueParser_rpnToVETree_openingAfterLiteral,
    valueParser_rpnToVETree_openingAfterReference,
    valueParser_rpnToVETree_openingAfterClosing,
    valueParser_rpnToVETree_closingAfterOperator,
    valueParser_rpnToVETree_closingAfterOpening,

    parser_nextBorderedPart_missingClosingChar,
    parser_skipWhitespacesAndChar_charNotFound,

    projectionNode_constructor_invalidProjectionString,
    projectionNode_parseProjection_invalidProjectedColumnName,

    renameNode_parseChanges_invalidRenameString,
    renameNode_parseChanges_missingArrow,
    renameNode_parseChanges_invalidNewName,
    renameNode_parseChanges_keywordNewName,
    renameNode_parseChanges_multipleRenameOfTheColumn,

    selectionNode_constructor_invalidString,
    selectionNode_constructor_emptyString,
    selectionNode_eval_resultNotBoolean,

    thetaJoinNode_constructor_invalidString,
    thetaJoinNode_constructor_emptyString,
    thetaJoinNode_eval_resultNotBoolean,

    thetaSemiJoinNode_constructor_invalidString,
    thetaSemiJoinNode_constructor_emptyString,
    thetaSemiJoinNode_eval_resultNotBoolean,

    comparingOperator_eval_differentInputTypes,

    computingOperator_eval_inputTypesNotNumbers,

    logicalOperator_eval_leftInputNotBoolean,
    logicalOperator_eval_rightInputNotBoolean
}

/**
 * English messages for CodeErrors mapped by their error codes.
 */
const codeErrMsgEng: Map<CodeErrorCodes, string[]> = new Map<CodeErrorCodes, string[]>([
    [CodeErrorCodes.resultSection_getCurrentRelation_nodeIndexNotFound,
        ["ResultSection.getCurrentRelation: Selected node index in evaluation tree not found."]],
    [CodeErrorCodes.resultSection_getCurrentRelation_evalError,
        ["ResultSection.getCurrentRelation: Evaluation error in result section: ", ""]],
    [CodeErrorCodes.resultSection_saveResultRelation_nullRelationToSave,
        ["ResultSection.saveResultRelation: Result relation is null when tried to save it."]],
    [CodeErrorCodes.resultSection_handleAddRelation_nullRelationToAdd,
        ["ResultSection.handleAddRelation: Result relation is null when tried to add it."]],

    [CodeErrorCodes.row_getOrderedValues_absentColumn,
        ["Row.getOrderedValues: Column ", " is absent in row with columns: ", ""]],

    [CodeErrorCodes.valueParser_rpnToVETreeRecursive_unexpectedToken,
        ["ValueParser.rpnToVETreeRecursive: Unexpected token: ", "."]],

    [CodeErrorCodes.exprParser_isValidSequence_unexpectedToken,
        ["ExprParser.isValidSequence: Unexpected token: ", "."]],
    [CodeErrorCodes.exprParser_rpnToVETreeRecursive_unexpectedToken,
        ["ExprParser.rpnToVETreeRecursive: Unexpected token: ", "."]],
    [CodeErrorCodes.exprParser_parseTokensForWhisper_thetaJoinBranchError,
        ["ExprParser.parseTokensForWhisper: Error in theta join branch: ", "."]],
    [CodeErrorCodes.exprParser_parseTokensForWhisper_projectionBranchError,
        ["ExprParser.parseTokensForWhisper: Error in projection branch: ", "."]]
]);

/**
 * English messages for RASemanticErrors mapped by their error codes.
 */
const semanticErrMsgEng: Map<SemanticErrorCodes, string[]> = new Map<SemanticErrorCodes, string[]>([
    [SemanticErrorCodes.exprParser_parse_relationNotDefined,
        ["Relation \"", "\" is not defined. Please check relations definitions."]],

    [SemanticErrorCodes.binaryNode_eval_commonColumnsInSources,
        ["Source relations for ", " have common columns \"", "\"."]],
    [SemanticErrorCodes.setOperationNode_eval_notEqualColumnsInSources,
        ["Source relations \"", "\" and \"", "\" for set ", " do not have the same column sets."]],
    [SemanticErrorCodes.divisionNode_eval_rightColumnsNotSubsetOfLeft,
        ["Right source relation \"", "\" is not a subset of the left source relation \"", "\"."]],
    [SemanticErrorCodes.divisionNode_eval_rightColumnsNotProperSubsetOfLeft,
        ["Right source relation \"", "\" is not a proper subset of the left source relation \"",
            ". There must exist a column in the left relation which is not present in the right relation."]],
    [SemanticErrorCodes.renameNode_eval_absentOriginalColumn,
        ["Invalid rename, column \"", "\" does not exist in the source relation."]],
    [SemanticErrorCodes.renameNode_eval_changeToDuplicitName,
        ["Invalid rename, new column name \"", "\" is duplicit in the changed relation."]],
    [SemanticErrorCodes.projectionNode_eval_absentColumn,
        ["Invalid projection of the column \"", "\". It does not exist in the source relation."]],

    [SemanticErrorCodes.referenceValue_eval_absentColumn,
        ["Column \"", "\" is absent in a schema with columns: ", "."]],
]);

/**
 * English messages for RASyntaxErrors mapped by their error codes.
 */
const syntaxErrMsgEng: Map<SyntaxErrorCodes, string[]> = new Map<SyntaxErrorCodes, string[]>([
    [SyntaxErrorCodes.exprParser_parse_emptyStringGiven,
        ["Cannot parse an expression from an empty string."]],
    [SyntaxErrorCodes.exprParser_parseTokens_outerJoinWhenNullNotSupported,
        ["Found ", " when null values are not supported."]],
    [SyntaxErrorCodes.exprParser_parseTokens_unexpectedPart,
        ["Unexpected part \"", "\" in RA expression."]],
    [SyntaxErrorCodes.exprParser_parseTokens_bothBranchesError,
        ["All combinations throw error in \"", "\". When treated as projection:\n", "\nWhen treated as theta join:\n", ""]],
    [SyntaxErrorCodes.exprParser_rpnToVETree_invalidExpression,
        ["Given string is not a valid expression."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidParentheses,
        ["Invalid structure of parentheses in the expression."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidStart,
        ["RA expression cannot start with ", "."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_invalidEnd,
        ["RA expression cannot end with ", "."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_relationAfterRelation,
        ["Relation \"", "\" after relation \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_relationAfterUnary,
        ["Relation \"", "\" after unary operator \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_relationAfterClosing,
        ["Relation \"", "\" after closing parenthesis."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_unaryAfterBinary,
        ["Unary operator \"", "\" after binary operator \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_unaryAfterOpening,
        ["Unary operator \"", "\" after opening parenthesis."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_binaryAfterBinary,
        ["Binary operator \"", "\" after binary operator \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_binaryAfterOpening,
        ["Binary operator \"", "\" after opening parenthesis."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_openingAfterRelation,
        ["Opening parentheses after relation \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_openingAfterUnary,
        ["Opening parentheses after unary operator \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_openingAfterClosing,
        ["Opening parentheses after closing parentheses."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_closingAfterBinary,
        ["Closing parentheses after binary operator \"", "\"."]],
    [SyntaxErrorCodes.exprParser_assertValidInfixTokens_closingAfterOpening,
        ["Closing parentheses after opening parentheses."]],

    [SyntaxErrorCodes.valueParser_parseTokens_emptyInput,
        ["An empty string given as a condition."]],
    [SyntaxErrorCodes.valueParser_parseTokens_unsupportedNull,
        ["Null constant used when null values are not supported."]],
    [SyntaxErrorCodes.valueParser_parseTokens_unexpectedPart,
        ["Unexpected part \"", "\" in expression."]],
    [SyntaxErrorCodes.valueParser_toRPN_missingOpeningParenthesis,
        ["Missing opening parenthesis '(' in an expression."]],
    [SyntaxErrorCodes.valueParser_toRPN_missingClosingParenthesis,
        ["Missing closing parenthesis ')' in an expression."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_invalidExpression,
        ["Given string is not a valid expression."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_invalidStart,
        ["Expression cannot start with \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_invalidEnd,
        ["Expression cannot end with \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_literalAfterLiteral,
        ["Literal \"", "\" after literal \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_literalAfterReference,
        ["Literal \"", "\" after reference to column \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_literalAfterClosing,
        ["Literal \"", "\" after closing parentheses."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_referenceAfterLiteral,
        ["Reference to column \"", "\" after literal \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_referenceAfterReference,
        ["Reference to column \"", "\" after reference to column \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_referenceAfterClosing,
        ["Reference to column \"", "\" after closing parentheses."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_notAfterLiteral,
        ["Logical not operator \"", "\" after literal \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_notAfterReference,
        ["Logical not operator \"", "\" after reference to column \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_notAfterClosing,
        ["Logical not operator \"", "\" after closing parentheses."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_binaryAfterOperator,
        ["Binary operator \"", "\" after binary operator \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_binaryAfterOpening,
        ["Binary operator \"", "\" after opening parentheses."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_openingAfterLiteral,
        ["Opening parentheses after literal \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_openingAfterReference,
        ["Opening parentheses after reference to column \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_openingAfterClosing,
        ["Opening parentheses after closing parentheses."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_closingAfterOperator,
        ["Closing parentheses after binary operator \"", "\"."]],
    [SyntaxErrorCodes.valueParser_rpnToVETree_closingAfterOpening,
        ["Closing parentheses after opening parentheses."]],

    [SyntaxErrorCodes.parser_nextBorderedPart_missingClosingChar,
        ["Missing '", "' after opening '", "'."]],
    [SyntaxErrorCodes.parser_skipWhitespacesAndChar_charNotFound,
        ["Expected \"", "\" not found."]],

    [SyntaxErrorCodes.projectionNode_constructor_invalidProjectionString,
        ['"', "\" is not a projection string. It must be bordered with '[' and ']'."]],
    [SyntaxErrorCodes.projectionNode_parseProjection_invalidProjectedColumnName,
        ["Invalid projection of column \"", "\". Column name must contain letters, number and underscores only and start with a letter."]],

    [SyntaxErrorCodes.renameNode_parseChanges_invalidRenameString,
        ['"', "\" is not a rename string. It must be bordered with '<' and '>'."]],
    [SyntaxErrorCodes.renameNode_parseChanges_missingArrow,
        ["Invalid rename, please use \"OldName -> NewName\" for each column renaming separated by commas ','."]],
    [SyntaxErrorCodes.renameNode_parseChanges_invalidNewName,
        ["Invalid rename to \"", "\". New column name must contain letters, number and underscores only and start with a letter."]],
    [SyntaxErrorCodes.renameNode_parseChanges_keywordNewName,
        ["Invalid rename to \"", "\". New column name cannot be a keyword."]],
    [SyntaxErrorCodes.renameNode_parseChanges_multipleRenameOfTheColumn,
        ["Multiple rename of column \"", "\"."]],

    [SyntaxErrorCodes.selectionNode_constructor_invalidString,
        ["Invalid selection, it must be bordered with '(' and ')'."]],
    [SyntaxErrorCodes.selectionNode_constructor_emptyString,
        ["The selection cannot be empty."]],
    [SyntaxErrorCodes.selectionNode_eval_resultNotBoolean,
        ["Result of the selection condition ", " is not a boolean value, but ", "."]],

    [SyntaxErrorCodes.thetaJoinNode_constructor_invalidString,
        ["Invalid theta join, it must be bordered with '[' and ']'."]],
    [SyntaxErrorCodes.thetaJoinNode_constructor_emptyString,
        ["The theta join condition cannot be empty."]],
    [SyntaxErrorCodes.thetaJoinNode_eval_resultNotBoolean,
        ["Result of the theta join condition ", " is not a boolean value, but ", "."]],

    [SyntaxErrorCodes.thetaSemiJoinNode_constructor_invalidString,
        ["Invalid theta semijoin, it must be bordered with '<' and ']' or '[' and '>'."]],
    [SyntaxErrorCodes.thetaSemiJoinNode_constructor_emptyString,
        ["The theta semijoin condition cannot be empty."]],
    [SyntaxErrorCodes.thetaSemiJoinNode_eval_resultNotBoolean,
        ["Result of the theta semijoin condition ", " is not a boolean value, but ", "."]],

    [SyntaxErrorCodes.comparingOperator_eval_differentInputTypes,
        ["Inputs for \"", "\"  have different types ", " and ", "."]],

    [SyntaxErrorCodes.computingOperator_eval_inputTypesNotNumbers,
        ["Inputs for \"", "\" are not both numbers, they are ", " and ", "."]],

    [SyntaxErrorCodes.logicalOperator_eval_leftInputNotBoolean,
        ["Left input value for \"",  "\" is not a boolean, but ", "."]],
    [SyntaxErrorCodes.logicalOperator_eval_rightInputNotBoolean,
        ["Right input value for \"", "\" is not a boolean, but ", "."]]
]);

/**
 * Factory for creating custom application errors: CodeError, RASemanticError, RASyntaxError.
 * It creates an error message by given error code and string parameters.
 */
export class ErrorFactory {

    /**
     * Creates a new CodeError with given code. Params are used to join error messages expecting textual specification.
     *
     * @param code code of the code error
     * @param params textual specification
     */
    public static codeError(code: CodeErrorCodes, ...params: string[]): CodeError {
        let msg: string[] | undefined = codeErrMsgEng.get(code);
        if (msg === undefined) {
            console.log("Unknown code of code error given: " + code);
            msg = ["Code error"];
        }
        assertParamsCount(msg.length - 1, params, code);
        return new CodeError(joinStringArrays(msg, params));
    }

    /**
     * Creates a new RASemanticError with given code and range. Params are used to join error messages expecting textual
     * specification.
     *
     * @param code code of the semantic error
     * @param range text range of the error in the input when defined
     * @param params textual specification
     */
    public static semanticError(code: SemanticErrorCodes, range: {start: number, end: number} | undefined, ...params: string[]): RASemanticError {
        let msg: string[] | undefined = semanticErrMsgEng.get(code);
        if (msg === undefined) {
            console.log("Unknown code of semantic error given: " + code);
            msg = ["Semantic error"];
        }
        assertParamsCount(msg.length - 1, params, code);
        return new RASemanticError(joinStringArrays(msg, params), range);
    }

    /**
     * Creates a new RASyntaxError with given code and range. Params are used to join error messages expecting textual
     * specification.
     *
     * @param code code of the syntax error
     * @param range text range of the error in the input when defined
     * @param params textual specification
     */
    public static syntaxError(code: SyntaxErrorCodes, range: {start: number, end: number} | undefined, ...params: string[]): RASyntaxError {
        let msg: string[] | undefined = syntaxErrMsgEng.get(code);
        if (msg === undefined) {
            console.log("Unknown code of syntax error given: " + code);
            msg = ["Syntax error"];
        }
        assertParamsCount(msg.length - 1, params, code);
        return new RASyntaxError(joinStringArrays(msg, params), range);
    }
}

/**
 * Extends the given params array with empty strings to have the length of expectedCount. When the intial length of the
 * given params array is same or greater, the array is unchanged.
 *
 * @param expectedCount
 * @param params
 * @param code code of the error
 */
export function assertParamsCount(expectedCount: number, params: string[], code: number): void {
    if (params.length !== expectedCount) {
        console.log("Unexpected params count for error " + code + ", expected " + expectedCount + ", given " + params.length);
        while (params.length < expectedCount) {
            params.push("");
        }
    }
}

/**
 * Joins given string arrays [a1, a2, ..., an] and [b1, b2, ..., bn-1] to one string "a1b1a2b2...an-1bn-1an".
 * WARNING: a.length is expected to be at least 1. b.length is expected to be at least "a.length - 1".
 *
 * @param a array of length at least 1
 * @param b array of length at least "a.length - 1"
 */
export function joinStringArrays(a: string[], b: string[]): string {
    const aLen: number = a.length;
    const toConcat: string[] = Array<string>(2 * aLen - 2);
    for (let i = 1; i < aLen; i++) {
        toConcat[2 * i - 2] = b[i - 1];
        toConcat[2 * i - 1] = a[i];
    }
    return a[0].concat(...toConcat);
}