import { StringUtils } from '../stringUtils'


describe('StringUtils (group: #utils)', () => {
  describe('isWord', () => {
    test('true for only-letter-strings', () => {
      const w1 = 'Word'
      const w2 = 'WordWord'
      const w3 = 'aaaaWord'
      const w4 = 'čřžšá'
      const w5 = 'ŠČíáopL'

      expect(StringUtils.isWord(w1)).toBeTruthy()
      expect(StringUtils.isWord(w2)).toBeTruthy()
      expect(StringUtils.isWord(w3)).toBeTruthy()
      expect(StringUtils.isWord(w4)).toBeTruthy()
      expect(StringUtils.isWord(w5)).toBeTruthy()
    })

    test('false for string with a non-letter character', () => {
      const w1 = 'Word '
      const w2 = 'Word Word'
      const w3 = ' aaaaWord'
      const w4 = 'WORD2'
      const w5 = 'woČŘ.'

      expect(StringUtils.isWord(w1)).toBeFalsy()
      expect(StringUtils.isWord(w2)).toBeFalsy()
      expect(StringUtils.isWord(w3)).toBeFalsy()
      expect(StringUtils.isWord(w4)).toBeFalsy()
      expect(StringUtils.isWord(w5)).toBeFalsy()
    })
  })

  describe('isName', () => {
    test('true for valid names', () => {
      const w1 = 'Word'
      const w2 = '_Word'
      const w3 = 'aaaaWord123'
      const w4 = 'ŠČř_123__žšá'

      expect(StringUtils.isName(w1)).toBeTruthy()
      expect(StringUtils.isName(w2)).toBeTruthy()
      expect(StringUtils.isName(w3)).toBeTruthy()
      expect(StringUtils.isName(w4)).toBeTruthy()
    })

    test('false for invalid names', () => {
      const w1 = 'Word '
      const w2 = 'Word Word'
      const w3 = ' aaaaWord'
      const w4 = '123WORD'

      expect(StringUtils.isName(w1)).toBeFalsy()
      expect(StringUtils.isName(w2)).toBeFalsy()
      expect(StringUtils.isName(w3)).toBeFalsy()
      expect(StringUtils.isName(w4)).toBeFalsy()
    })
  })

  describe('isWhitespacesOnly', () => {
    test('true for only-whitespaces-strings', () => {
      const w1 = ' '
      const w2 = '   '
      const w3 = ' \n\t '
      const w4 = ''

      expect(StringUtils.isWhitespacesOnly(w1)).toBeTruthy()
      expect(StringUtils.isWhitespacesOnly(w2)).toBeTruthy()
      expect(StringUtils.isWhitespacesOnly(w3)).toBeTruthy()
      expect(StringUtils.isWhitespacesOnly(w4)).toBeTruthy()
    })

    test('false for string with a non-whitespace character', () => {
      const w1 = 'Word '
      const w2 = '    a   '
      const w3 = '\na\n'
      const w4 = '\t\t \t.\n'

      expect(StringUtils.isWhitespacesOnly(w1)).toBeFalsy()
      expect(StringUtils.isWhitespacesOnly(w2)).toBeFalsy()
      expect(StringUtils.isWhitespacesOnly(w3)).toBeFalsy()
      expect(StringUtils.isWhitespacesOnly(w4)).toBeFalsy()
    })
  })

  describe('isLetter', () => {
    test('true for letters', () => {
      const w1 = 'a'
      const w2 = 'A'
      const w3 = 'č'
      const w4 = 'í'

      expect(StringUtils.isLetter(w1)).toBeTruthy()
      expect(StringUtils.isLetter(w2)).toBeTruthy()
      expect(StringUtils.isLetter(w3)).toBeTruthy()
      expect(StringUtils.isLetter(w4)).toBeTruthy()
    })

    test('false for non-letters and longer strings', () => {
      const w1 = ' '
      const w2 = '.'
      const w3 = 'abcd'

      expect(StringUtils.isLetter(w1)).toBeFalsy()
      expect(StringUtils.isLetter(w2)).toBeFalsy()
      expect(StringUtils.isLetter(w3)).toBeFalsy()
    })
  })

  describe('isNameChar', () => {
    test('true for letters, numbers and underscores', () => {
      const w1 = 'a'
      const w2 = 'A'
      const w3 = 'č'
      const w4 = '1'
      const w5 = '2'
      const w6 = '_'

      expect(StringUtils.isNameChar(w1)).toBeTruthy()
      expect(StringUtils.isNameChar(w2)).toBeTruthy()
      expect(StringUtils.isNameChar(w3)).toBeTruthy()
      expect(StringUtils.isNameChar(w4)).toBeTruthy()
      expect(StringUtils.isNameChar(w5)).toBeTruthy()
      expect(StringUtils.isNameChar(w6)).toBeTruthy()
    })

    test('false for non-letters, non-number and non-underscores and longer strings', () => {
      const w1 = ' '
      const w2 = '.'
      const w3 = 'abcd'

      expect(StringUtils.isNameChar(w1)).toBeFalsy()
      expect(StringUtils.isNameChar(w2)).toBeFalsy()
      expect(StringUtils.isNameChar(w3)).toBeFalsy()
    })
  })

  describe('isDigit', () => {
    test('true for digits', () => {
      const w1 = '0'
      const w2 = '1'
      const w3 = '5'

      expect(StringUtils.isDigit(w1)).toBeTruthy()
      expect(StringUtils.isDigit(w2)).toBeTruthy()
      expect(StringUtils.isDigit(w3)).toBeTruthy()
    })

    test('false for non-digit and longer strings', () => {
      const w1 = ' '
      const w2 = '.'
      const w3 = 'a'
      const w4 = '12'

      expect(StringUtils.isDigit(w1)).toBeFalsy()
      expect(StringUtils.isDigit(w2)).toBeFalsy()
      expect(StringUtils.isDigit(w3)).toBeFalsy()
      expect(StringUtils.isDigit(w4)).toBeFalsy()
    })
  })

  describe('isNumber', () => {
    test('true for numbers', () => {
      const w1 = '0'
      const w2 = '1'
      const w3 = '05'
      const w4 = '45'
      const w5 = '-1'
      const w6 = '-45'
      const w7 = '1.1'
      const w8 = '-453.12489'

      expect(StringUtils.isNumber(w1)).toBeTruthy()
      expect(StringUtils.isNumber(w2)).toBeTruthy()
      expect(StringUtils.isNumber(w3)).toBeTruthy()
      expect(StringUtils.isNumber(w4)).toBeTruthy()
      expect(StringUtils.isNumber(w5)).toBeTruthy()
      expect(StringUtils.isNumber(w6)).toBeTruthy()
      expect(StringUtils.isNumber(w7)).toBeTruthy()
      expect(StringUtils.isNumber(w8)).toBeTruthy()
    })

    test('false for non-numbers', () => {
      const w1 = ' '
      const w2 = '.'
      const w3 = 'a'
      const w4 = '.12'
      const w5 = '1.2.'

      expect(StringUtils.isNumber(w1)).toBeFalsy()
      expect(StringUtils.isNumber(w2)).toBeFalsy()
      expect(StringUtils.isNumber(w3)).toBeFalsy()
      expect(StringUtils.isNumber(w4)).toBeFalsy()
      expect(StringUtils.isNumber(w5)).toBeFalsy()
    })
  })

  describe('nextWord', () => {
    test('word', () => {
      const input = 'word'
      const expectedWord = 'word'
      const expectedRest = ''

      const result = StringUtils.nextWord(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test(' word  \n\t', () => {
      const input = ' word  \n\t'
      const expectedWord = ''
      const expectedRest = ' word  \n\t'

      const result = StringUtils.nextWord(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('wor d', () => {
      const input = 'wor d'
      const expectedWord = 'wor'
      const expectedRest = ' d'

      const result = StringUtils.nextWord(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('< >', () => {
      const input = '< >'
      const expectedWord = ''
      const expectedRest = '< >'

      const result = StringUtils.nextWord(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('"  \n \t "', () => {
      const input = '  \n \t '
      const expectedWord = ''
      const expectedRest = '  \n \t '

      const result = StringUtils.nextWord(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('""', () => {
      const input = ''
      const expectedWord = ''
      const expectedRest = ''

      const result = StringUtils.nextWord(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })
  })

  describe('nextName', () => {
    test('word', () => {
      const input = 'word'
      const expectedWord = 'word'
      const expectedRest = ''

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('word_123', () => {
      const input = 'word_123'
      const expectedWord = 'word_123'
      const expectedRest = ''

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test(' word  \n\t', () => {
      const input = ' word  \n\t'
      const expectedWord = ''
      const expectedRest = ' word  \n\t'

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('word_123 other_Word', () => {
      const input = 'word_123 other_Word'
      const expectedWord = 'word_123'
      const expectedRest = ' other_Word'

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('_123 other_Word', () => {
      const input = '_123 other_Word'
      const expectedWord = '_123'
      const expectedRest = ' other_Word'

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('123_word other_Word', () => {
      const input = '123_word other_Word'
      const expectedWord = ''
      const expectedRest = '123_word other_Word'

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('wor d', () => {
      const input = 'wor d'
      const expectedWord = 'wor'
      const expectedRest = ' d'

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('< >', () => {
      const input = '< >'
      const expectedWord = ''
      const expectedRest = '< >'

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('"  \n \t "', () => {
      const input = '  \n \t '
      const expectedWord = ''
      const expectedRest = '  \n \t '

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('""', () => {
      const input = ''
      const expectedWord = ''
      const expectedRest = ''

      const result = StringUtils.nextName(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })
  })

  describe('nextNonWhitespacePart', () => {
    test('word', () => {
      const input = 'word'
      const expectedWord = 'word'
      const expectedRest = ''

      const result = StringUtils.nextNonWhitespacePart(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test(';$#& *#^', () => {
      const input = ';$#& *#^'
      const expectedWord = ';$#&'
      const expectedRest = ' *#^'

      const result = StringUtils.nextNonWhitespacePart(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test(' word  \n\t', () => {
      const input = ' word  \n\t'
      const expectedWord = ''
      const expectedRest = ' word  \n\t'

      const result = StringUtils.nextNonWhitespacePart(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('wor d', () => {
      const input = 'wor d'
      const expectedWord = 'wor'
      const expectedRest = ' d'

      const result = StringUtils.nextNonWhitespacePart(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('< >', () => {
      const input = '< >'
      const expectedWord = '<'
      const expectedRest = ' >'

      const result = StringUtils.nextNonWhitespacePart(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })

    test('""', () => {
      const input = ''
      const expectedWord = ''
      const expectedRest = ''

      const result = StringUtils.nextNonWhitespacePart(input)
      expect(result.first).toBe(expectedWord)
      expect(result.second).toBe(expectedRest)
    })
  })

  describe('nextNumber', () => {
    test('12', () => {
      const input = '12'
      const expectedNumber = '12'
      const expectedRest = ''

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test(' 12  \n\t', () => {
      const input = ' 12  \n\t'
      const expectedNumber = ''
      const expectedRest = ' 12  \n\t'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('12 d', () => {
      const input = '12 d'
      const expectedNumber = '12'
      const expectedRest = ' d'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('.12 d', () => {
      const input = '.12 d'
      const expectedNumber = ''
      const expectedRest = '.12 d'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('< >', () => {
      const input = '< >'
      const expectedNumber = ''
      const expectedRest = '< >'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('  \n \t ', () => {
      const input = '  \n \t '
      const expectedNumber = ''
      const expectedRest = '  \n \t '

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('12.456', () => {
      const input = '12.456'
      const expectedNumber = '12.456'
      const expectedRest = ''

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test(' 12.456  \n\t', () => {
      const input = ' 12.456  \n\t'
      const expectedNumber = ''
      const expectedRest = ' 12.456  \n\t'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('12.456 d', () => {
      const input = '12.456 d'
      const expectedNumber = '12.456'
      const expectedRest = ' d'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('12.456.5 d', () => {
      const input = '12.456.5 d'
      const expectedNumber = '12.456'
      const expectedRest = '.5 d'

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })

    test('""', () => {
      const input = ''
      const expectedNumber = ''
      const expectedRest = ''

      const result = StringUtils.nextNumber(input)
      expect(result.first).toBe(expectedNumber)
      expect(result.second).toBe(expectedRest)
    })
  })

  describe('nextQuotedString', () => {
    describe('valid strings', () => {
      test('"Quoted"String', () => {
        const input = '"Quoted"String'
        const expectedBordered = '"Quoted"'
        const expectedRest = 'String'

        const result = StringUtils.nextQuotedString(input)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
        expect(result.error).toBeUndefined()
      })

      test('"Quoted with \\" character"String', () => {
        const input = '"Quoted with \\" character"String'
        const expectedBordered = '"Quoted with \\" character"'
        const expectedRest = 'String'

        const result = StringUtils.nextQuotedString(input)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
        expect(result.error).toBeUndefined()
      })

      test('"Quoted with more \\\\ \\" character\\\\"String', () => {
        const input = '"Quoted with more \\\\ \\" character\\\\"String'
        const expectedBordered = '"Quoted with more \\\\ \\" character\\\\"'
        const expectedRest = 'String'

        const result = StringUtils.nextQuotedString(input)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
        expect(result.error).toBeUndefined()
      })
    })

    describe('invalid strings', () => {
      test('"Left quoted String', () => {
        const input = '"Left quoted String'
        const expectedBordered = '"Left quoted String'
        const expectedRest = ''

        const result = StringUtils.nextQuotedString(input)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
        expect(result.error).not.toBeUndefined()
      })

      test('"End on the next\nline"', () => {
        const input = '"End on the next\nline"'
        const expectedBordered = '"End on the next\n'
        const expectedRest = 'line"'

        const result = StringUtils.nextQuotedString(input)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
        expect(result.error).not.toBeUndefined()
      })
    })
  })

  describe('nextBorderedPart', () => {
    describe('valid strings with one ending character split correctly', () => {
      test('()String', () => {
        const input = '()String'
        const start = '('
        const end = ')'
        const expectedBordered = '()'
        const expectedRest = 'String'

        const result = StringUtils.nextBorderedPart(input, start, end)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })

      test('((()))String', () => {
        const input = '((()))String'
        const start = '('
        const end = ')'
        const expectedBordered = '((()))'
        const expectedRest = 'String'

        const result = StringUtils.nextBorderedPart(input, start, end)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })
    })

    describe('valid strings with more ending characters split correctly', () => {
      test('[((InnerString))]String', () => {
        const input = '[((InnerString))]String'
        const start = '['
        const end = ']>'
        const expectedBordered = '[((InnerString))]'
        const expectedRest = 'String'

        const result = StringUtils.nextBorderedPart(input, start, end)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })

      test('[((InnerString))>String', () => {
        const input = '[((InnerString))>String'
        const start = '['
        const end = ']>'
        const expectedBordered = '[((InnerString))>'
        const expectedRest = 'String'

        const result = StringUtils.nextBorderedPart(input, start, end)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })

      test('< some -> rename >AndSoOn', () => {
        const input = '< some -> rename >AndSoOn'
        const start = '<'
        const end = ']>'
        const escape = '-'
        const expectedBordered = '< some -> rename >'
        const expectedRest = 'AndSoOn'

        const result = StringUtils.nextBorderedPart(input, start, end, escape)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })
    })

    describe('invalid strings throw an error', () => {
      test('((())String', () => {
        const input = '((())String'
        const start = '('
        const end = ')'

        expect(() => StringUtils.nextBorderedPart(input, start, end)).toThrow()
      })

      test('(String', () => {
        const input = '(String'
        const start = '('
        const end = ')'

        expect(() => StringUtils.nextBorderedPart(input, start, end)).toThrow()
      })
    })

    describe('ignores special chars in quoted part', () => {
      test('(")")String', () => {
        const input = '(")")String'
        const start = '('
        const end = ')'
        const expectedBordered = '(")")'
        const expectedRest = 'String'

        const result = StringUtils.nextBorderedPart(input, start, end)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })

      test('(some long expression with "inner quoted part with ) and \\", yeah")String', () => {
        const input = '(some long expression with "inner quoted part with ) and \\", yeah")String'
        const start = '('
        const end = ')'
        const expectedBordered = '(some long expression with "inner quoted part with ) and \\", yeah")'
        const expectedRest = 'String'

        const result = StringUtils.nextBorderedPart(input, start, end)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })
    })

    describe('multiple escape characters work correctly', () => {
      test('"A\\"B"abc', () => {
        const input = '"A\\"B"abc'
        const start = '"'
        const end = '"'
        const escape = '\\'
        const expectedBordered = '"A\\"B"'
        const expectedRest = 'abc'

        const result = StringUtils.nextBorderedPart(input, start, end, escape)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })

      test('"A\\\\"B"abc', () => {
        const input = '"A\\\\"B"abc'
        const start = '"'
        const end = '"'
        const escape = '\\'
        const expectedBordered = '"A\\\\"'
        const expectedRest = 'B"abc'

        const result = StringUtils.nextBorderedPart(input, start, end, escape)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })

      test('"A\\ \\" \\\\\\"B"abc', () => {
        const input = '"A\\ \\" \\\\\\"B"abc'
        const start = '"'
        const end = '"'
        const escape = '\\'
        const expectedBordered = '"A\\ \\" \\\\\\"B"'
        const expectedRest = 'abc'

        const result = StringUtils.nextBorderedPart(input, start, end, escape)
        expect(result.first).toBe(expectedBordered)
        expect(result.second).toBe(expectedRest)
      })
    })
  })

  describe('skipWhitespacesAndChar', () => {
    test(',', () => {
      const str = ','
      const expected = ''

      const actual: string = StringUtils.skipWhitespacesAndChar(str, ',')
      expect(actual.toString()).toBe(expected)
    })

    test('abcd', () => {
      const str = 'abcd'
      const expected = 'bcd'

      const actual: string = StringUtils.skipWhitespacesAndChar(str, 'a')
      expect(actual).toBe(expected)
    })

    test(': "Value", Next: 123544, Next: "asasasd"', () => {
      const str = ': "Value", Next: 123544, Next: "asasasd"'
      const expected = '"Value", Next: 123544, Next: "asasasd"'

      const actual: string = StringUtils.skipWhitespacesAndChar(str, ':')
      expect(actual).toBe(expected)
    })

    test('  \t  :\t "Value", Next: 123544, Next: "asasasd"', () => {
      const str = '  \t  :\t "Value", Next: 123544, Next: "asasasd"'
      const expected = '"Value", Next: 123544, Next: "asasasd"'

      const actual: string = StringUtils.skipWhitespacesAndChar(str, ':')
      expect(actual).toBe(expected)
    })
  })
})
