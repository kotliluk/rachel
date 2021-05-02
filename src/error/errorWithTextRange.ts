import {StartEndPair} from "../types/startEndPair";

/**
 * Error with optional text range of the error.
 */
export default class ErrorWithTextRange extends Error {
    constructor(msg: string, public range?: StartEndPair | undefined) {
        super(msg);
    }
}

/**
 * If the given error is ErrorWithTextRange instance and has undefined range, sets its range to given value.
 * Returns (possibly modified) input error.
 */
export function insertRangeIfUndefined<T>(err: T, range: StartEndPair | undefined): T {
    if (err instanceof ErrorWithTextRange && err.range === undefined) {
        err.range = range;
    }
    return err;
}