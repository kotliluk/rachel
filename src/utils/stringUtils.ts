import { ErrorFactory } from '../error/errorFactory'
import { RASyntaxError } from '../error/raSyntaxError'
import { language } from '../language/language'
import { Pair } from '../types/pair'

/**
 * Class providing general helper functions for strings.
 * @category Utils
 * @public
 */
export class StringUtils {

  /**
     * Returns true if the string contains letters only and has length at least 1.
     *
     * @param str Checked string {@type string}
     * @return true if the string contains letters only and has length at least 1 {@type boolean}
     * @public
     */
  static isWord (str: string): boolean {
    return str.length > 0 && str.split('').every(c => StringUtils.isLetter(c))
  }

  /**
     * Returns true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore.
     *
     * @param str Checked string {@type string}
     * @return true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore {@type boolean}
     * @public
     */
  static isName (str: string): boolean {
    if (str.length === 0) {
      return false
    }
    if (!StringUtils.isLetter(str.charAt(0)) && !str.startsWith('_')) {
      return false
    }
    return str.split('').every(c => StringUtils.isNameChar(c))
  }

  /**
     * Returns true if the string contains whitespaces only.
     *
     * @param str Checked string {@type string}
     * @return true if the string contains whitespaces only {@type boolean}
     * @public
     */
  static isWhitespacesOnly (str: string): boolean {
    const regex = /\s*/
    const res = regex.exec(str)
    return res === null ? false : res[0] === str
  }

  /**
     * Returns true if the given string has length one and the character is a letter.
     *
     * @param c Checked character {@type string}
     * @return true if the given string has length one and the character is a letter {@type boolean}
     * @public
     */
  static isLetter (c: string): boolean {
    return c.length === 1 && c.toLowerCase() !== c.toUpperCase()
  }

  /**
     * Returns true if the given string has length one and the character is a letter, a number or an underscore.
     *
     * @param c Checked character {@type string}
     * @return true if the given string has length one and the character is a letter, a number or an underscore {@type boolean}
     * @public
     */
  static isNameChar (c: string): boolean {
    return StringUtils.isLetter(c) || StringUtils.isDigit(c) || c === '_'
  }

  /**
     * Returns true if the given string has length one and the character is a digit.
     *
     * @param c Checked character {@type string}
     * @return true if the given string has length one and the character is a digit {@type boolean}
     * @public
     */
  static isDigit (c: string): boolean {
    return c.length === 1 && (/\d/.exec(c)) !== null
  }

  /**
     * Returns true if the string represents a decimal number.
     *
     * @param str Checked string {@type string}
     * @return true if the string represents a decimal number {@type boolean}
     * @public
     */
  static isNumber (str: string): boolean {
    return /^[-]?[\d]+([.][\d]+)?$/.test(str)
  }

  /**
     * Splits given string to a starting sequence of letters and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, as a word is returned an empty string.
     *
     * @param str string to be split {@type string}
     * @return split string in a pair (word, rest) {@type Pair<string>}
     * @public
     */
  static nextWord (str: string): Pair<string> {
    if (str === '') {
      return { first: '', second: '' }
    }
    let i = 0
    while (i < str.length) {
      if (!StringUtils.isLetter(str.charAt(i))) {
        return { first: str.substring(0, i), second: str.substring(i) }
      }
      ++i
    }
    return { first: str, second: '' }
  }

  /**
     * Splits given string to a starting sequence of letters, numbers and underscores, which starts with a letter or
     * an underscore and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, or an underscore, as a name is returned an empty string.
     *
     * @param str string to be split {@type string}
     * @return split string in a pair (name, rest) {@type Pair<string>}
     * @public
     */
  static nextName (str: string): Pair<string> {
    if (str === '') {
      return { first: '', second: '' }
    }
    if (!StringUtils.isLetter(str.charAt(0)) && !str.startsWith('_')) {
      return { first: '', second: str }
    }
    let i = 0
    while (i < str.length) {
      const char: string = str.charAt(i)
      if (!StringUtils.isLetter(char) && !StringUtils.isDigit(char) && char !== '_') {
        return { first: str.substring(0, i), second: str.substring(i) }
      }
      ++i
    }
    return { first: str, second: '' }
  }

  /**
     * Splits given string to a starting sequence of non-whitespace characters and its rest and returns these parts in a pair.
     *
     * @param str string to be split {@type string}
     * @return split string in a pair (start, rest) {@type Pair<string>}
     * @public
     */
  static nextNonWhitespacePart (str: string): Pair<string> {
    if (str === '') {
      return { first: '', second: '' }
    }
    let i = 0
    while (i < str.length) {
      if (/\s/.exec(str.charAt(i))) {
        return { first: str.substring(0, i), second: str.substring(i) }
      }
      ++i
    }
    return { first: str, second: '' }
  }

