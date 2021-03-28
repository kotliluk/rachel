import ErrorWithTextRange from "./errorWithTextRange";

/**
 * Syntax error in an expression structure.
 */
export default class RASyntaxError extends ErrorWithTextRange {
    /**
     * @param msg Adds "Syntax error: " before given message
     * @param range optional text range of the error
     */
    constructor(msg: string, range: {start: number, end: number} | undefined) {
        super("Syntax error: " + msg, range);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RASyntaxError);
        }
        this.name = 'RASyntaxError';
    }
}