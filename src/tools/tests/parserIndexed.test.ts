import ParserIndexed from "../parserIndexed";
import {IndexedString} from "../indexedString";

describe('isWord', () => {
    test('true for only-letter-strings', () => {
        const w1: string = "Word";
        const w2: string = "WordWord";
        const w3: string = "aaaaWord";
        const w4: string = "čřžšá";
        const w5: string = "ŠČíáopL";

        expect(ParserIndexed.isWord(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isWord(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isWord(IndexedString.new(w3))).toBeTruthy();
        expect(ParserIndexed.isWord(IndexedString.new(w4))).toBeTruthy();
        expect(ParserIndexed.isWord(IndexedString.new(w5))).toBeTruthy();
    });

    test('false for string with a non-letter character', () => {
        const w1: string = "Word ";
        const w2: string = "Word Word";
        const w3: string = " aaaaWord";
        const w4: string = "WORD2";
        const w5: string = "woČŘ.";

        expect(ParserIndexed.isWord(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isWord(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isWord(IndexedString.new(w3))).toBeFalsy();
        expect(ParserIndexed.isWord(IndexedString.new(w4))).toBeFalsy();
        expect(ParserIndexed.isWord(IndexedString.new(w5))).toBeFalsy();
    });
});

describe('isName', () => {
    test('true for valid names', () => {
        const w1: string = "Word";
        const w2: string = "_Word";
        const w3: string = "aaaaWord123";
        const w4: string = "ŠČř_123__žšá";

        expect(ParserIndexed.isName(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isName(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isName(IndexedString.new(w3))).toBeTruthy();
        expect(ParserIndexed.isName(IndexedString.new(w4))).toBeTruthy();
    });

    test('false for invalid names', () => {
        const w1: string = "Word ";
        const w2: string = "Word Word";
        const w3: string = " aaaaWord";
        const w4: string = "123WORD";

        expect(ParserIndexed.isName(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isName(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isName(IndexedString.new(w3))).toBeFalsy();
        expect(ParserIndexed.isName(IndexedString.new(w4))).toBeFalsy();
    });
});

describe('isWhitespacesOnly', () => {
    test('true for only-whitespaces-strings', () => {
        const w1: string = " ";
        const w2: string = "   ";
        const w3: string = " \n\t ";
        const w4: string = "";

        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w3))).toBeTruthy();
        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w4))).toBeTruthy();
    });

    test('false for string with a non-whitespace character', () => {
        const w1: string = "Word ";
        const w2: string = "    a   ";
        const w3: string = "\na\n";
        const w4: string = "\t\t \t.\n";

        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w3))).toBeFalsy();
        expect(ParserIndexed.isWhitespacesOnly(IndexedString.new(w4))).toBeFalsy();
    });
});

describe('isLetter', () => {
    test('true for letters', () => {
        const w1: string = "a";
        const w2: string = "A";
        const w3: string = "č";
        const w4: string = "í";

        expect(ParserIndexed.isLetter(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isLetter(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isLetter(IndexedString.new(w3))).toBeTruthy();
        expect(ParserIndexed.isLetter(IndexedString.new(w4))).toBeTruthy();
    });

    test('false for non-letters and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "abcd";

        expect(ParserIndexed.isLetter(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isLetter(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isLetter(IndexedString.new(w3))).toBeFalsy();
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

        expect(ParserIndexed.isNameChar(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w3))).toBeTruthy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w4))).toBeTruthy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w5))).toBeTruthy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w6))).toBeTruthy();
    });

    test('false for non-letters, non-number and non-underscores and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "abcd";

        expect(ParserIndexed.isNameChar(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isNameChar(IndexedString.new(w3))).toBeFalsy();
    });
});

describe('isDigit', () => {
    test('true for digits', () => {
        const w1: string = "0";
        const w2: string = "1";
        const w3: string = "5";

        expect(ParserIndexed.isDigit(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isDigit(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isDigit(IndexedString.new(w3))).toBeTruthy();
    });

    test('false for non-digit and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "a";
        const w4: string = "12";

        expect(ParserIndexed.isDigit(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isDigit(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isDigit(IndexedString.new(w3))).toBeFalsy();
        expect(ParserIndexed.isDigit(IndexedString.new(w4))).toBeFalsy();
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

        expect(ParserIndexed.isNumber(IndexedString.new(w1))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w2))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w3))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w4))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w5))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w6))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w7))).toBeTruthy();
        expect(ParserIndexed.isNumber(IndexedString.new(w8))).toBeTruthy();
    });

    test('false for non-numbers', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "a";
        const w4: string = ".12";
        const w5: string = "1.2.";

        expect(ParserIndexed.isNumber(IndexedString.new(w1))).toBeFalsy();
        expect(ParserIndexed.isNumber(IndexedString.new(w2))).toBeFalsy();
        expect(ParserIndexed.isNumber(IndexedString.new(w3))).toBeFalsy();
        expect(ParserIndexed.isNumber(IndexedString.new(w4))).toBeFalsy();
        expect(ParserIndexed.isNumber(IndexedString.new(w5))).toBeFalsy();
    });
});

