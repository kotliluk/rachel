/**
 * Error with optional text range of the error.
 */
export default class ErrorWithTextRange extends Error {
    constructor(msg: string, public range?: {start: number, end: number} | undefined) {
        super(msg);
    }
}

/**
 * If the given error is ErrorWithTextRange instance and has undefined range, sets its range to given value.
 * Returns (possibly modified) input error.
 *
 * @param err
 * @param range
 */
export function insertRangeIfUndefined<T>(err: T, range: {start: number, end: number} | undefined): T {
    if (err instanceof ErrorWithTextRange && err.range === undefined) {
        err.range = range;
    }
    return err;
}