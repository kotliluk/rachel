import StringUtils from "../stringUtils";

describe('isWord', () => {
    test('true for only-letter-strings', () => {
        const w1: string = "Word";
        const w2: string = "WordWord";
        const w3: string = "aaaaWord";
        const w4: string = "čřžšá";
        const w5: string = "ŠČíáopL";

        expect(StringUtils.isWord(w1)).toBeTruthy();
        expect(StringUtils.isWord(w2)).toBeTruthy();
        expect(StringUtils.isWord(w3)).toBeTruthy();
        expect(StringUtils.isWord(w4)).toBeTruthy();
        expect(StringUtils.isWord(w5)).toBeTruthy();
    });

    test('false for string with a non-letter character', () => {
        const w1: string = "Word ";
        const w2: string = "Word Word";
        const w3: string = " aaaaWord";
        const w4: string = "WORD2";
        const w5: string = "woČŘ.";

        expect(StringUtils.isWord(w1)).toBeFalsy();
        expect(StringUtils.isWord(w2)).toBeFalsy();
        expect(StringUtils.isWord(w3)).toBeFalsy();
        expect(StringUtils.isWord(w4)).toBeFalsy();
        expect(StringUtils.isWord(w5)).toBeFalsy();
    });
});

describe('isName', () => {
    test('true for valid names', () => {
        const w1: string = "Word";
        const w2: string = "_Word";
        const w3: string = "aaaaWord123";
        const w4: string = "ŠČř_123__žšá";

        expect(StringUtils.isName(w1)).toBeTruthy();
        expect(StringUtils.isName(w2)).toBeTruthy();
        expect(StringUtils.isName(w3)).toBeTruthy();
        expect(StringUtils.isName(w4)).toBeTruthy();
    });

    test('false for invalid names', () => {
        const w1: string = "Word ";
        const w2: string = "Word Word";
        const w3: string = " aaaaWord";
        const w4: string = "123WORD";

        expect(StringUtils.isName(w1)).toBeFalsy();
        expect(StringUtils.isName(w2)).toBeFalsy();
        expect(StringUtils.isName(w3)).toBeFalsy();
        expect(StringUtils.isName(w4)).toBeFalsy();
    });
});

describe('isWhitespacesOnly', () => {
    test('true for only-whitespaces-strings', () => {
        const w1: string = " ";
        const w2: string = "   ";
        const w3: string = " \n\t ";
        const w4: string = "";

        expect(StringUtils.isWhitespacesOnly(w1)).toBeTruthy();
        expect(StringUtils.isWhitespacesOnly(w2)).toBeTruthy();
        expect(StringUtils.isWhitespacesOnly(w3)).toBeTruthy();
        expect(StringUtils.isWhitespacesOnly(w4)).toBeTruthy();
    });

    test('false for string with a non-whitespace character', () => {
        const w1: string = "Word ";
        const w2: string = "    a   ";
        const w3: string = "\na\n";
        const w4: string = "\t\t \t.\n";

        expect(StringUtils.isWhitespacesOnly(w1)).toBeFalsy();
        expect(StringUtils.isWhitespacesOnly(w2)).toBeFalsy();
        expect(StringUtils.isWhitespacesOnly(w3)).toBeFalsy();
        expect(StringUtils.isWhitespacesOnly(w4)).toBeFalsy();
    });
});

describe('isLetter', () => {
    test('true for letters', () => {
        const w1: string = "a";
        const w2: string = "A";
        const w3: string = "č";
        const w4: string = "í";

        expect(StringUtils.isLetter(w1)).toBeTruthy();
        expect(StringUtils.isLetter(w2)).toBeTruthy();
        expect(StringUtils.isLetter(w3)).toBeTruthy();
        expect(StringUtils.isLetter(w4)).toBeTruthy();
    });

    test('false for non-letters and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "abcd";

        expect(StringUtils.isLetter(w1)).toBeFalsy();
        expect(StringUtils.isLetter(w2)).toBeFalsy();
        expect(StringUtils.isLetter(w3)).toBeFalsy();
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

        expect(StringUtils.isNameChar(w1)).toBeTruthy();
        expect(StringUtils.isNameChar(w2)).toBeTruthy();
        expect(StringUtils.isNameChar(w3)).toBeTruthy();
        expect(StringUtils.isNameChar(w4)).toBeTruthy();
        expect(StringUtils.isNameChar(w5)).toBeTruthy();
        expect(StringUtils.isNameChar(w6)).toBeTruthy();
    });

    test('false for non-letters, non-number and non-underscores and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "abcd";

        expect(StringUtils.isNameChar(w1)).toBeFalsy();
        expect(StringUtils.isNameChar(w2)).toBeFalsy();
        expect(StringUtils.isNameChar(w3)).toBeFalsy();
    });
});

