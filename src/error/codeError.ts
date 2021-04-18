/**
 * Codes for CodeErrors.
 * The description is a string array - between its members are inserted error parameters (names of invalid relations,
 * invalid input parts, etc.). See english language definition for expected structure of each error description.
 */
export interface CodeErrorMessages {
    // expects 1 part
    resultSection_nodeIndexNotFound: string[],
    // expects 2 part
    resultSection_evalError: string[],
    // expects 1 part
    resultSection_nullRelationToSave: string[],
    // expects 1 part
    resultSection_nullRelationToAdd: string[],

    // expects 3 parts
    row_absentColumn: string[],

    // expects 2 parts
    valueParser_unexpectedToken: string[],

    // expects 2 parts
    exprParser_unexpectedToken: string[],
    // expects 2 parts
    exprParser_thetaJoinBranchError: string[],
    // expects 2 parts
    exprParser_projectionBranchError: string[]
}

/**
 * Error caused by fatal error in code of the application.
 */
export default class CodeError extends Error {
    constructor(msg: string) {
        super(msg);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, CodeError);
        }
        this.name = 'CodeError';
    }
}