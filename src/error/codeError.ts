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