describe('isDigit', () => {
    test('true for digits', () => {
        const w1: string = "0";
        const w2: string = "1";
        const w3: string = "5";

        expect(StringUtils.isDigit(w1)).toBeTruthy();
        expect(StringUtils.isDigit(w2)).toBeTruthy();
        expect(StringUtils.isDigit(w3)).toBeTruthy();
    });

    test('false for non-digit and longer strings', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "a";
        const w4: string = "12";

        expect(StringUtils.isDigit(w1)).toBeFalsy();
        expect(StringUtils.isDigit(w2)).toBeFalsy();
        expect(StringUtils.isDigit(w3)).toBeFalsy();
        expect(StringUtils.isDigit(w4)).toBeFalsy();
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

        expect(StringUtils.isNumber(w1)).toBeTruthy();
        expect(StringUtils.isNumber(w2)).toBeTruthy();
        expect(StringUtils.isNumber(w3)).toBeTruthy();
        expect(StringUtils.isNumber(w4)).toBeTruthy();
        expect(StringUtils.isNumber(w5)).toBeTruthy();
        expect(StringUtils.isNumber(w6)).toBeTruthy();
        expect(StringUtils.isNumber(w7)).toBeTruthy();
        expect(StringUtils.isNumber(w8)).toBeTruthy();
    });

    test('false for non-numbers', () => {
        const w1: string = " ";
        const w2: string = ".";
        const w3: string = "a";
        const w4: string = ".12";
        const w5: string = "1.2.";

        expect(StringUtils.isNumber(w1)).toBeFalsy();
        expect(StringUtils.isNumber(w2)).toBeFalsy();
        expect(StringUtils.isNumber(w3)).toBeFalsy();
        expect(StringUtils.isNumber(w4)).toBeFalsy();
        expect(StringUtils.isNumber(w5)).toBeFalsy();
    });
});

