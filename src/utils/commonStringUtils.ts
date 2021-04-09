import RASyntaxError from "../error/raSyntaxError";
import IndexedStringUtils from "./indexedStringUtils";
import StringUtils from "./stringUtils";
import {IndexedString} from "../types/indexedString";

/**
 * Gets string range: when IndexedString given, returns str.getNonNaNRange(), when string given, returns undefined.
 *
 * @param str string to get the range of
 */
export function getRange(str: string | IndexedString): { start: number, end: number } | undefined {
    return (str instanceof IndexedString) ? str.getNonNaNRange() : undefined;
}

/**
 * Gets strings length.
 *
 * @param str string to get the length of
 */
export function length(str: string | IndexedString): number {
    return (str instanceof IndexedString) ? str.length() : str.length;
}

/**
 * Returns true if the given string is empty.
 *
 * @param str
 */
export function isEmpty(str: string | IndexedString): boolean {
    if (str instanceof IndexedString) {
        return str.isEmpty();
    }
    return str === "";
}

/**
 * Returns next quoted part of the given string. Returned parts are of the same type as the argument.
 * See StringUtils.nextQuotedString for details.
 */
export function nextQuotedString(str: string | IndexedString): { first: string, second: string, error: RASyntaxError | undefined } |
    { first: IndexedString, second: IndexedString, error: RASyntaxError | undefined } {
    if (str instanceof IndexedString) {
        return IndexedStringUtils.nextQuotedString(str);
    }
    return StringUtils.nextQuotedString(str);
}

/**
 * Returns next bordered part of the given string. Returned parts are of the same type as the argument.
 * See StringUtils.nextBorderedPart for details.
 */
export function nextBorderedPart(str: string | IndexedString, start: string, end: string, escape?: string):
    { first: IndexedString, second: IndexedString } | { first: string, second: string } {
    if (str instanceof IndexedString) {
        return IndexedStringUtils.nextBorderedPart(str, start, end, escape);
    }
    return StringUtils.nextBorderedPart(str, start, end, escape);
}

/**
 * Returns true if the string str contains any of the characters from string chars. Otherwise, returns false.
 *
 * @param str
 * @param chars
 */
export function containsAny(str: string | IndexedString, chars: string): boolean {
    for (let i = 0; i < chars.length; ++i) {
        if (str.indexOf(chars[i]) > -1) {
            return true;
        }
    }
    return false;
}