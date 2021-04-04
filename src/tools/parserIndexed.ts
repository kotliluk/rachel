import {IndexedString} from "./indexedString";
import Parser from "./parser";
import {insertRangeIfUndefined} from "../error/errorWithTextRange";

/**
 * IndexedParser providing general parsing helper functions for IndexedString. It wraps Parser methods for IndexedStrings.
 */
export default class ParserIndexed {

    /**
     * @param str Checked indexed string
     * @return true if the string contains letters only and has length at least 1
     */
    public static isWord(str: IndexedString): boolean {
        return Parser.isWord(str.toString());
    }

    /**
     * @param str Checked string
     * @return true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore
     */
    public static isName(str: IndexedString): boolean {
        return Parser.isName(str.toString());
    }

    /**
     * @param str Checked string
     * @return true if the string contains whitespaces only
     */
    public static isWhitespacesOnly(str: IndexedString): boolean {
        return Parser.isWhitespacesOnly(str.toString());
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a letter
     */
    public static isLetter(c: IndexedString): boolean {
        return Parser.isLetter(c.toString());
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a letter, a number or an underscore
     */
    public static isNameChar(c: IndexedString): boolean {
        return Parser.isNameChar(c.toString());
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a digit
     */
    public static isDigit(c: IndexedString): boolean {
        return Parser.isDigit(c.toString());
    }

    /**
     * @param str Checked string
     * @return true if the string represents a decimal number
     */
    public static isNumber(str: IndexedString): boolean {
        return Parser.isNumber(str.toString());
    }

    /**
     * Splits given indexed string to a starting sequence of letters and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, as a word is returned an empty string.
     *
     * @param str indexed string to be split
     * @return split indexed string in a pair { word, rest }
     */
    public static nextWord(str: IndexedString): { first: IndexedString, second: IndexedString } {
        const strParts: { first: string, second: string } = Parser.nextWord(str.toString());
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
        const strParts: { first: string, second: string } = Parser.nextName(str.toString());
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
        const strParts: { first: string, second: string } = Parser.nextNonWhitespacePart(str.toString());
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
        const strParts: { first: string, second: string } = Parser.nextNumber(str.toString());
        return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length)};
    }

    /**
     * Splits the indexed string to the starting bordered part and the rest and returns these parts in a pair.
     * If there is only one ending character and it differs from the starting one, nested bordering is supported.
     * Characters after escape character are ignored and cannot start or end a bordered part.
     * Starting and ending characters in quoted part are ignored.
     * NOTE: First character of the string is expected to be 'start'.
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
            const strParts: { first: string, second: string } = Parser.nextBorderedPart(str.toString(), start, end, escape);
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
     * Skips all whitespaces and exactly one given character and returns rest of the string.
     * If the string does not match this pattern, throws error.
     *
     * @param str string to be skipped in
     * @param char char to be skipped exactly one time (expected to be string of length 1)
     * @return given string without starting sequence of whitespaces and exactly one char
     */
    public static skipWhitespacesAndChar(str: IndexedString, char: string): IndexedString {
        try {
            const skippedStr: string = Parser.skipWhitespacesAndChar(str.toString(), char);
            return str.slice(str.length() - skippedStr.length);
        }
        catch (err) {
            throw insertRangeIfUndefined(err, str.getNonNaNRange());
        }
    }

    /**
     * Deletes all lines, where two first non-whitespace characters are '//'.
     *
     * @param str indexed string to be deleted comments in
     */
    public static deleteCommentLines(str: IndexedString) {
        const toJoin: IndexedString[] = str.split('\n').map(line => {
            let insideQuotes: boolean = false;
            let backslashes: number = 0;
            for (let i = 0; i < line.length(); ++i) {
                const curChar = line.charAt(i);
                // quotes found
                if (curChar === '"' && (backslashes % 2) === 0) {
                    insideQuotes = !insideQuotes;
                }
                if (insideQuotes && curChar === '\\') {
                    ++backslashes;
                }
                else {
                    backslashes = 0;
                }
                // double-backslash found outside quotes
                if (!insideQuotes && curChar === '/' && i > 0 && line.charAt(i - 1) === '/') {
                    return line.slice(0, i - 1);
                }
            }
            return line;
        });
        return IndexedString.join(toJoin, '\n');
    }
}