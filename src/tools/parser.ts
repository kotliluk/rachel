import {ErrorFactory, SyntaxErrorCodes} from "../error/errorFactory";

/**
 * Parser providing general parsing helper functions.
 */
export default class Parser {

    /**
     * @param str Checked string
     * @return true if the string contains letters only and has length at least 1
     */
    public static isWord(str: string): boolean {
        return str.length > 0 && str.split("").every(c => Parser.isLetter(c));
    }

    /**
     * @param str Checked string
     * @return true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore
     */
    public static isName(str: string): boolean {
        if (str.length === 0) {
            return false;
        }
        if (!Parser.isLetter(str.charAt(0)) && str.charAt(0) !== '_') {
            return false;
        }
        return str.split("").every(c => Parser.isNameChar(c));
    }

    /**
     * @param str Checked string
     * @return true if the string contains whitespaces only
     */
    public static isWhitespacesOnly(str: string): boolean {
        const regex = /\s*/;
        const res = regex.exec(str);
        return res === null ? false : res[0] === str;
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a letter
     */
    public static isLetter(c: string): boolean {
        return c.length === 1 && c.toLowerCase() !== c.toUpperCase();
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a letter, a number or an underscore
     */
    public static isNameChar(c: string): boolean {
        return Parser.isLetter(c) || Parser.isDigit(c) || c === '_';
    }

    /**
     * @param c Checked character
     * @return true if the given string has length one and the character is a digit
     */
    public static isDigit(c: string): boolean {
        return c.length === 1 && c.match(/\d/) !== null;
    }

    /**
     * @param str Checked string
     * @return true if the string represents a decimal number
     */
    public static isNumber(str: string): boolean {
        return /^[-]?[\d]+([.][\d]+)?$/.test(str);
    }

    /**
     * Checks whether the given string starts and ends with double quotes and all double quotes used inside it are
     * escaped by '\'.
     */
    public static isStringLiteral(str: string): boolean {
        if (str.length < 2 || str[0] !== '"') {
            return false;
        }
        try {
            const split = Parser.nextBorderedPart(str, '"', '"', '\\');
            return split.first.length === str.length;
        }
        catch (err) {
            return false;
        }
    }

    /**
     * Splits given string to a starting sequence of letters and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, as a word is returned an empty string.
     *
     * @param str string to be split
     * @return split string in a pair { word, rest }
     */
    public static nextWord(str: string): { first: string, second: string } {
        if (str === "") {
            return { first: "", second: "" };
        }
        let i: number = 0;
        while (i < str.length) {
            if (!Parser.isLetter(str.charAt(i))) {
                return { first: str.substring(0, i), second: str.substring(i)};
            }
            ++i;
        }
        return { first: str, second: ""};
    }

    /**
     * Splits given string to a starting sequence of letters, numbers and underscores, which starts with a letter or
     * an underscore and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, or an underscore, as a name is returned an empty string.
     *
     * @param str string to be split
     * @return split string in a pair { name, rest }
     */
    public static nextName(str: string): { first: string, second: string } {
        if (str === "") {
            return { first: "", second: "" };
        }
        if (!Parser.isLetter(str.charAt(0)) && str.charAt(0) !== '_') {
            return { first: "", second: str };
        }
        let i: number = 0;
        while (i < str.length) {
            const char: string = str.charAt(i);
            if (!Parser.isLetter(char) && !Parser.isDigit(char) && char !== '_') {
                return { first: str.substring(0, i), second: str.substring(i)};
            }
            ++i;
        }
        return { first: str, second: ""};
    }

    /**
     * Splits given string to a starting sequence of non-whitespace characters and its rest and returns these parts in a pair.
     *
     * @param str string to be split
     * @return split string in a pair { word, rest }
     */
    public static nextNonWhitespacePart(str: string): { first: string, second: string } {
        if (str === "") {
            return { first: "", second: "" };
        }
        let i: number = 0;
        while (i < str.length) {
            if (str.charAt(i).match(/\s/)) {
                return { first: str.substring(0, i), second: str.substring(i)};
            }
            ++i;
        }
        return { first: str, second: ""};
    }

    /**
     * Splits given string to a starting number and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a digit, as a number is returned an empty string.
     *
     * @param str string to be split
     * @return split string in a pair (word, rest)
     */
    static nextNumber(str: string): { first: string, second: string } {
        if (str === "") {
            return { first: "", second: "" };
        }
        let i: number = 0;
        // string starts with '-' sign
        if (str.charAt(0) === '-') {
            // if there is a digit after '-', shifts the start
            if (str.length > 1 && Parser.isDigit(str.charAt(1))) {
                i = 1;
            }
            // there is no digit
            else {
                return { first: "", second: str };
            }
        }
        let digitFound: boolean = false;
        let dotFound: boolean = false;
        while (i < str.length) {
            if (Parser.isDigit(str.charAt(i))) {
                digitFound = true;
                ++i;
            }
            else if (str.charAt(i) === '.') {
                // second dot or a dot without previous digits
                if (dotFound || !digitFound) {
                    break;
                }
                else {
                    dotFound = true;
                    ++i;
                }
            }
            else {
                break;
            }
        }
        const numStr = str.substring(0, i);
        const rest = str.substring(i);
        return { first: numStr, second: rest };
    }

    /**
     * Splits the string to the starting bordered part and the rest and returns these parts in a pair.
     * If there is only one ending character and it differs from the starting one, nested bordering is supported.
     * Characters after an odd count of escape characters are ignored and cannot start or end a bordered part.
     * Starting and ending characters in quoted part are ignored, quotes can be escaped by an odd count of backslashes.
     * NOTE: First character of the string is expected to be 'start'.
     *
     * @param str string to be split
     * @param start starting character of the string and also starting character of the bordered part (one character)
     * @param end ending characters of the bordered part (one or more characters)
     * @param escape character which makes next character being ignored (default '\0')
     * @return pair of the starting bordered part and the rest
     */
    static nextBorderedPart(str: string, start: string, end: string, escape: string = '\0'): { first: string, second: string } {
        let depth: number = 1;
        let i: number = 1;
        // to ignore special characters in quoted part
        let inQuotes: boolean = false;
        // nested bordering is supported if there is only one ending character
        const nesting: boolean = end.length === 1;
        // backslashes escape the quote character only in odd count
        let backslashes: number = 0;
        // escape characters escape the end character only in odd count
        let escapeCount: number = 0;
        while (i < str.length) {
            const curChar = str.charAt(i);
            // checks end of the part (before checking start for a case when start == end)
            if (end.indexOf(curChar) > -1 && (escapeCount % 2) === 0 && !inQuotes) {
                --depth;
            }
            // checks start of the bordered part (if only one ending character was given)
            else if (curChar === start && (escapeCount % 2) === 0 && nesting && !inQuotes) {
                ++depth;
            }
            // found quote - changes ignoring of special chars
            else if (curChar === '"' && (backslashes % 2) === 0) {
                inQuotes = !inQuotes;
            }
            // updates escape chars count
            if (curChar === escape) {
                ++escapeCount;
            }
            else {
                escapeCount = 0;
            }
            // updates backslash count
            if (curChar === '\\') {
                ++backslashes;
            }
            else {
                backslashes = 0;
            }
            ++i;
            if (depth === 0) {
                const partOne: string = str.substring(0, i);
                let partTwo: string = (i < str.length) ? str.substring(i) : "";
                return { first: partOne, second: partTwo };
            }
        }
        throw ErrorFactory.syntaxError(SyntaxErrorCodes.parser_nextBorderedPart_missingClosingChar, undefined,
            end.split('').join("' or '"), start);
    }

    /**
     * Skips all whitespaces and exactly one given character and returns rest of the string.
     * If the string does not match this pattern, throws error.
     *
     * @param str string to be skipped in
     * @param char char to be skipped exactly one time (expected to be string of length 1)
     * @return given string without starting sequence of whitespaces and exactly one char
     */
    public static skipWhitespacesAndChar(str: string, char: string): string {
        let charFound: boolean = false;
        let i: number = 0;
        while (i < str.length) {
            if (str.charAt(i).match(/\s/)) {
                ++i;
            }
            else if (str.charAt(i) === char && !charFound) {
                charFound = true;
                ++i;
            }
            else {
                break;
            }
        }
        if (!charFound) {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.parser_skipWhitespacesAndChar_charNotFound, undefined, char);
        }
        return str.substring(i);
    }

    /**
     * Deletes all lines, where two first non-whitespace characters are '//'.
     *
     * @param str string to be deleted comments in
     */
    public static deleteCommentLines(str: string) {
        return str.split('\n').map(line => {
            let insideQuotes: boolean = false;
            for (let i = 0; i < line.length; ++i) {
                // quotes found
                if (line.charAt(i) === '"') {
                    if (insideQuotes && line.charAt(i - 1) !== '\\') {
                        insideQuotes = false;
                    }
                    else if (!insideQuotes) {
                        insideQuotes = true;
                    }
                }
                // double-backslash found outside quotes
                if (!insideQuotes && line.charAt(i) === '/' && i > 0 && line.charAt(i - 1) === '/') {
                    return line.slice(0, i - 1);
                }
            }
            return line;
        }).join('\n');
    }
}