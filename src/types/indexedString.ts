import {StartEndPair} from "./startEndPair";

/**
 * String representation with index of each character. Provides some usual string functions.
 */
export class IndexedString {

    /**
     * Creates a new IndexedString instance representing the given string. StartIndex is used as the offset for indexes.
     * When the startIndex is omitted, 0 is used. When NaN is given, all indexes are NaN.
     * Indexes of the characters are (0 + startIndex, ..., str.length - 1 + startIndex).
     * NOTE: Each character has its own index. That means '\r\n' line separator has two indexes. For expected behavior, use
     * '\n' separator instead.
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
     */
    public static newFromArray(arr: IndexedChar[]): IndexedString {
        return new IndexedString(arr.map(ic => ic.char).join(''), arr);
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
     * The array is reference to inner IndexedString structure.
     */
    public getChars(): IndexedChar[] {
        return this.chars;
    }

    /**
     * Returns the first index of a character of the IndexedString. Returns NaN if empty.
     */
    public getFirstIndex(): number {
        if (this.isEmpty()) {
            return NaN;
        }
        return this.chars[0].index;
    }

    /**
     * Returns the last index of a character of the IndexedString. Returns NaN if empty.
     */
    public getLastIndex(): number {
        if (this.isEmpty()) {
            return NaN;
        }
        return this.chars[this.length() - 1].index;
    }

    /**
     * Returns indexes of the first and the last character of the IndexedString. Returns undefined if empty.
     */
    public getRange(): StartEndPair | undefined {
        if (this.isEmpty()) {
            return undefined;
        }
        return { start: this.chars[0].index, end: this.chars[this.length() - 1].index };
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
     * Split a string into substrings using the '\n' separator and return them as an array.
     * Also, it returns indexes of removed '\n's.
     */
    public splitToLines(): {split: IndexedString[], separatorIndexes: number[]} {
        if (this.isEmpty()) {
            return {split: [IndexedString.empty()], separatorIndexes: []};
        }
        const strSplit: string[] = this.str.split('\n');
        const strSplitLenMinusOne = strSplit.length - 1;
        const prefixSum: number[] = Array<number>(strSplit.length);
        const separatorIndexes: number[] = Array<number>(strSplit.length - 1);
        prefixSum[0] = 0;
        for (let i = 0; i < strSplitLenMinusOne; i++) {
            const ps = prefixSum[i] + strSplit[i].length + 1;
            separatorIndexes[i] = this.indexAt(ps - 1);
            prefixSum[i + 1] = ps;
        }

        const split = strSplit.map((strSplit, index) => {
            return new IndexedString(strSplit, this.chars.slice(prefixSum[index], prefixSum[index] + strSplit.length));
        });
        return {split, separatorIndexes};
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
     * Creates a deep copy of the IndexedString.
     */
    public copy(): IndexedString {
        return new IndexedString(this.str, this.chars.map(ic => {return {char: ic.char, index: ic.index}}));
    }

    /**
     * Returns true if it contains any of the characters from string chars. Otherwise, returns false.
     */
    public containsAny(chars: string): boolean {
        for (let i = 0; i < chars.length; ++i) {
            if (this.str.indexOf(chars[i]) > -1) {
                return true;
            }
        }
        return false;
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