  /**
     * Splits given string to a starting number and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a digit, as a number is returned an empty string.
     *
     * @param str string to be split {@type string}
     * @return split string in a pair (word, rest) {@type Pair<string>}
     * @public
     */
  static nextNumber (str: string): Pair<string> {
    if (str === '') {
      return { first: '', second: '' }
    }
    let i = 0
    // string starts with '-' sign
    if (str.startsWith('-')) {
      // if there is a digit after '-', shifts the start
      if (str.length > 1 && StringUtils.isDigit(str.charAt(1))) {
        i = 1
      }
      // there is no digit
      else {
        return { first: '', second: str }
      }
    }
    let digitFound = false
    let dotFound = false
    while (i < str.length) {
      if (StringUtils.isDigit(str.charAt(i))) {
        digitFound = true
        ++i
      } else if (str.charAt(i) === '.') {
        // second dot or a dot without previous digits
        if (dotFound || !digitFound) {
          break
        } else {
          dotFound = true
          ++i
        }
      } else {
        break
      }
    }
    const numStr = str.substring(0, i)
    const rest = str.substring(i)
    return { first: numStr, second: rest }
  }

  /**
     * Splits the given string into starting quoted part and the rest. Quotes can be escaped by an odd count of
     * backslashes.
     * NOTE: When the closing quote is not found until the rest of the line, unclosed string is returned
     * => the error is not thrown, it is only added to the return object.
     * NOTE: First character of the string is expected to be '"'.
     *
     * @param str string to be split {@type string}
     * @return the starting quoted part, the rest, and optimal error {@type Object}
     * @public
     */
  static nextQuotedString (str: string): { first: string, second: string, error: RASyntaxError | undefined } {
    let i = 1
    // backslashes escape the quote character only in odd count
    let backslashes = 0
    while (i < str.length) {
      const curChar = str.charAt(i)
      // increases index for using "i" in slicing
      ++i
      if (curChar === '"' && (backslashes % 2) === 0) {
        return { first: str.slice(0, i), second: str.slice(i), error: undefined }
      }
      // end of line breaks the string
      if (curChar === '\n') {
        return {
          first: str.slice(0, i),
          second: str.slice(i),
          error: ErrorFactory.syntaxError(language().syntaxErrors.stringUtils_missingClosingChar,
                        undefined, '"', '"'),
        }
      }
      // updates backslash count
      if (curChar === '\\') {
        ++backslashes
      } else {
        backslashes = 0
      }
    }
    return {
      first: str,
      second: '',
      error: ErrorFactory.syntaxError(language().syntaxErrors.stringUtils_missingClosingChar,
                undefined, '"', '"'),
    }
  }

  /**
     * Splits the string to the starting bordered part and the rest and returns these parts in a pair.
     * If there is only one ending character and it differs from the starting one, nested bordering is supported.
     * Characters after an odd count of escape characters are ignored and cannot start or end a bordered part.
     * Starting and ending characters in quoted part are ignored, quotes can be escaped by an odd count of backslashes.
     * NOTE: First character of the string is expected to be 'start'.
     * NOTE: Should not be used for slicing quoted strings, use nextQuotedString instead.
     * NOTE: It is expected, that there are no comments in the given string.
     *
     * @param str string to be split {@type string}
     * @param start starting character of the string and also starting character of the bordered part (one character) {@type string}
     * @param end ending characters of the bordered part (one or more characters) {@type string}
     * @param escape character which makes next character being ignored (default '\0') {@type string}
     * @return pair of the starting bordered part and the rest {@type Pair<string>}
     * @public
     */
  static nextBorderedPart (str: string, start: string, end: string, escape = '\0'): Pair<string> {
    let depth = 1
    let i = 1
    // to ignore special characters
    let inQuotes = false
    // nested bordering is supported if there is only one ending character
    const nesting: boolean = end.length === 1
    // backslashes escape the quote character only in odd count
    let backslashes = 0
    // escape characters escape the end character only in odd count
    let escapeCount = 0
    while (i < str.length) {
      const curChar = str.charAt(i)
      // checks end of the part (before checking start for a case when start == end)
      if (end.includes(curChar) && (escapeCount % 2) === 0 && !inQuotes) {
        --depth
      }
      // checks start of the bordered part (if only one ending character was given)
      else if (curChar === start && (escapeCount % 2) === 0 && nesting && !inQuotes) {
        ++depth
      }
      // found quote if even number of backslashes before
      else if (curChar === '"' && (backslashes % 2) === 0) {
        inQuotes = !inQuotes
      }
      // updates escape chars count
      if (curChar === escape) {
        ++escapeCount
      } else {
        escapeCount = 0
      }
      // updates backslash count
      if (curChar === '\\') {
        ++backslashes
      } else {
        backslashes = 0
      }
      // increases index for before slicing
      ++i
      if (depth === 0) {
        return { first: str.slice(0, i), second: str.slice(i) }
      }
    }
    throw ErrorFactory.syntaxError(language().syntaxErrors.stringUtils_missingClosingChar, undefined,
            end.split('').join("' / '"), start)
  }

  /**
     * Skips all whitespaces and exactly one given character and returns rest of the string.
     * If the string does not match this pattern, throws error.
     *
     * @param str string to be skipped in {@type string}
     * @param char char to be skipped exactly one time (expected to be string of length 1) {@type string}
     * @return given string without starting sequence of whitespaces and exactly one char {@type string}
     * @public
     */
  static skipWhitespacesAndChar (str: string, char: string): string {
    let charFound = false
    let i = 0
    while (i < str.length) {
      if (/\s/.exec(str.charAt(i))) {
        ++i
      } else if (str.charAt(i) === char && !charFound) {
        charFound = true
        ++i
      } else {
        break
      }
    }
    if (!charFound) {
      throw ErrorFactory.syntaxError(language().syntaxErrors.stringUtils_charNotFound, undefined, char)
    }
    return str.substring(i)
  }
}
