import {IndexedStringUtils} from "../indexedStringUtils";
import {IndexedString} from "../../types/indexedString";

describe('isWord', () => {
    test('true for only-letter-strings', () => {
        const w1: string = "Word";
        const w2: string = "WordWord";
        const w3: string = "aaaaWord";
        const w4: string = "čřžšá";
        const w5: string = "ŠČíáopL";

        expect(IndexedStringUtils.isWord(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w3))).toBeTruthy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w4))).toBeTruthy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w5))).toBeTruthy();
    });

    test('false for string with a non-letter character', () => {
        const w1: string = "Word ";
        const w2: string = "Word Word";
        const w3: string = " aaaaWord";
        const w4: string = "WORD2";
        const w5: string = "woČŘ.";

        expect(IndexedStringUtils.isWord(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w3))).toBeFalsy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w4))).toBeFalsy();
        expect(IndexedStringUtils.isWord(IndexedString.new(w5))).toBeFalsy();
    });
});

describe('isName', () => {
    test('true for valid names', () => {
        const w1: string = "Word";
        const w2: string = "_Word";
        const w3: string = "aaaaWord123";
        const w4: string = "ŠČř_123__žšá";

        expect(IndexedStringUtils.isName(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isName(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isName(IndexedString.new(w3))).toBeTruthy();
        expect(IndexedStringUtils.isName(IndexedString.new(w4))).toBeTruthy();
    });

    test('false for invalid names', () => {
        const w1: string = "Word ";
        const w2: string = "Word Word";
        const w3: string = " aaaaWord";
        const w4: string = "123WORD";

        expect(IndexedStringUtils.isName(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isName(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isName(IndexedString.new(w3))).toBeFalsy();
        expect(IndexedStringUtils.isName(IndexedString.new(w4))).toBeFalsy();
    });
});

describe('isWhitespacesOnly', () => {
    test('true for only-whitespaces-strings', () => {
        const w1: string = " ";
        const w2: string = "   ";
        const w3: string = " \n\t ";
        const w4: string = "";

        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w3))).toBeTruthy();
        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w4))).toBeTruthy();
    });

    test('false for string with a non-whitespace character', () => {
        const w1: string = "Word ";
        const w2: string = "    a   ";
        const w3: string = "\na\n";
        const w4: string = "\t\t \t.\n";

        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w3))).toBeFalsy();
        expect(IndexedStringUtils.isWhitespacesOnly(IndexedString.new(w4))).toBeFalsy();
    });
});

describe('isLetter', () => {
    test('true for letters', () => {
        const w1: string = "a";
        const w2: string = "A";
        const w3: string = "č";
        const w4: string = "í";

        expect(IndexedStringUtils.isLetter(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isLetter(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isLetter(IndexedString.new(w3))).toBeTruthy();
        expect(IndexedStringUtils.isLetter(IndexedString.new(w4))).toBeTruthy();
    });

    test('false for non-letters and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "abcd";

        expect(IndexedStringUtils.isLetter(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isLetter(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isLetter(IndexedString.new(w3))).toBeFalsy();
    });
});

describe('isNameChar', () => {
    test('true for letters, numbers and underscores', () => {
        const w1: string = "a";
        const w2: string = "A";
        const w3: string = "č";
        const w4: string = "1";
        const w5: string = "2";
        const w6: string = "_";

        expect(IndexedStringUtils.isNameChar(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w3))).toBeTruthy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w4))).toBeTruthy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w5))).toBeTruthy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w6))).toBeTruthy();
    });

    test('false for non-letters, non-number and non-underscores and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "abcd";

        expect(IndexedStringUtils.isNameChar(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isNameChar(IndexedString.new(w3))).toBeFalsy();
    });
});

