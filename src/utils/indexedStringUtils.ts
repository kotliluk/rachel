import { IndexedString } from '../types/indexedString'
import { StringUtils } from './stringUtils'
import { insertRangeIfUndefined } from '../error/errorWithTextRange'
import { RASyntaxError } from '../error/raSyntaxError'
import { ErrorFactory } from '../error/errorFactory'
import { language } from '../language/language'
import { Pair } from '../types/pair'

/**
 * Class providing general helper functions for IndexedString.
 * @category Utils
 * @public
 */
export class IndexedStringUtils {

  /**
     * Returns true if the string contains letters only and has length at least 1.
     *
     * @param str Checked indexed string {@type IndexedString}
     * @return true if the string contains letters only and has length at least 1 {@type boolean}
     * @public
     */
  static isWord (str: IndexedString): boolean {
    return StringUtils.isWord(str.toString())
  }

  /**
     * Returns true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore.
     *
     * @param str Checked string {@type IndexedString}
     * @return true if the string contains letters, numbers and underscores only, has length at least 1 and starts with
     * a letter or an underscore {@type boolean}
     * @public
     */
  static isName (str: IndexedString): boolean {
    return StringUtils.isName(str.toString())
  }

  /**
     * Returns true if the string contains whitespaces only.
     *
     * @param str Checked string {@type IndexedString}
     * @return true if the string contains whitespaces only {@type boolean}
     * @public
     */
  static isWhitespacesOnly (str: IndexedString): boolean {
    return StringUtils.isWhitespacesOnly(str.toString())
  }

  /**
     * Returns true if the given string has length one and the character is a letter.
     *
     * @param c Checked character {@type IndexedString}
     * @return true if the given string has length one and the character is a letter {@type boolean}
     * @public
     */
  static isLetter (c: IndexedString): boolean {
    return StringUtils.isLetter(c.toString())
  }

  /**
     * Returns true if the given string has length one and the character is a letter, a number or an underscore.
     *
     * @param c Checked character {@type IndexedString}
     * @return true if the given string has length one and the character is a letter, a number or an underscore {@type boolean}
     * @public
     */
  static isNameChar (c: IndexedString): boolean {
    return StringUtils.isNameChar(c.toString())
  }

  /**
     * Returns true if the given string has length one and the character is a digit.
     *
     * @param c Checked character {@type IndexedString}
     * @return true if the given string has length one and the character is a digit {@type boolean}
     * @public
     */
  static isDigit (c: IndexedString): boolean {
    return StringUtils.isDigit(c.toString())
  }

  /**
     * Returns true if the string represents a decimal number.
     *
     * @param str Checked string {@type IndexedString}
     * @return true if the string represents a decimal number {@type boolean}
     * @public
     */
  static isNumber (str: IndexedString): boolean {
    return StringUtils.isNumber(str.toString())
  }

