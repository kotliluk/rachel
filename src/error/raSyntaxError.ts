import ErrorWithTextRange from "./errorWithTextRange";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Messages for RASyntaxErrors.
 * The description is a string array - between its members are inserted error parameters (names of invalid relations,
 * invalid input parts, etc.). See english language definition for expected structure of each error description.
 */
export interface SyntaxErrorMessages {
    // expects 1 part
    exprParser_emptyStringGiven: string[],
    // expects 2 parts
    exprParser_outerJoinWhenNullNotSupported: string[],
    // expects 2 parts
    exprParser_unexpectedPart: string[],
    // expects 4 parts
    exprParser_bothBranchesError: string[],
    // expects 1 part
    exprParser_invalidExpression: string[],
    // expects 1 part
    exprParser_invalidParentheses: string[],
    // expects 2 parts
    exprParser_invalidStart: string[],
    // expects 2 parts
    exprParser_invalidEnd: string[],
    // expects 3 parts
    exprParser_relationAfterRelation: string[],
    // expects 3 parts
    exprParser_relationAfterUnary: string[],
    // expects 2 parts
    exprParser_relationAfterClosing: string[],
    // expects 3 parts
    exprParser_unaryAfterBinary: string[],
    // expects 2 parts
    exprParser_unaryAfterOpening: string[],
    // expects 3 parts
    exprParser_binaryAfterBinary: string[],
    // expects 2 parts
    exprParser_binaryAfterOpening: string[],
    // expects 2 parts
    exprParser_openingAfterRelation: string[],
    // expects 2 parts
    exprParser_openingAfterUnary: string[],
    // expects 1 part
    exprParser_openingAfterClosing: string[],
    // expects 2 parts
    exprParser_closingAfterBinary: string[],
    // expects 1 part
    exprParser_closingAfterOpening: string[],

    // expects 1 part
    valueParser_emptyInput: string[],
    // expects 1 part
    valueParser_unsupportedNull: string[],
    // expects 2 parts
    valueParser_unexpectedPart: string[],
    // expects 1 part
    valueParser_missingOpeningParenthesis: string[],
    // expects 1 part
    valueParser_missingClosingParenthesis: string[],
    // expects 1 part
    valueParser_invalidExpression: string[],
    // expects 2 parts
    valueParser_invalidStart: string[],
    // expects 2 parts
    valueParser_invalidEnd: string[],
    // expects 3 parts
    valueParser_literalAfterLiteral: string[],
    // expects 3 parts
    valueParser_literalAfterReference: string[],
    // expects 2 parts
    valueParser_literalAfterClosing: string[],
    // expects 3 parts
    valueParser_referenceAfterLiteral: string[],
    // expects 3 parts
    valueParser_referenceAfterReference: string[],
    // expects 2 parts
    valueParser_referenceAfterClosing: string[],
    // expects 3 parts
    valueParser_notAfterLiteral: string[],
    // expects 3 parts
    valueParser_notAfterReference: string[],
    // expects 2 parts
    valueParser_notAfterClosing: string[],
    // expects 3 parts
    valueParser_binaryAfterOperator: string[],
    // expects 2 parts
    valueParser_binaryAfterOpening: string[],
    // expects 2 parts
    valueParser_openingAfterLiteral: string[],
    // expects 2 parts
    valueParser_openingAfterReference: string[],
    // expects 1 part
    valueParser_openingAfterClosing: string[],
    // expects 2 parts
    valueParser_closingAfterOperator: string[],
    // expects 1 part
    valueParser_closingAfterOpening: string[],

    // expects 3 parts
    stringUtils_missingClosingChar: string[],
    // expects 2 parts
    stringUtils_charNotFound: string[],

    // expects 1 part
    renameNode_missingArrow: string[],
    // expects 2 parts
    renameNode_invalidNewName: string[],
    // expects 2 parts
    renameNode_keywordNewName: string[],
    // expects 2 parts
    renameNode_multipleRenameOfTheColumn: string[],

    // expects 3 parts
    selectionNode_resultNotBoolean: string[],
    // expects 3 parts
    thetaJoinNode_resultNotBoolean: string[],

    // expects 4 parts
    comparingOperator_differentInputTypes: string[],
    // expects 4 parts
    computingOperator_inputTypesNotNumbers: string[],
    // expects 3 parts
    logicalOperator_leftInputNotBoolean: string[],
    // expects 3 parts
    logicalOperator_rightInputNotBoolean: string[]
}

/**
 * Syntax error in an expression structure.
 */
export default class RASyntaxError extends ErrorWithTextRange {
    /**
     * @param msg error message
     * @param range optional text range of the error
     */
    constructor(msg: string, range: StartEndPair | undefined) {
        super(language().syntaxError + msg, range);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RASyntaxError);
        }
        this.name = 'RASyntaxError';
    }
}