describe('isDigit', () => {
    test('true for digits', () => {
        const w1: string = "0";
        const w2: string = "1";
        const w3: string = "5";

        expect(IndexedStringUtils.isDigit(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isDigit(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isDigit(IndexedString.new(w3))).toBeTruthy();
    });

    test('false for non-digit and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "a";
        const w4: string = "12";

        expect(IndexedStringUtils.isDigit(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isDigit(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isDigit(IndexedString.new(w3))).toBeFalsy();
        expect(IndexedStringUtils.isDigit(IndexedString.new(w4))).toBeFalsy();
    });
});

describe('isNumber', () => {
    test('true for numbers', () => {
        const w1: string = "0";
        const w2: string = "1";
        const w3: string = "05";
        const w4: string = "45";
        const w5: string = "-1";
        const w6: string = "-45";
        const w7: string = "1.1";
        const w8: string = "-453.12489";

        expect(IndexedStringUtils.isNumber(IndexedString.new(w1))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w2))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w3))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w4))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w5))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w6))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w7))).toBeTruthy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w8))).toBeTruthy();
    });

    test('false for non-numbers', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "a";
        const w4: string = ".12";
        const w5: string = "1.2.";

        expect(IndexedStringUtils.isNumber(IndexedString.new(w1))).toBeFalsy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w2))).toBeFalsy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w3))).toBeFalsy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w4))).toBeFalsy();
        expect(IndexedStringUtils.isNumber(IndexedString.new(w5))).toBeFalsy();
    });
});

describe('nextWord', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = IndexedStringUtils.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = IndexedStringUtils.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "";
        const expectedRest: string = "< >";

        const result = IndexedStringUtils.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('"  \n \t "', () => {
        const input: string = "  \n \t ";
        const expectedWord: string = "";
        const expectedRest: string = "  \n \t ";

        const result = IndexedStringUtils.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });
});

