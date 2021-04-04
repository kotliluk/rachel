import ParserIndexed from "./parserIndexed";
import Parser from "./parser";

/**
 * Immutable string representation with index of each character. Provides some usual string functions.
 */
export class IndexedString {

    /**
     * Creates a new IndexedString instance representing the given string. StartIndex is used as the offset for indexes.
     * When the startIndex is omitted, 0 is used. When NaN is given, all indexes are NaN.
     * Indexes of the characters are (0 + startIndex, ..., str.length - 1 + startIndex).
     * NOTE: Each character has its own index. That means '\r\n' line separator has two indexes. For expected behavior, use
     * '\n' separator instead.
     *
     * @param str string
     * @param startIndex
     */
    public static new(str: string, startIndex: number = 0): IndexedString {
        return new IndexedString(str, str.split('').map((char, index) => {return {char: char, index: index + startIndex}}));
    }

    /**
     * Creates a new IndexedString instance representing an empty string "".
     */
    public static empty(): IndexedString {
        return new IndexedString('', []);
    }

    /**
     * Creates a new IndexedString instance representing the given array of IndexedChars.
     * The array is deep copied for immutability.
     *
     * @param arr IndexedChar array
     */
    public static newFromArray(arr: IndexedChar[]): IndexedString {
        return new IndexedString(arr.map(ic => ic.char).join(''), arr.map(ic => {return {char: ic.char, index: ic.index}}));
    }

    /**
     * Joins given array of IndexedStrings with given separator. When the separator is omitted, empty string "" is used.
     * All characters of all inserted separators will have NaN indexes.
     *
     * @param arr array to join
     * @param separator separator string
     */
    public static join(arr: IndexedString[], separator?: string): IndexedString {
        if (arr.length === 0) {
            return IndexedString.empty();
        }
        if (arr.length === 1) {
            return arr[0];
        }
        if (separator === undefined) {
            separator = '';
        }
        const isSep: IndexedString = IndexedString.new(separator, NaN);
        const toConcat: IndexedString[] = Array<IndexedString>(2 * arr.length - 2);
        for (let i = 1; i < arr.length; i++) {
            toConcat[2 * i - 2] = isSep;
            toConcat[2 * i - 1] = arr[i];
        }
        return arr[0].concat(...toConcat);
    }

    /**
     * Private constructor to ensure compatible string and IndexCharArray.
     *
     * @param str string representation
     * @param chars IndexedChar representation
     */
    private constructor(private readonly str: string, private readonly chars: IndexedChar[]) { }

    /**
     * Returns string representation of the IndexedString.
     */
    public toString(): string {
        return this.str;
    }

    /**
     * Returns length of the string.
     */
    public length(): number {
        return this.str.length;
    }

    /**
     * Returns true if the IndexedString represents an empty string "".
     */
    public isEmpty(): boolean {
        return this.length() === 0;
    }

    /**
     * Returns IndexedChar array representing the IndexedString.
     * The array is deep copied.
     */
    public getChars(): IndexedChar[] {
        const ret: IndexedChar[] = Array<IndexedChar>(this.length());
        this.chars.forEach((char, i) => {ret[i] = {char: char.char, index: char.index}})
        return ret;
    }

