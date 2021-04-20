import {IndexedString} from "../types/indexedString";
import StringUtils from "./stringUtils";
import {insertRangeIfUndefined} from "../error/errorWithTextRange";
import RASyntaxError from "../error/raSyntaxError";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";

/**
 * Class providing general helper functions for IndexedString.
 */
export default class IndexedStringUtils {

    /**
     * @param str Checked indexed string
     * @return true if the string contains letters only and has length at least 1
     */
    public static isWord(str: IndexedString): boolean {
        return StringUtils.isWord(str.toString());
    }

    /**
     * @param str Checked string
     * @return true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore
     */
    public static isName(str: IndexedString): boolean {
        return StringUtils.isName(str.toString());
    }

    /**
     * @param str Checked string
     * @return true if the string contains whitespaces only
     */
    public static isWhitespacesOnly(str: IndexedString): boolean {
        return StringUtils.isWhitespacesOnly(str.toString());
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a letter
     */
    public static isLetter(c: IndexedString): boolean {
        return StringUtils.isLetter(c.toString());
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a letter, a number or an underscore
     */
    public static isNameChar(c: IndexedString): boolean {
        return StringUtils.isNameChar(c.toString());
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a digit
     */
    public static isDigit(c: IndexedString): boolean {
        return StringUtils.isDigit(c.toString());
    }

    /**
     * @param str Checked string
     * @return true if the string represents a decimal number
     */
    public static isNumber(str: IndexedString): boolean {
        return StringUtils.isNumber(str.toString());
    }

    /**
     * Splits given indexed string to a starting sequence of letters and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, as a word is returned an empty string.
     *
     * @param str indexed string to be split
     * @return split indexed string in a pair { word, rest }
     */
    public static nextWord(str: IndexedString): { first: IndexedString, second: IndexedString } {
        const strParts: { first: string, second: string } = StringUtils.nextWord(str.toString());
        return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length)};
    }

    /**
     * Splits given indexed string to a starting sequence of letters, numbers and underscores, which starts with a letter or
     * an underscore and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, or an underscore, as a name is returned an empty string.
     *
     * @param str string to be split
     * @return split indexed string in a pair { name, rest }
     */
    public static nextName(str: IndexedString): { first: IndexedString, second: IndexedString } {
        const strParts: { first: string, second: string } = StringUtils.nextName(str.toString());
        return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length)};
    }

    /**
     * Splits given indexed string to a starting sequence of non-whitespace characters and its rest and returns these
     * parts in a pair.
     *
     * @param str string to be split
     * @return split indexed string in a pair { name, rest }
     */
    public static nextNonWhitespacePart(str: IndexedString): { first: IndexedString, second: IndexedString } {
        const strParts: { first: string, second: string } = StringUtils.nextNonWhitespacePart(str.toString());
        return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length)};
    }

    /**
     * Splits given indexed string to a starting number and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a digit, as a number is returned an empty string.
     *
     * @param str indexed string to be split
     * @return split indexed string in a pair (word, rest)
     */
    static nextNumber(str: IndexedString): { first: IndexedString, second: IndexedString } {
        const strParts: { first: string, second: string } = StringUtils.nextNumber(str.toString());
        return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length)};
    }

    /**
     * Splits the given indexed string into starting quoted part and the rest. Quotes can be escaped by an odd count of
     * backslashes.
     * NOTE: When the closing quote is not found until the rest of the line, unclosed string is returned
     * => the error is not thrown, it is only added to the return object.
     * NOTE: First character of the string is expected to be '"'.
     *
     * @param str string to be split
     * @return pair of the starting bordered part and the rest
     */
    static nextQuotedString(str: IndexedString): { first: IndexedString, second: IndexedString, error: RASyntaxError | undefined } {
        const strParts: { first: string, second: string, error: RASyntaxError | undefined } = StringUtils.nextQuotedString(str.toString());
        const startIndex = str.getFirstNonNaNIndex();
        if (startIndex !== undefined) {
            strParts.error = insertRangeIfUndefined(strParts.error, {start: startIndex, end: startIndex});
        }
        return {
            first: str.slice(0, strParts.first.length),
            second: str.slice(strParts.first.length),
            error: strParts.error
        };
    }

    /**
     * Splits the indexed string to the starting bordered part and the rest and returns these parts in a pair.
     * If there is only one ending character and it differs from the starting one, nested bordering is supported.
     * Characters after escape character are ignored and cannot start or end a bordered part.
     * Starting and ending characters in quoted part are ignored.
     * NOTE: First character of the string is expected to be 'start'.
     * NOTE: Should not be used for slicing quoted strings, use nextQuotedString instead.
     * NOTE: It is expected, that there are no comments in the given string.
     *
     * @param str indexed string to be split
     * @param start starting character of the string and also starting character of the bordered part (one character)
     * @param end ending characters of the bordered part (one or more characters)
     * @param escape character which makes next character being ignored (default '\0')
     * @return pair of the starting bordered part and the rest as indexed strings
     */
    static nextBorderedPart(str: IndexedString, start: string, end: string, escape: string = '\0'):
        { first: IndexedString, second: IndexedString } {
        try {
            const strParts: { first: string, second: string } = StringUtils.nextBorderedPart(str.toString(), start, end, escape);
            return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length)};
        }
        catch (err) {
            const startIndex = str.getFirstNonNaNIndex();
            if (startIndex !== undefined) {
                throw insertRangeIfUndefined(err, {start: startIndex, end: startIndex});
            }
            throw err;
        }
    }

    /**
     * Skips all characters until the first found newline '\n' and returns the rest of the string.
     * NOTE: First two characters of the string are expected to be '//'.
     *
     * @param str string to be skipped in
     */
    public static skipLineComment(str: IndexedString): IndexedString {
        let i = 2;
        while (i < str.length()) {
            // ends when finds newline
            const stop = str.charAt(i) === '\n';
            ++i;
            if (stop) {
                break;
            }
        }
        return str.slice(i);
    }

    /**
     * Skips all characters until the first found '* /' and returns the rest of the string. When the ending characters
     * are not found, throws error.
     * NOTE: First two characters of the string are expected to be '/*'.
     *
     * @param str string to be skipped in
     */
    public static skipBlockComment(str: IndexedString): IndexedString {
        let i = 2;
        let stop = false;
        while (i < str.length()) {
            // ends when finds newline
            stop = i >= 3 && str.charAt(i) === '/' && str.charAt(i - 1) === '*';
            ++i;
            if (stop) {
                break;
            }
        }
        // throws error when the comment is not closed
        if (!stop) {
            const startIndex = str.getFirstNonNaNIndex();
            const range = startIndex === undefined ? undefined : {start: startIndex, end: startIndex + 1};
            throw ErrorFactory.syntaxError(language().syntaxErrors.stringUtils_missingClosingChar, range, '*/', '/*');
        }
        return str.slice(i);
    }

    /**
     * Skips all whitespaces and exactly one given character and returns rest of the string.
     * If the string does not match this pattern, throws error.
     *
     * @param str string to be skipped in
     * @param char char to be skipped exactly one time (expected to be string of length 1)
     * @return given string without starting sequence of whitespaces and exactly one char
     */
    public static skipWhitespacesAndChar(str: IndexedString, char: string): IndexedString {
        try {
            const skippedStr: string = StringUtils.skipWhitespacesAndChar(str.toString(), char);
            return str.slice(str.length() - skippedStr.length);
        }
        catch (err) {
            throw insertRangeIfUndefined(err, str.getNonNaNRange());
        }
    }
}