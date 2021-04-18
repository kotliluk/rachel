import ErrorWithTextRange from "./errorWithTextRange";
import {language} from "../language/language";

/**
 * Codes for RASemanticErrors.
 * The description is a string array - between its members are inserted error parameters (names of invalid relations,
 * invalid input parts, etc.). See english language definition for expected structure of each error description.
 */
export interface SemanticErrorMessages {
    // expects 2 parts
    exprParser_relationNotDefined: string[],

    // expects 3 parts
    binaryNode_commonColumns: string[],
    // expects 4 parts
    setOperationNode_notEqualColumns: string[],
    // expects 3 parts
    divisionNode_rightColumnsNotSubset: string[],
    // expects 3 parts
    divisionNode_rightColumnsNotProperSubset: string[],
    // expects 2 parts
    renameNode_absentOriginalColumn: string[],
    // expects 2 parts
    renameNode_changeToDuplicit: string[],
    // expects 2 parts
    projectionNode_absentColumn: string[],

    // expects 3 parts
    referenceValue_absentColumn: string[]
}

/**
 * Semantic error in an expression structure.
 */
export default class RASemanticError extends ErrorWithTextRange {
    /**
     * @param msg Adds "Semantic error: " before given message
     * @param range optional text range of the error
     */
    constructor(msg: string, range: {start: number, end: number} | undefined) {
        super(language().semanticError + msg, range);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RASemanticError);
        }
        this.name = 'RASemanticError';
    }
}