describe('nextName', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('word_123', () => {
        const input: string = "word_123";
        const expectedWord: string = "word_123";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('word_123 other_Word', () => {
        const input: string = "word_123 other_Word";
        const expectedWord: string = "word_123";
        const expectedRest: string = " other_Word";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('_123 other_Word', () => {
        const input: string = "_123 other_Word";
        const expectedWord: string = "_123";
        const expectedRest: string = " other_Word";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('123_word other_Word', () => {
        const input: string = "123_word other_Word";
        const expectedWord: string = "";
        const expectedRest: string = "123_word other_Word";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "";
        const expectedRest: string = "< >";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('"  \n \t "', () => {
        const input: string = "  \n \t ";
        const expectedWord: string = "";
        const expectedRest: string = "  \n \t ";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });
});

describe('nextNumber', () => {
    test('12', () => {
        const input: string = "12";
        const expectedNumber: string = "12";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' 12  \n\t', () => {
        const input: string = " 12  \n\t";
        const expectedNumber: string = "";
        const expectedRest: string = " 12  \n\t";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12 d', () => {
        const input: string = "12 d";
        const expectedNumber: string = "12";
        const expectedRest: string = " d";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('.12 d', () => {
        const input: string = ".12 d";
        const expectedNumber: string = "";
        const expectedRest: string = ".12 d";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedNumber: string = "";
        const expectedRest: string = "< >";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('  \n \t ', () => {
        const input: string = "  \n \t ";
        const expectedNumber: string = "";
        const expectedRest: string = "  \n \t ";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12.456', () => {
        const input: string = "12.456";
        const expectedNumber: string = "12.456";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' 12.456  \n\t', () => {
        const input: string = " 12.456  \n\t";
        const expectedNumber: string = "";
        const expectedRest: string = " 12.456  \n\t";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12.456 d', () => {
        const input: string = "12.456 d";
        const expectedNumber: string = "12.456";
        const expectedRest: string = " d";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12.456.5 d', () => {
        const input: string = "12.456.5 d";
        const expectedNumber: string = "12.456";
        const expectedRest: string = ".5 d";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedNumber: string = "";
        const expectedRest: string = "";

        const result = IndexedStringUtils.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });
});

describe('nextQuotedString', () => {
    describe('valid strings', () => {
        test('"Quoted"String', () => {
            const input: IndexedString = IndexedString.new('"Quoted"String');
            const expectedBordered: string = '"Quoted"';
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextQuotedString(input);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.error).toBeUndefined();
        });

        test('"Quoted with \\" character"String', () => {
            const input: IndexedString = IndexedString.new('"Quoted with \\" character"String');
            const expectedBordered: string = '"Quoted with \\" character"';
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextQuotedString(input);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.error).toBeUndefined();
        });

        test('"Quoted with more \\\\ \\" character\\\\"String', () => {
            const input: IndexedString = IndexedString.new('"Quoted with more \\\\ \\" character\\\\"String');
            const expectedBordered: string = '"Quoted with more \\\\ \\" character\\\\"';
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextQuotedString(input);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.error).toBeUndefined();
        });
    });

    describe('invalid strings', () => {
        test('"Left quoted String', () => {
            const input: IndexedString = IndexedString.new('"Left quoted String');
            const expectedBordered: string = '"Left quoted String';
            const expectedRest: string = "";

            const result = IndexedStringUtils.nextQuotedString(input);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.error).not.toBeUndefined();
        });

        test('"End on the next\nline"', () => {
            const input: IndexedString = IndexedString.new('"End on the next\nline"');
            const expectedBordered: string = '"End on the next\n';
            const expectedRest: string = 'line"';

            const result = IndexedStringUtils.nextQuotedString(input);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.error).not.toBeUndefined();
        });
    });
});

describe('nextBorderedPart', () => {
    describe('valid strings with one ending character split correctly', () => {
        test('()String', () => {
            const input: IndexedString = IndexedString.new("()String");
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = "()";
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('((()))String', () => {
            const input: IndexedString = IndexedString.new("((()))String");
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = "((()))";
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });
    });

    describe('valid strings with more ending characters split correctly', () => {
        test('[((InnerString))]String', () => {
            const input: IndexedString = IndexedString.new("[((InnerString))]String");
            const start: string = '[';
            const end: string = ']>';
            const expectedBordered: string = "[((InnerString))]";
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('[((InnerString))>String', () => {
            const input: IndexedString = IndexedString.new("[((InnerString))>String");
            const start: string = '[';
            const end: string = ']>';
            const expectedBordered: string = "[((InnerString))>";
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('< some -> rename >AndSoOn', () => {
            const input: IndexedString = IndexedString.new("< some -> rename >AndSoOn");
            const start: string = '<';
            const end: string = ']>';
            const escape: string = '-';
            const expectedBordered: string = "< some -> rename >";
            const expectedRest: string = "AndSoOn";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end, escape);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });
    });

    describe('invalid strings throw an error', () => {
        test('((())String', () => {
            const input: IndexedString = IndexedString.new("((())String");
            const start: string = '(';
            const end: string = ')';

            expect(() => IndexedStringUtils.nextBorderedPart(input, start, end)).toThrow();
        });

        test('(String', () => {
            const input: IndexedString = IndexedString.new("(String");
            const start: string = '(';
            const end: string = ')';

            expect(() => IndexedStringUtils.nextBorderedPart(input, start, end)).toThrow();
        });
    });

    describe('ignores special chars in quoted part', () => {
        test('(")")String', () => {
            const input: IndexedString = IndexedString.new("(\")\")String");
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = "(\")\")";
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
        });

        test('(some long expression with "inner quoted part with ) and \\", yeah")String', () => {
            const input: IndexedString = IndexedString.new('(some long expression with "inner quoted part with ) and \\", yeah")String');
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = '(some long expression with "inner quoted part with ) and \\", yeah")';
            const expectedRest: string = "String";

            const result = IndexedStringUtils.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBordered);
            expect(result.second.toString()).toBe(expectedRest);
        });
    });
});

describe('skipWhitespacesAndChar', () => {
    test(",", () => {
        const str: string = ",";
        const expected: string = "";

        const actual: IndexedString = IndexedStringUtils.skipWhitespacesAndChar(IndexedString.new(str), ',');
        expect(actual.toString()).toBe(expected);
    });

    test("abcd", () => {
        const str: string = "abcd";
        const expected: string = "bcd";

        const actual: IndexedString = IndexedStringUtils.skipWhitespacesAndChar(IndexedString.new(str), 'a');
        expect(actual.toString()).toBe(expected);
    });

    test(": \"Value\", Next: 123544, Next: \"asasasd\"", () => {
        const str: string = ": \"Value\", Next: 123544, Next: \"asasasd\"";
        const expected: string = "\"Value\", Next: 123544, Next: \"asasasd\"";

        const actual: IndexedString = IndexedStringUtils.skipWhitespacesAndChar(IndexedString.new(str), ':');
        expect(actual.toString()).toBe(expected);
    });

    test("  \t  :\t \"Value\", Next: 123544, Next: \"asasasd\"", () => {
        const str: string = "  \t  :\t \"Value\", Next: 123544, Next: \"asasasd\"";
        const expected: string = "\"Value\", Next: 123544, Next: \"asasasd\"";

        const actual: IndexedString = IndexedStringUtils.skipWhitespacesAndChar(IndexedString.new(str), ':');
        expect(actual.toString()).toBe(expected);
    });
});

test("deleteAllComments", () => {
    const str: string =
      '(abc //line comment\n' +
      'abc "ignored line comment // in string"\n' +
      'abc /* block comment */ abc\n' + // there will be a space instead of /* ... */
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