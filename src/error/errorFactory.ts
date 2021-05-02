import RASemanticError from "./raSemanticError";
import RASyntaxError from "./raSyntaxError";
import CodeError from "./codeError";
import {StartEndPair} from "../types/startEndPair";

/**
 * Factory for creating custom application errors: CodeError, RASemanticError, RASyntaxError.
 * It creates an error message by given error code and string parameters.
 */
export class ErrorFactory {

    /**
     * Creates a new code error. Params are used to join error messages.
     *
     * @see CodeErrorMessages
     *
     * @param msg predefined error description
     * @param params textual specification
     */
    public static codeError(msg: string[], ...params: string[]): CodeError {
        assertParamsCount(msg.length - 1, params);
        return new CodeError(joinStringArrays(msg, params));
    }

    /**
     * Creates a new RASemanticError. Params are used to join error messages.
     *
     * @see SemanticErrorMessages
     *
     * @param msg predefined error description
     * @param range text range of the error in the input when defined
     * @param params textual specification
     */
    public static semanticError(msg: string[], range: StartEndPair | undefined, ...params: string[]): RASemanticError {
        assertParamsCount(msg.length - 1, params);
        return new RASemanticError(joinStringArrays(msg, params), range);
    }

    /**
     * Creates a new RASyntaxError. Params are used to join error messages.
     *
     * @see SyntaxErrorMessages
     *
     * @param msg predefined error description
     * @param range text range of the error in the input when defined
     * @param params textual specification
     */
    public static syntaxError(msg: string[], range: StartEndPair | undefined, ...params: string[]): RASyntaxError {
        assertParamsCount(msg.length - 1, params);
        return new RASyntaxError(joinStringArrays(msg, params), range);
    }
}

/**
 * Extends the given params array with empty strings to have the length of expectedCount. When the initial length of the
 * given params array is the same or greater, the array is not changed.
 */
export function assertParamsCount(expectedCount: number, params: string[]): void {
    if (params.length !== expectedCount) {
        console.log("Unexpected params count, expected " + expectedCount + ", given " + params.length);
        while (params.length < expectedCount) {
            params.push("");
        }
    }
}

/**
 * Joins given string arrays [a1, a2, ..., an] and [b1, b2, ..., bn-1] to one string "a1b1a2b2...an-1bn-1an".
 * WARNING: a.length is expected to be at least 1. b.length is expected to be at least "a.length - 1".
 *
 * @param a array of length at least 1
 * @param b array of length at least "a.length - 1"
 */
export function joinStringArrays(a: string[], b: string[]): string {
    const aLen: number = a.length;
    const toConcat: string[] = Array<string>(2 * aLen - 2);
    for (let i = 1; i < aLen; i++) {
        toConcat[2 * i - 2] = b[i - 1];
        toConcat[2 * i - 1] = a[i];
    }
    return a[0].concat(...toConcat);
}