  /**
     * Splits given indexed string to a starting sequence of letters and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, as a word is returned an empty string.
     *
     * @param str indexed string to be split {@type IndexedString}
     * @return split indexed string in a pair (word, rest) {@type Pair<IndexedString>}
     * @public
     */
  static nextWord (str: IndexedString): Pair<IndexedString> {
    const strParts: Pair<string> = StringUtils.nextWord(str.toString())
    return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length) }
  }

  /**
     * Splits given indexed string to a starting sequence of letters, numbers and underscores, which starts with a letter or
     * an underscore and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a letter, or an underscore, as a name is returned an empty string.
     *
     * @param str string to be split {@type IndexedString}
     * @return split indexed string in a pair (name, rest) {@type Pair<IndexedString>}
     * @public
     */
  static nextName (str: IndexedString): Pair<IndexedString> {
    const strParts: Pair<string> = StringUtils.nextName(str.toString())
    return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length) }
  }

  /**
     * Splits given indexed string to a starting sequence of non-whitespace characters and its rest and returns these
     * parts in a pair.
     *
     * @param str string to be split {@type IndexedString}
     * @return split indexed string in a pair (name, rest) {@type Pair<IndexedString>}
     * @public
     */
  static nextNonWhitespacePart (str: IndexedString): Pair<IndexedString> {
    const strParts: Pair<string> = StringUtils.nextNonWhitespacePart(str.toString())
    return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length) }
  }

  /**
     * Splits given indexed string to a starting number and its rest and returns these parts in a pair.
     * NOTE: if the string does not start with a digit, as a number is returned an empty string.
     *
     * @param str indexed string to be split {@type IndexedString}
     * @return split indexed string in a pair (word, rest) {@type Pair<IndexedString>}
     * @public
     */
  static nextNumber (str: IndexedString): Pair<IndexedString> {
    const strParts: Pair<string> = StringUtils.nextNumber(str.toString())
    return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length) }
  }

  /**
     * Splits the given indexed string into starting quoted part and the rest. Quotes can be escaped by an odd count of
     * backslashes.
     * NOTE: When the closing quote is not found until the rest of the line, unclosed string is returned
     * => the error is not thrown, it is only added to the return object.
     * NOTE: First character of the string is expected to be '"'.
     *
     * @param str string to be split {@type IndexedString}
     * @return pair of the starting bordered part and the rest {@type Object}
     * @public
     */
  static nextQuotedString (str: IndexedString): { first: IndexedString, second: IndexedString, error: RASyntaxError | undefined } {
    const strParts: { first: string, second: string, error: RASyntaxError | undefined } = StringUtils.nextQuotedString(str.toString())
    return {
      first: str.slice(0, strParts.first.length),
      second: str.slice(strParts.first.length),
      error: insertRangeIfUndefined(strParts.error, { start: str.getFirstIndex(), end: str.getFirstIndex() }),
    }
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
     * @param str indexed string to be split {@type IndexedString}
     * @param start starting character of the string and also starting character of the bordered part (one character) {@type string}
     * @param end ending characters of the bordered part (one or more characters) {@type string}
     * @param escape character which makes next character being ignored (default '\0') {@type string}
     * @return pair of the starting bordered part and the rest as indexed strings {@type Pair<IndexedString>}
     * @public
     */
  static nextBorderedPart (str: IndexedString, start: string, end: string, escape = '\0'): Pair<IndexedString> {
    try {
      const strParts: Pair<string> = StringUtils.nextBorderedPart(str.toString(), start, end, escape)
      return { first: str.slice(0, strParts.first.length), second: str.slice(strParts.first.length) }
    } catch (err) {
      throw insertRangeIfUndefined(err, { start: str.getFirstIndex(), end: str.getFirstIndex() })
    }
  }

  /**
     * Deletes all line and block comments from the given IndexedString.
     * If there is unclosed block comment, return the error as well.
     * Line comment "//comment\n" will be changed to "\n" - new line is kept.
     * Block comment "/\*comment* /" will be changed to " " - it is replaced by a space to ensure splitting of the content around.
     *
     * @param str string to delete comments in {@type IndexedString}
     * @return string with deleted comments and optimal error {@type Object}
     * @public
     */
  static deleteAllComments (str: IndexedString): {str: IndexedString, err: RASyntaxError | undefined} {
    const chars = str.copy().getChars()
    // to ignore special characters
    let inQuotes = false
    let inLineComment = false
    let blockCommentStart = -1
    let backslashes = 0

    for (let i = 0; i < chars.length; ++i) {
      const curChar = chars[i].char
      // found quote if even number of backslashes before
      if (curChar === '"' && (backslashes % 2) === 0 && !inLineComment && blockCommentStart === -1) {
        inQuotes = !inQuotes
      }
      // found start of a line comment if it is not in a comment already
      else if (curChar === '/' && i + 1 < chars.length && chars[i + 1].char === '/' && !inQuotes && !inLineComment && blockCommentStart === -1) {
        inLineComment = true
        chars[i].char = '\0'
        ++i    // skips '/'
      }
      // newlines ends the line comment
      else if (curChar === '\n') {
        inLineComment = false
      }
      // found start of a block comment if it is not in a comment already
      else if (curChar === '/' && i + 1 < chars.length && chars[i + 1].char === '*' && !inQuotes && !inLineComment && blockCommentStart === -1) {
        blockCommentStart = i
        chars[i].char = '\0'
        ++i    // skips '*'
        chars[i].char = ' '
      }
      // found end of a block comment
      else if (curChar === '*' && i + 1 < chars.length && chars[i + 1].char === '/' && blockCommentStart !== -1) {
        blockCommentStart = -1
        chars[i].char = '\0'
        ++i    // replaces '/' with space to force splitting of string in the comment place
        chars[i].char = ' '
      }
      // updates backslash count
      if (curChar === '\\') {
        ++backslashes
      } else {
        backslashes = 0
      }
      if (inLineComment || blockCommentStart !== -1) {
        chars[i].char = '\0'
      }
    }
    let err
    if (blockCommentStart !== -1) {
      const errStart = chars[blockCommentStart].index
      err = ErrorFactory.syntaxError(language().syntaxErrors.stringUtils_missingClosingChar,
              { start: errStart, end: errStart + 1 }, '*/', '/*')
    }
    // creates a new string from non-null characters
    return { str: IndexedString.newFromArray(chars.filter(c => c.char !== '\0')), err: err }
  }

  /**
     * Skips all whitespaces and exactly one given character and returns rest of the string.
     * If the string does not match this pattern, throws error.
     *
     * @param str string to be skipped in {@type IndexedString}
     * @param char char to be skipped exactly one time (expected to be string of length 1) {@type string}
     * @return given string without starting sequence of whitespaces and exactly one char {@type IndexedString}
     * @public
     */
  static skipWhitespacesAndChar (str: IndexedString, char: string): IndexedString {
    try {
      const skippedStr: string = StringUtils.skipWhitespacesAndChar(str.toString(), char)
      return str.slice(str.length() - skippedStr.length)
    } catch (err) {
      throw insertRangeIfUndefined(err, str.getRange())
    }
  }
}