    /**
     * Returns the index of the first character of the IndexedString. Returns undefined if empty.
     */
    public getFirstIndex(): number | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.chars[0].index;
    }

    /**
     * Returns the index of the last character of the IndexedString. Returns undefined if empty.
     */
    public getLastIndex(): number | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.chars[this.length() - 1].index;
    }

    /**
     * Returns the first non-NaN index of a character of the IndexedString. Returns undefined if empty.
     * If all indexes are NaN, NaN is returned.
     */
    public getFirstNonNaNIndex(): number | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        for (let i = 0; i < this.length(); i++) {
            if (!isNaN(this.chars[i].index)) {
                return this.chars[i].index;
            }
        }
        return NaN;
    }

    /**
     * Returns the last non-NaN index of a character of the IndexedString. Returns undefined if empty.
     * If all indexes are NaN, NaN is returned.
     */
    public getLastNonNaNIndex(): number | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        for (let i = this.length() - 1; i >= 0; i--) {
            if (!isNaN(this.chars[i].index)) {
                return this.chars[i].index;
            }
        }
        return NaN;
    }

    /**
     * Returns indexes of the first and the last character of the IndexedString. Returns undefined if empty.
     */
    public getRange(): {start: number, end: number} | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return { start: this.chars[0].index, end: this.chars[this.length() - 1].index };
    }

    /**
     * Returns the first and the last non-NaN indexes of characters of the IndexedString. Returns undefined if empty or
     * if all indexes are NaN.
     */
    public getNonNaNRange(): {start: number, end: number} | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        // @ts-ignore
        const start: number = this.getFirstNonNaNIndex();
        // returns undefined when all indexes are NaN
        if (isNaN(start)) {
            return undefined;
        }
        // @ts-ignore
        const end: number = this.getLastNonNaNIndex();
        return { start: start, end: end };
    }

    /**
     * Returns an IndexedString representation of the character at the given index. Throws RangeError if the index is
     * out of string bounds.
     *
     * @param index number
     */
    public indexedCharAt(index: number): IndexedString {
        if (index < 0 || index >= this.length()) {
            throw new RangeError();
        }
        return IndexedString.newFromArray([this.chars[index]]);
    }

    /**
     * Returns a string representation of the character at the given index. Throws RangeError if the index is
     * out of IndexedString bounds.
     *
     * @param index
     */
    public charAt(index: number): string {
        if (index < 0 || index >= this.length()) {
            throw new RangeError();
        }
        return this.chars[index].char;
    }

    /**
     * Returns an original position index of the character at the given current index. Throws RangeError if the given index is
     * out of IndexedString bounds.
     *
     * @param index
     */
    public indexAt(index: number): number {
        if (index < 0 || index >= this.length()) {
            throw new RangeError();
        }
        return this.chars[index].index;
    }

    /**
     * Split a string into substrings using the specified separator and return them as an array.
     * It does not accept RegEx separators and array limit as built-in string.
     *
     * @param separator string separator
     */
    public split(separator: string): IndexedString[] {
        if (this.isEmpty()) {
            if (separator === '') {
                return [];
            }
            return [IndexedString.empty()];
        }
        const sepLen: number = separator.length;
        const strSplit: string[] = this.str.split(separator);
        const prefixSum: number[] = Array<number>(strSplit.length);
        prefixSum[0] = 0;
        for (let i = 1; i < strSplit.length; i++) {
            prefixSum[i] = prefixSum[i - 1] + strSplit[i - 1].length + sepLen;
        }

        return strSplit.map((strSplit, index) => {
            return new IndexedString(strSplit, this.chars.slice(prefixSum[index], prefixSum[index] + strSplit.length));
        });
    }

    /**
     * Returns a section of a IndexedString.
     *
     * @param start The index of the beginning of the specified portion of stringObj.
     * @param end The index of the end of the specified portion of IndexedString. The substring includes the characters
     * up to, but not including, the character indicated by end. If this value is not specified, the substring
     * continues to the end of IndexedString.
     */
    public slice(start: number, end?: number): IndexedString {
        const _start = start < 0 ? this.length() + start : start;
        const _end = end !== undefined ? (end < 0 ? this.length() + end : end) : this.length();
        if (_start > _end || _start < 0 || _end > this.length()) {
            throw new RangeError();
        }
        return IndexedString.newFromArray(this.chars.slice(_start, _end));
    }

    /**
     * Removes the leading and trailing white space and line terminator characters from a string.
     */
    public trim(): IndexedString {
        const trimStr: string = this.str.trim();
        if (trimStr === '') {
            return new IndexedString('', []);
        }
        const start: number = this.str.indexOf(trimStr.charAt(0));
        return IndexedString.newFromArray(this.chars.slice(start, start + trimStr.length));
    }

    /**
     * Returns a string that contains the concatenation of this IndexedString with multiple other.
     *
     * @param strings The IndexedStrings to append to the end of the string.
     */
    public concat(...strings: IndexedString[]) {
        return IndexedString.newFromArray(this.chars.concat(...strings.map(is => is.chars)));
    }

    /**
     * Returns true if the searchString sequence is the same as the corresponding
     * elements of this object starting at position. Otherwise returns false.
     *
     * @param searchString
     * @param position
     */
    public startsWith(searchString: string, position?: number | undefined): boolean {
        return this.str.startsWith(searchString, position);
    }

    /**
     * Returns true if the searchString sequence is the same as the corresponding
     * elements of this object starting at endPosition – searchString.length. Otherwise returns false.
     *
     * @param searchString
     * @param position
     */
    public endsWith(searchString: string, position?: number | undefined): boolean {
        return this.str.endsWith(searchString, position);
    }

    /**
     * Replaces text in a string, using a regular expression or search string.
     * NOTE: Returns built-in string.
     *
     * @param searchValue A string or RegEx to search for.
     * @param replaceValue A string containing the text to replace for every successful match of searchValue in this string.
     */
    public replace(searchValue: string | RegExp, replaceValue: string): string {
        return this.str.replace(searchValue, replaceValue);
    }

    /**
     * Returns the position of the first occurrence of a substring.
     *
     * @param searchValue The substring to search for in the string
     * @param fromIndex The index at which to begin searching the String object. If omitted, search starts at the beginning of the string.
     */
    public indexOf(searchValue: string, fromIndex?: number): number {
        return this.str.indexOf(searchValue, fromIndex);
    }

    /**
     * Matches a string with a regular expression, and returns an array containing the results of that search.
     *
     * @param regexp A variable name or string literal containing the regular expression pattern and flags.
     */
    public match(regexp: string | RegExp): RegExpMatchArray | null {
        return this.str.match(regexp);
    }

    /**
     * Creates a deep copy of the IndexedString.
     */
    public copy(): IndexedString {
        return new IndexedString(this.str, this.chars.map(ic => {return {char: ic.char, index: ic.index}}));
    }

    /**
     * Returns deep copy of the string with all whitespaces removed.
     */
    public removeWhitespaces(): IndexedString {
        return new IndexedString(this.str.replace(/\s/g, ''), this.chars
            .filter(ic => {return !/\s/.test(ic.char)})
            .map(ic => {return {char: ic.char, index: ic.index}})
        );
    }

    /**
     * Returns next index of the string (this.getLastIndex() + 1), if last index of the string is a number.
     * Otherwise, returns NaN.
     */
    public getNextIndexOrNaN(): number {
        const lastIndex = this.getLastIndex();
        return lastIndex === undefined ? NaN : lastIndex + 1;
    }
}

/**
 * Indexed representation of one character.
 * WARNING: It is always assumed that IndexedChar.char is a string of length 1.
 */
export interface IndexedChar {
    char: string,
    index: number
}

/**
 * Gets string range: when IndexedString given, returns str.getNonNaNRange(), when string given, returns undefined.
 *
 * @param str string to get the range of
 */
export function getRange(str: string | IndexedString): {start: number, end: number} | undefined {
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
 * Returns next bordered part of the given string. Returned parts are of the same type as the argument.
 *
 * @param str
 * @param start
 * @param end
 * @param escape
 */
export function nextBorderedPart(str: string | IndexedString, start: string, end: string, escape?: string):
    {first: IndexedString, second: IndexedString} | {first: string, second: string} {
    if (str instanceof IndexedString) {
        return ParserIndexed.nextBorderedPart(str, start, end, escape);
    }
    return Parser.nextBorderedPart(str, start, end, escape);
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