describe('nextWord', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = ParserIndexed.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = ParserIndexed.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = ParserIndexed.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "";
        const expectedRest: string = "< >";

        const result = ParserIndexed.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('"  \n \t "', () => {
        const input: string = "  \n \t ";
        const expectedWord: string = "";
        const expectedRest: string = "  \n \t ";

        const result = ParserIndexed.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = ParserIndexed.nextWord(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });
});

describe('nextName', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('word_123', () => {
        const input: string = "word_123";
        const expectedWord: string = "word_123";
        const expectedRest: string = "";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('word_123 other_Word', () => {
        const input: string = "word_123 other_Word";
        const expectedWord: string = "word_123";
        const expectedRest: string = " other_Word";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('_123 other_Word', () => {
        const input: string = "_123 other_Word";
        const expectedWord: string = "_123";
        const expectedRest: string = " other_Word";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('123_word other_Word', () => {
        const input: string = "123_word other_Word";
        const expectedWord: string = "";
        const expectedRest: string = "123_word other_Word";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "";
        const expectedRest: string = "< >";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('"  \n \t "', () => {
        const input: string = "  \n \t ";
        const expectedWord: string = "";
        const expectedRest: string = "  \n \t ";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = ParserIndexed.nextName(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedWord);
        expect(result.second.toString()).toBe(expectedRest);
    });
});

describe('nextNumber', () => {
    test('12', () => {
        const input: string = "12";
        const expectedNumber: string = "12";
        const expectedRest: string = "";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' 12  \n\t', () => {
        const input: string = " 12  \n\t";
        const expectedNumber: string = "";
        const expectedRest: string = " 12  \n\t";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12 d', () => {
        const input: string = "12 d";
        const expectedNumber: string = "12";
        const expectedRest: string = " d";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('.12 d', () => {
        const input: string = ".12 d";
        const expectedNumber: string = "";
        const expectedRest: string = ".12 d";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedNumber: string = "";
        const expectedRest: string = "< >";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('  \n \t ', () => {
        const input: string = "  \n \t ";
        const expectedNumber: string = "";
        const expectedRest: string = "  \n \t ";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12.456', () => {
        const input: string = "12.456";
        const expectedNumber: string = "12.456";
        const expectedRest: string = "";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test(' 12.456  \n\t', () => {
        const input: string = " 12.456  \n\t";
        const expectedNumber: string = "";
        const expectedRest: string = " 12.456  \n\t";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12.456 d', () => {
        const input: string = "12.456 d";
        const expectedNumber: string = "12.456";
        const expectedRest: string = " d";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('12.456.5 d', () => {
        const input: string = "12.456.5 d";
        const expectedNumber: string = "12.456";
        const expectedRest: string = ".5 d";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedNumber: string = "";
        const expectedRest: string = "";

        const result = ParserIndexed.nextNumber(IndexedString.new(input));
        expect(result.first.toString()).toBe(expectedNumber);
        expect(result.second.toString()).toBe(expectedRest);
    });
});

describe('nextBorderedPart', () => {
    describe('valid strings with one ending character split correctly', () => {
        test('()String', () => {
            const input: IndexedString = IndexedString.new("()String");
            const start: string = '(';
            const end: string = ')';
            const expectedBoarder: string = "()";
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('((()))String', () => {
            const input: IndexedString = IndexedString.new("((()))String");
            const start: string = '(';
            const end: string = ')';
            const expectedBoarder: string = "((()))";
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('"Quoted"String', () => {
            const input: IndexedString = IndexedString.new('"Quoted"String');
            const start: string = '"';
            const end: string = '"';
            const expectedBoarder: string = '"Quoted"';
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('"Quoted with \\" character"String', () => {
            const input: IndexedString = IndexedString.new('"Quoted with \\" character"String');
            const start: string = '"';
            const end: string = '"';
            const escape: string = '\\';
            const expectedBoarder: string = '"Quoted with \\" character"';
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end, escape);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });
    });

    describe('valid strings with more ending characters split correctly', () => {
        test('[((InnerString))]String', () => {
            const input: IndexedString = IndexedString.new("[((InnerString))]String");
            const start: string = '[';
            const end: string = ']>';
            const expectedBoarder: string = "[((InnerString))]";
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('[((InnerString))>String', () => {
            const input: IndexedString = IndexedString.new("[((InnerString))>String");
            const start: string = '[';
            const end: string = ']>';
            const expectedBoarder: string = "[((InnerString))>";
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });

        test('< some -> rename >AndSoOn', () => {
            const input: IndexedString = IndexedString.new("< some -> rename >AndSoOn");
            const start: string = '<';
            const end: string = ']>';
            const escape: string = '-';
            const expectedBoarder: string = "< some -> rename >";
            const expectedRest: string = "AndSoOn";

            const result = ParserIndexed.nextBorderedPart(input, start, end, escape);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
            expect(result.second.getLastIndex()).toBe(input.getLastIndex());
        });
    });

    describe('invalid strings throw an error', () => {
        test('((())String', () => {
            const input: IndexedString = IndexedString.new("((())String");
            const start: string = '(';
            const end: string = ')';

            expect(() => ParserIndexed.nextBorderedPart(input, start, end)).toThrow();
        });

        test('(String', () => {
            const input: IndexedString = IndexedString.new("(String");
            const start: string = '(';
            const end: string = ')';

            expect(() => ParserIndexed.nextBorderedPart(input, start, end)).toThrow();
        });

        test('"QuotedString', () => {
            const input: IndexedString = IndexedString.new('"QuotedString');
            const start: string = '"';
            const end: string = '"';

            expect(() => ParserIndexed.nextBorderedPart(input, start, end)).toThrow();
        });
    });

    describe('ignores special chars in quoted part', () => {
        test('(")")String', () => {
            const input: IndexedString = IndexedString.new("(\")\")String");
            const start: string = '(';
            const end: string = ')';
            const expectedBoarder: string = "(\")\")";
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
        });

        test('(some long expression with "inner quoted part with ) and \\", yeah")String', () => {
            const input: IndexedString = IndexedString.new('(some long expression with "inner quoted part with ) and \\", yeah")String');
            const start: string = '(';
            const end: string = ')';
            const expectedBoarder: string = '(some long expression with "inner quoted part with ) and \\", yeah")';
            const expectedRest: string = "String";

            const result = ParserIndexed.nextBorderedPart(input, start, end);
            expect(result.first.toString()).toBe(expectedBoarder);
            expect(result.second.toString()).toBe(expectedRest);
        });
    });
});

describe('skipWhitespacesAndChar', () => {
    test(",", () => {
        const str: string = ",";
        const expected: string = "";

        const actual: IndexedString = ParserIndexed.skipWhitespacesAndChar(IndexedString.new(str), ',');
        expect(actual.toString()).toBe(expected);
    });

    test("abcd", () => {
        const str: string = "abcd";
        const expected: string = "bcd";

        const actual: IndexedString = ParserIndexed.skipWhitespacesAndChar(IndexedString.new(str), 'a');
        expect(actual.toString()).toBe(expected);
    });

    test(": \"Value\", Next: 123544, Next: \"asasasd\"", () => {
        const str: string = ": \"Value\", Next: 123544, Next: \"asasasd\"";
        const expected: string = "\"Value\", Next: 123544, Next: \"asasasd\"";

        const actual: IndexedString = ParserIndexed.skipWhitespacesAndChar(IndexedString.new(str), ':');
        expect(actual.toString()).toBe(expected);
    });

    test("  \t  :\t \"Value\", Next: 123544, Next: \"asasasd\"", () => {
        const str: string = "  \t  :\t \"Value\", Next: 123544, Next: \"asasasd\"";
        const expected: string = "\"Value\", Next: 123544, Next: \"asasasd\"";

        const actual: IndexedString = ParserIndexed.skipWhitespacesAndChar(IndexedString.new(str), ':');
        expect(actual.toString()).toBe(expected);
    });
});

describe('deleteCommentLines', () => {
    test('', () => {
        const inputStr: string = '//comment before relation\n' +
            '\n' +
            'Auto = {\n' +
            '    //comment 1 in a relation\n' +
            'Id: number, Barva: string   // comment after line\n' +
            '\n' +
            '//comment 2 in a relation\n' +
            '         1,     "Cervena"\n' +
            '      null,          null\n' +
            '          ,   ",{}\\"..."\n' +
            '}\n' +
            '\n' +
            '     //   comment between relations\n' +
            '\n' +
            'Majitel = {//comment with .[/",// stuf\n' +
            'Id: number, Jmeno: string\n' +
            '\n' +
            '         1,        "Lukas"\n' +
            '\t \t// comment 3 in a relation\n' +
            '}';
        const input: IndexedString = IndexedString.new(inputStr);
        const expectedStr: string = '\n' +
            '\n' +
            'Auto = {\n' +
            '    \n' +
            'Id: number, Barva: string   \n' +
            '\n' +
            '\n' +
            '         1,     "Cervena"\n' +
            '      null,          null\n' +
            '          ,   ",{}\\"..."\n' +
            '}\n' +
            '\n' +
            '     \n' +
            '\n' +
            'Majitel = {\n' +
            'Id: number, Jmeno: string\n' +
            '\n' +
            '         1,        "Lukas"\n' +
            '\t \t\n' +
            '}';

        const actual: IndexedString = ParserIndexed.deleteCommentLines(input);
        expect(actual.toString()).toStrictEqual(expectedStr);
        expect(actual.getLastIndex()).toStrictEqual(input.getLastIndex());
    });
});
