import { StartEndPair } from '../types/startEndPair'

/**
 * Error with optional text range of the error.
 * @extends Error
 * @category Errors
 * @public
 */
export class ErrorWithTextRange extends Error {
  /**
     * @param msg error message {@type string}
     * @param range optional text range of the error {@type StartEndPair?}
     * @public
     */
  constructor (msg: string, public range?: StartEndPair | undefined) {
    super(msg)
  }
}

/**
 * If the given error is ErrorWithTextRange instance and has undefined range, sets its range to given value.
 * Returns (possibly modified) input error.
 *
 * @param err error tu be inserted in {@type ErrorWithTextRange}
 * @param range inserted range {@type StartEndPair?}
 * @category Errors
 * @public
 */
export function insertRangeIfUndefined<T> (err: T, range: StartEndPair | undefined): T {
  if (err instanceof ErrorWithTextRange && err.range === undefined) {
    err.range = range
  }
  return err
}