describe('nextWord', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = StringUtils.nextWord(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = StringUtils.nextWord(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = StringUtils.nextWord(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "";
        const expectedRest: string = "< >";

        const result = StringUtils.nextWord(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('"  \n \t "', () => {
        const input: string = "  \n \t ";
        const expectedWord: string = "";
        const expectedRest: string = "  \n \t ";

        const result = StringUtils.nextWord(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = StringUtils.nextWord(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });
});

describe('nextName', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('word_123', () => {
        const input: string = "word_123";
        const expectedWord: string = "word_123";
        const expectedRest: string = "";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('word_123 other_Word', () => {
        const input: string = "word_123 other_Word";
        const expectedWord: string = "word_123";
        const expectedRest: string = " other_Word";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('_123 other_Word', () => {
        const input: string = "_123 other_Word";
        const expectedWord: string = "_123";
        const expectedRest: string = " other_Word";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('123_word other_Word', () => {
        const input: string = "123_word other_Word";
        const expectedWord: string = "";
        const expectedRest: string = "123_word other_Word";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "";
        const expectedRest: string = "< >";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('"  \n \t "', () => {
        const input: string = "  \n \t ";
        const expectedWord: string = "";
        const expectedRest: string = "  \n \t ";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = StringUtils.nextName(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });
});

describe('nextNonWhitespacePart', () => {
    test('word', () => {
        const input: string = "word";
        const expectedWord: string = "word";
        const expectedRest: string = "";

        const result = StringUtils.nextNonWhitespacePart(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test(';$#& *#^', () => {
        const input: string = ";$#& *#^";
        const expectedWord: string = ";$#&";
        const expectedRest: string = " *#^";

        const result = StringUtils.nextNonWhitespacePart(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test(' word  \n\t', () => {
        const input: string = " word  \n\t";
        const expectedWord: string = "";
        const expectedRest: string = " word  \n\t";

        const result = StringUtils.nextNonWhitespacePart(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('wor d', () => {
        const input: string = "wor d";
        const expectedWord: string = "wor";
        const expectedRest: string = " d";

        const result = StringUtils.nextNonWhitespacePart(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedWord: string = "<";
        const expectedRest: string = " >";

        const result = StringUtils.nextNonWhitespacePart(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedWord: string = "";
        const expectedRest: string = "";

        const result = StringUtils.nextNonWhitespacePart(input);
        expect(result.first).toBe(expectedWord);
        expect(result.second).toBe(expectedRest);
    });
});

describe('nextNumber', () => {
    test('12', () => {
        const input: string = "12";
        const expectedNumber: string = "12";
        const expectedRest: string = "";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test(' 12  \n\t', () => {
        const input: string = " 12  \n\t";
        const expectedNumber: string = "";
        const expectedRest: string = " 12  \n\t";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('12 d', () => {
        const input: string = "12 d";
        const expectedNumber: string = "12";
        const expectedRest: string = " d";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('.12 d', () => {
        const input: string = ".12 d";
        const expectedNumber: string = "";
        const expectedRest: string = ".12 d";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('< >', () => {
        const input: string = "< >";
        const expectedNumber: string = "";
        const expectedRest: string = "< >";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('  \n \t ', () => {
        const input: string = "  \n \t ";
        const expectedNumber: string = "";
        const expectedRest: string = "  \n \t ";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('12.456', () => {
        const input: string = "12.456";
        const expectedNumber: string = "12.456";
        const expectedRest: string = "";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test(' 12.456  \n\t', () => {
        const input: string = " 12.456  \n\t";
        const expectedNumber: string = "";
        const expectedRest: string = " 12.456  \n\t";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('12.456 d', () => {
        const input: string = "12.456 d";
        const expectedNumber: string = "12.456";
        const expectedRest: string = " d";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('12.456.5 d', () => {
        const input: string = "12.456.5 d";
        const expectedNumber: string = "12.456";
        const expectedRest: string = ".5 d";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });

    test('""', () => {
        const input: string = "";
        const expectedNumber: string = "";
        const expectedRest: string = "";

        const result = StringUtils.nextNumber(input);
        expect(result.first).toBe(expectedNumber);
        expect(result.second).toBe(expectedRest);
    });
});

describe('nextQuotedString', () => {
    describe('valid strings', () => {
        test('"Quoted"String', () => {
            const input: string = '"Quoted"String';
            const expectedBordered: string = '"Quoted"';
            const expectedRest: string = "String";

            const result = StringUtils.nextQuotedString(input);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
            expect(result.error).toBeUndefined();
        });

        test('"Quoted with \\" character"String', () => {
            const input: string = '"Quoted with \\" character"String';
            const expectedBordered: string = '"Quoted with \\" character"';
            const expectedRest: string = "String";

            const result = StringUtils.nextQuotedString(input);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
            expect(result.error).toBeUndefined();
        });

        test('"Quoted with more \\\\ \\" character\\\\"String', () => {
            const input: string = '"Quoted with more \\\\ \\" character\\\\"String';
            const expectedBordered: string = '"Quoted with more \\\\ \\" character\\\\"';
            const expectedRest: string = "String";

            const result = StringUtils.nextQuotedString(input);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
            expect(result.error).toBeUndefined();
        });
    });

    describe('invalid strings', () => {
        test('"Left quoted String', () => {
            const input: string = '"Left quoted String';
            const expectedBordered: string = '"Left quoted String';
            const expectedRest: string = "";

            const result = StringUtils.nextQuotedString(input);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
            expect(result.error).not.toBeUndefined();
        });

        test('"End on the next\nline"', () => {
            const input: string = '"End on the next\nline"';
            const expectedBordered: string = '"End on the next\n';
            const expectedRest: string = 'line"';

            const result = StringUtils.nextQuotedString(input);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
            expect(result.error).not.toBeUndefined();
        });
    });
});

describe('nextBorderedPart', () => {
    describe('valid strings with one ending character split correctly', () => {
        test('()String', () => {
            const input: string = "()String";
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = "()";
            const expectedRest: string = "String";

            const result = StringUtils.nextBorderedPart(input, start, end);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });

        test('((()))String', () => {
            const input: string = "((()))String";
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = "((()))";
            const expectedRest: string = "String";

            const result = StringUtils.nextBorderedPart(input, start, end);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });
    });

    describe('valid strings with more ending characters split correctly', () => {
        test('[((InnerString))]String', () => {
            const input: string = "[((InnerString))]String";
            const start: string = '[';
            const end: string = ']>';
            const expectedBordered: string = "[((InnerString))]";
            const expectedRest: string = "String";

            const result = StringUtils.nextBorderedPart(input, start, end);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });

        test('[((InnerString))>String', () => {
            const input: string = "[((InnerString))>String";
            const start: string = '[';
            const end: string = ']>';
            const expectedBordered: string = "[((InnerString))>";
            const expectedRest: string = "String";

            const result = StringUtils.nextBorderedPart(input, start, end);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });

        test('< some -> rename >AndSoOn', () => {
            const input: string = "< some -> rename >AndSoOn";
            const start: string = '<';
            const end: string = ']>';
            const escape: string = '-';
            const expectedBordered: string = "< some -> rename >";
            const expectedRest: string = "AndSoOn";

            const result = StringUtils.nextBorderedPart(input, start, end, escape);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });
    });

    describe('invalid strings throw an error', () => {
        test('((())String', () => {
            const input: string = "((())String";
            const start: string = '(';
            const end: string = ')';

            expect(() => StringUtils.nextBorderedPart(input, start, end)).toThrow();
        });

        test('(String', () => {
            const input: string = "(String";
            const start: string = '(';
            const end: string = ')';

            expect(() => StringUtils.nextBorderedPart(input, start, end)).toThrow();
        });
    });

    describe('ignores special chars in quoted part', () => {
        test('(")")String', () => {
            const input: string = "(\")\")String";
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = "(\")\")";
            const expectedRest: string = "String";

            const result = StringUtils.nextBorderedPart(input, start, end);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });

        test('(some long expression with "inner quoted part with ) and \\", yeah")String', () => {
            const input: string = '(some long expression with "inner quoted part with ) and \\", yeah")String';
            const start: string = '(';
            const end: string = ')';
            const expectedBordered: string = '(some long expression with "inner quoted part with ) and \\", yeah")';
            const expectedRest: string = "String";

            const result = StringUtils.nextBorderedPart(input, start, end);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });
    });

    describe('multiple escape characters work correctly', () => {
        test('"A\\"B"abc', () => {
            const input: string = '"A\\"B"abc';
            const start: string = '"';
            const end: string = '"';
            const escape: string = '\\';
            const expectedBordered: string = '"A\\"B"';
            const expectedRest: string = 'abc';

            const result = StringUtils.nextBorderedPart(input, start, end, escape);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });

        test('"A\\\\"B"abc', () => {
            const input: string = '"A\\\\"B"abc';
            const start: string = '"';
            const end: string = '"';
            const escape: string = '\\';
            const expectedBordered: string = '"A\\\\"';
            const expectedRest: string = 'B"abc';

            const result = StringUtils.nextBorderedPart(input, start, end, escape);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });

        test('"A\\ \\" \\\\\\"B"abc', () => {
            const input: string = '"A\\ \\" \\\\\\"B"abc';
            const start: string = '"';
            const end: string = '"';
            const escape: string = '\\';
            const expectedBordered: string = '"A\\ \\" \\\\\\"B"';
            const expectedRest: string = 'abc';

            const result = StringUtils.nextBorderedPart(input, start, end, escape);
            expect(result.first).toBe(expectedBordered);
            expect(result.second).toBe(expectedRest);
        });
    });
});

describe('skipWhitespacesAndChar', () => {
    test(",", () => {
        const str: string = ",";
        const expected: string = "";

        const actual: string = StringUtils.skipWhitespacesAndChar(str, ',');
        expect(actual.toString()).toBe(expected);
    });

    test("abcd", () => {
        const str: string = "abcd";
        const expected: string = "bcd";

        const actual: string = StringUtils.skipWhitespacesAndChar(str, 'a');
        expect(actual).toBe(expected);
    });

    test(": \"Value\", Next: 123544, Next: \"asasasd\"", () => {
        const str: string = ": \"Value\", Next: 123544, Next: \"asasasd\"";
        const expected: string = "\"Value\", Next: 123544, Next: \"asasasd\"";

        const actual: string = StringUtils.skipWhitespacesAndChar(str, ':');
        expect(actual).toBe(expected);
    });

    test("  \t  :\t \"Value\", Next: 123544, Next: \"asasasd\"", () => {
        const str: string = "  \t  :\t \"Value\", Next: 123544, Next: \"asasasd\"";
        const expected: string = "\"Value\", Next: 123544, Next: \"asasasd\"";

        const actual: string = StringUtils.skipWhitespacesAndChar(str, ':');
        expect(actual).toBe(expected);
    });
});

describe('deleteCommentLines', () => {
    test('', () => {
        const input: string = '// comment before relation\n' +
            '\n' +
            'Auto = {\n' +
            '    // comment 1 in a relation\n' +
            'Id: number, Barva: string   // comment after a line...\n' +
            '\n' +
            '//comment 2 in a relation\n' +
            '         1,     "Cervena\\" \\\\"   // comment after a line with quotes\n' +
            '      null,          null\n' +
            '          ,   ",{}\\"..."\n' +
            '}\n' +
            '\n' +
            '     //   comment between relations\n' +
            '\n' +
            'Majitel = {// comment here .,///"\\"()...\n' +
            'Id: number, Jmeno: string\n' +
            '\n' +
            '         1,        "Lukas"\n' +
            '\t \t// comment 3 in a relation\n' +
            '}';
        const expected: string = '\n' +
            '\n' +
            'Auto = {\n' +
            '    \n' +
            'Id: number, Barva: string   \n' +
            '\n' +
            '\n' +
            '         1,     "Cervena\\" \\\\"   \n' +
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

        const actual: string = StringUtils.deleteCommentLines(input);
        expect(actual).toStrictEqual(expected);
    });
});
