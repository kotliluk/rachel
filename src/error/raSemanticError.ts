import {ErrorWithTextRange} from "./errorWithTextRange";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Messages for {@type RASemanticError}.
 * The description is a string array - between its members are inserted error parameters (names of invalid relations,
 * invalid input parts, etc.). See english language definition for expected structure of each error description.
 * @category Errors
 * @public
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
 * @extends ErrorWithTextRange
 * @category Errors
 * @public
 */
export class RASemanticError extends ErrorWithTextRange {
    /**
     * Creates a new RASemanticError with the given message.
     *
     * @param msg error message {@type string}
     * @param range optional text range of the error {@type StartEndPair?}
     * @public
     */
    constructor(msg: string, range: StartEndPair | undefined) {
        super(language().semanticError + msg, range);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RASemanticError);
        }
        this.name = 'RASemanticError';
    }
}