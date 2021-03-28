import ErrorWithTextRange from "./errorWithTextRange";

/**
 * Semantic error in an expression structure.
 */
export default class RASemanticError extends ErrorWithTextRange {
    /**
     * @param msg Adds "Semantic error: " before given message
     * @param range optional text range of the error
     */
    constructor(msg: string, range: {start: number, end: number} | undefined) {
        super("Semantic error: " + msg, range);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RASemanticError);
        }
        this.name = 'RASemanticError';
    }
}