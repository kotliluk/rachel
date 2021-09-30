import {IndexedStringUtils} from "../indexedStringUtils";
import {IndexedString} from "../../types/indexedString";

describe('isWord', () => {
  describe('true for only-letter-string', () => {
    test.each(["Word", "WordWord", "aaaaWord", "čřžšá", "ŠČíáopL"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isWord(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('false for string with a non-letter character', () => {
    test.each(["Word ", "Word Word", " aaaaWord", "WORD2", "woČŘ."]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isWord(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('isName', () => {
  describe('true for valid name', () => {
    test.each(["Word", "_Word", "aaaaWord123", "ŠČř_123__žšá"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isName(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('true for valid name', () => {
    test.each(["Word ", "Word Word", " aaaaWord", "123WORD"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isName(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('isWhitespacesOnly', () => {
  describe('true for only-whitespaces-string', () => {
    test.each([" ", "   ", " \n\t ", ""]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isWhitespacesOnly(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('false for string with a non-whitespace character', () => {
    test.each(["Word ", "    a   ", "\na\n", "\t\t \t.\n"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isWhitespacesOnly(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('isLetter', () => {
  describe('true for one letter only', () => {
    test.each(["a", "A", "č", "í"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isLetter(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('false for non-letters or longer string', () => {
    test.each([" ", ".", "1", "abcd"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isLetter(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('isNameChar', () => {
  describe('true for one letter only', () => {
    test.each(["a", "A", "č", "í", "1", "_"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isNameChar(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('false for non-letter, non-number and non-underscore or longer string', () => {
    test.each([" ", ".", "abcd"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isNameChar(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('isDigit', () => {
  describe('true for digit', () => {
    test.each(["0", "1", "5"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isDigit(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('false for non-digit or longer string', () => {
    test.each([" ", ".", "a", "12"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isDigit(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('isNumber', () => {
  describe('true for number', () => {
    test.each(["0", "1", "05", "-1", "-45", "1.1", "-435.12489"]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isNumber(indexedStr);
      // assert
      expect(actual).toBe(true);
    });
  });

  describe('false for non-number', () => {
    test.each([" ", ".", "a", ".12", "1.2."]
    )('%s', (str) => {
      // arrange
      const indexedStr = IndexedString.new(str);
      // act
      const actual = IndexedStringUtils.isNumber(indexedStr);
      // assert
      expect(actual).toBe(false);
    });
  });
});

describe('nextWord', () => {
  describe('splits string correctly', () => {
    test.each([
        {input: "word", expectedWord: "word", expectedRest: ""},
        {input: " word  \n\t", expectedWord: "", expectedRest: " word  \n\t"},
        {input: "wor d", expectedWord: "wor", expectedRest: " d"},
        {input: "< >", expectedWord: "", expectedRest: "< >"},
        {input: "  \n \t ", expectedWord: "", expectedRest: "  \n \t "},
        {input: "", expectedWord: "", expectedRest: ""},
      ]
    )('%s', ({input, expectedWord, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextWord(indexedInput);
      // assert
      expect(actual.first.toString()).toBe(expectedWord);
      expect(actual.second.toString()).toBe(expectedRest);
    });
  });
});

describe('nextName', () => {
  describe('splits valid string', () => {
    test.each([
        {input: "word", expectedWord: "word", expectedRest: ""},
        {input: "word_123", expectedWord: "word_123", expectedRest: ""},
        {input: " word  \n\t", expectedWord: "", expectedRest: " word  \n\t"},
        {input: "word_123 other_Word", expectedWord: "word_123", expectedRest: " other_Word"},
        {input: "_123 other_Word", expectedWord: "_123", expectedRest: " other_Word"},
        {input: "123_word other_Word", expectedWord: "", expectedRest: "123_word other_Word"},
        {input: "< >", expectedWord: "", expectedRest: "< >"},
        {input: "  \n \t ", expectedWord: "", expectedRest: "  \n \t "},
        {input: "", expectedWord: "", expectedRest: ""},
      ]
    )('%s', ({input, expectedWord, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextName(indexedInput);
      // assert
      expect(actual.first.toString()).toBe(expectedWord);
      expect(actual.second.toString()).toBe(expectedRest);
    });
  });
});

describe('nextNumber', () => {
  describe('splits valid string', () => {
    test.each([
        {input: "12", expectedWord: "12", expectedRest: ""},
        {input: " 12  \n\t", expectedWord: "", expectedRest: " 12  \n\t"},
        {input: "12 d", expectedWord: "12", expectedRest: " d"},
        {input: ".12 d", expectedWord: "", expectedRest: ".12 d"},
        {input: "< >", expectedWord: "", expectedRest: "< >"},
        {input: "  \n \t ", expectedWord: "", expectedRest: "  \n \t "},
        {input: "12.456", expectedWord: "12.456", expectedRest: ""},
        {input: " 12.456", expectedWord: "", expectedRest: " 12.456"},
        {input: "12.456 d", expectedWord: "12.456", expectedRest: " d"},
        {input: "12.456.5 d", expectedWord: "12.456", expectedRest: ".5 d"},
        {input: "", expectedWord: "", expectedRest: ""},
      ]
    )('%s', ({input, expectedWord, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextNumber(indexedInput);
      // assert
      expect(actual.first.toString()).toBe(expectedWord);
      expect(actual.second.toString()).toBe(expectedRest);
    });
  });
});

describe('nextQuotedString', () => {
  describe('splits valid string without error', () => {
    test.each([
        {input: '"Quoted"String', expectedBordered: '"Quoted"', expectedRest: 'String'},
        {input: '"Quoted with \\" character"String', expectedBordered: '"Quoted with \\" character"', expectedRest: 'String'},
        {
          input: '"Quoted with more \\\\ \\" character\\\\"String',
          expectedBordered: '"Quoted with more \\\\ \\" character\\\\"',
          expectedRest: 'String'
        },
      ]
    )('%s', ({input, expectedBordered, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextQuotedString(indexedInput);
      // assert
      expect(actual.first.toString()).toBe(expectedBordered);
      expect(actual.second.toString()).toBe(expectedRest);
      expect(actual.error).toBeUndefined();
    });
  });

  describe('splits invalid string with error', () => {
    test.each([
        {input: '"Left quoted String', expectedBordered: '"Left quoted String', expectedRest: ''},
        {input: '"End on the next\nline"', expectedBordered: '"End on the next\n', expectedRest: 'line"'},
      ]
    )('%s', ({input, expectedBordered, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextQuotedString(indexedInput);
      // assert
      expect(actual.first.toString()).toBe(expectedBordered);
      expect(actual.second.toString()).toBe(expectedRest);
      expect(actual.error).not.toBeUndefined();
    });
  });
});

describe('nextBorderedPart', () => {
  describe('splits valid string without error', () => {
    test.each([
        {input: '()String', start: '(', end: ')', expectedBordered: '()', expectedRest: 'String'},
        {input: '((()))String', start: '(', end: ')', expectedBordered: '((()))', expectedRest: 'String'},
        {input: '[((InnerString))]String', start: '[', end: ']>', expectedBordered: '[((InnerString))]', expectedRest: 'String'},
        {input: '[((InnerString))>String', start: '[', end: ']>', expectedBordered: '[((InnerString))>', expectedRest: 'String'},
        {input: '< some -> rename >AndSoOn', start: '<', end: '>', escape: '-', expectedBordered: '< some -> rename >', expectedRest: 'AndSoOn'},
      ]
    )('%s', ({input, start, end, escape, expectedBordered, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextBorderedPart(indexedInput, start, end, escape);
      // assert
      expect(actual.first.toString()).toBe(expectedBordered);
      expect(actual.second.toString()).toBe(expectedRest);
      expect(actual.second.getLastIndex()).toBe(indexedInput.getLastIndex());
    });
  });

  describe('invalid string throws an error', () => {
    test.each([
        {input: '((())String', start: '(', end: ')'},
        {input: '(String', start: '(', end: ')'},
      ]
    )('%s', ({input, start, end}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act + assert
      expect(() => IndexedStringUtils.nextBorderedPart(indexedInput, start, end)).toThrow();
    });
  });

  describe('ignores special chars in quoted part', () => {
    test.each([
        {input: '(")")String', start: '(', end: ')', expectedBordered: '(")")', expectedRest: 'String'},
        {
          input: '(some long expression with "inner quoted part with ) and \\", yeah")String',
          start: '(', end: ')',
          expectedBordered: '(some long expression with "inner quoted part with ) and \\", yeah")',
          expectedRest: 'String'
        },
      ]
    )('%s', ({input, start, end, expectedBordered, expectedRest}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual = IndexedStringUtils.nextBorderedPart(indexedInput, start, end);
      // assert
      expect(actual.first.toString()).toBe(expectedBordered);
      expect(actual.second.toString()).toBe(expectedRest);
    });
  });
});

describe('skipWhitespacesAndChar', () => {
  test.each([
        {input: ',', char: ',', expected: ''},
        {input: 'abcd', char: 'a', expected: 'bcd'},
        {input: '      : "Value", Next: 123544', char: ':', expected: '"Value", Next: 123544'},
    ]
  )('%s', ({input, char, expected}) => {
      // arrange
      const indexedInput = IndexedString.new(input);
      // act
      const actual: IndexedString = IndexedStringUtils.skipWhitespacesAndChar(indexedInput, char);
      // assert
      expect(actual.toString()).toBe(expected);
  });
});

test("deleteAllComments", () => {
  const str: string =
    '(abc //line comment\n' +
    'abc "ignored line comment // in string"\n' +
    'abc /* block comment */ abc\n' +
    'abc " ignore /* block comment */ in string"\n' +
    ')';
  const expected: string =
    '(abc \n' +
    'abc "ignored line comment // in string"\n' +
    'abc   abc\n' +
    'abc " ignore /* block comment */ in string"\n' +
    ')';

  const actual = IndexedStringUtils.deleteAllComments(IndexedString.new(str)).str;
  expect(actual.toString()).toBe(expected);
});
