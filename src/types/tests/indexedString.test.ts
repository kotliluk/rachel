import {IndexedChar, IndexedString} from "../indexedString";
import {StartEndPair} from "../startEndPair";

const strOne: string = "Str with \n and řý87\"6§.)";
const indexedStrOne: IndexedChar[] = strOne.split('').map((char, index) => {return {char: char, index: index}});

const strTwo: string = "The quick brown fox jumps over the lazy dog.";
const indexedStrTwo: IndexedChar[] = strTwo.split('').map((char, index) => {return {char: char, index: index}});

const strThree: string = "abcde";

describe("new", () => {
    test("Str with '\n'' and 'řý87\"6§.)'", () => {
        // act
        const indexedString = IndexedString.new(strOne);
        // assert
        expect(indexedString.toString()).toStrictEqual(strOne);
        expect(indexedString.length()).toStrictEqual(strOne.length);
        expect(indexedString.getChars()).toStrictEqual(indexedStrOne);
        expect(indexedString.getFirstIndex()).toStrictEqual(0);
        expect(indexedString.getLastIndex()).toStrictEqual(strOne.length - 1);
    });

    test("Empty string", () => {
        // act
        const indexedString = IndexedString.new("");
        // assert
        expect(indexedString.toString()).toStrictEqual('');
        expect(indexedString.length()).toStrictEqual(0);
        expect(indexedString.getChars()).toStrictEqual([]);
        expect(indexedString.getFirstIndex()).toBeNaN();
        expect(indexedString.getLastIndex()).toBeNaN();
    });

    test("number startIndex given", () => {
        // act
        const indexedString = IndexedString.new(strOne, 5);
        // assert
        expect(indexedString.toString()).toStrictEqual(strOne);
        expect(indexedString.length()).toStrictEqual(strOne.length);
        expect(indexedString.getChars()).toStrictEqual(indexedStrOne.map(ic => {return {char: ic.char, index: ic.index + 5}}));
        expect(indexedString.getFirstIndex()).toStrictEqual(5);
        expect(indexedString.getLastIndex()).toStrictEqual(strOne.length - 1 + 5);
    });

    test("NaN startIndex given", () => {
        // act
        const indexedString = IndexedString.new(strOne, NaN);
        // assert
        expect(indexedString.toString()).toStrictEqual(strOne);
        expect(indexedString.length()).toStrictEqual(strOne.length);
        expect(indexedString.getChars()).toStrictEqual(indexedStrOne.map(ic => {return {char: ic.char, index: NaN}}));
        expect(indexedString.getFirstIndex()).toStrictEqual(NaN);
        expect(indexedString.getLastIndex()).toStrictEqual(NaN);
    });
});

describe("copy", () => {
    test("identical copy", () => {
        // arrange
        const indexedString = IndexedString.new(strOne);
        // act
        const copy = indexedString.copy();
        // assert
        expect(copy.getChars()).toStrictEqual(indexedString.getChars());
    });
});

describe("split", () => {
    test("original string not changed", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        // act
        indexedString.split('');
        // assert
        expect(indexedString.getChars()).toStrictEqual(indexedStrTwo);
    });

    test("non-empty split(' ')", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        const split: string[] = strTwo.split(' ');
        // act
        const indexedSplit: IndexedString[] = indexedString.split(' ');
        // assert
        expect(indexedSplit.length).toStrictEqual(split.length);
        split.forEach((part, i) => {
            expect(indexedSplit[i].getChars().map(ic => ic.char).join('')).toStrictEqual(part);
            expect(indexedSplit[i].toString()).toStrictEqual(part);
        })
    });

    test("empty split(' ')", () => {
        // arrange
        const indexedString = IndexedString.empty();
        const split: string[] = ''.split(' ');
        // act
        const indexedSplit: IndexedString[] = indexedString.split(' ');
        // assert
        expect(indexedSplit.length).toStrictEqual(split.length);
        split.forEach((part, i) => {
            expect(indexedSplit[i].getChars().map(ic => ic.char).join('')).toStrictEqual(part);
            expect(indexedSplit[i].toString()).toStrictEqual(part);
        })
    });

    test("non-empty split('')", () => {
        // arrange
        const indexedString = IndexedString.new(strOne);
        const split: string[] = strOne.split(' ');
        // act
        const indexedSplit: IndexedString[] = indexedString.split(' ');
        // assert
        expect(indexedSplit.length).toStrictEqual(split.length);
        split.forEach((part, i) => {
            expect(indexedSplit[i].getChars().map(ic => ic.char).join('')).toStrictEqual(part);
            expect(indexedSplit[i].toString()).toStrictEqual(part);
        });
    });

    test("empty split('')", () => {
        // arrange
        const indexedString = IndexedString.empty();
        const split: string[] = ''.split('');
        // act
        const indexedSplit: IndexedString[] = indexedString.split('');
        // assert
        expect(indexedSplit.length).toStrictEqual(split.length);
        split.forEach((part, i) => {
            expect(indexedSplit[i].getChars().map(ic => ic.char).join('')).toStrictEqual(part);
            expect(indexedSplit[i].toString()).toStrictEqual(part);
        });
    });
});

describe("slice", () => {
    test("original string not changed", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        // act
        indexedString.slice(5, 15);
        // assert
        expect(indexedString.getChars()).toStrictEqual(indexedStrTwo);
    });

    test("valid slice with start and end", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        const slice: string = strTwo.slice(5, 15);
        // act
        const indexedSlice: IndexedString = indexedString.slice(5, 15);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
        expect(indexedString.getChars()).toStrictEqual(indexedStrTwo);
    });

    test("valid slice with start and end", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        const slice: string = strThree.slice(0, 5);
        // act
        const indexedSlice: IndexedString = indexedString.slice(0, 5);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("valid slice with start only", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        const slice: string = strTwo.slice(5);
        // act
        const indexedSlice: IndexedString = indexedString.slice(5);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("valid slice with start only", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        const slice: string = strThree.slice(0);
        // act
        const indexedSlice: IndexedString = indexedString.slice(0);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("valid slice with negative start and negative end", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        const slice: string = strTwo.slice(-25, -12);
        // act
        const indexedSlice: IndexedString = indexedString.slice(-25, -12);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("valid slice with negative start and negative end", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        const slice: string = strThree.slice(-5, -1);
        // act
        const indexedSlice: IndexedString = indexedString.slice(-5, -1);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("valid slice with 0 start and 0 end", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        const slice: string = strThree.slice(0, 0);
        // act
        const indexedSlice: IndexedString = indexedString.slice(0, 0);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("valid slice with 0 start", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        const slice: string = strThree.slice(0);
        // act
        const indexedSlice: IndexedString = indexedString.slice(0);
        // assert
        expect(indexedSlice.toString()).toStrictEqual(slice);
    });

    test("invalid negative start", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        // act and assert
        expect(() => {indexedString.slice(-6, 3)}).toThrow();
    });

    test("invalid negative end", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        // act and assert
        expect(() => {indexedString.slice(2, -6)}).toThrow();
    });

    test("invalid positive start (greater than end)", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        // act and assert
        expect(() => {indexedString.slice(4, 2)}).toThrow();
    });

    test("invalid positive end", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        // act and assert
        expect(() => {indexedString.slice(2, 6)}).toThrow();
    });

    test("invalid positive start and end", () => {
        // arrange
        const indexedString = IndexedString.new(strThree);
        // act and assert
        expect(() => {indexedString.slice(8, 11)}).toThrow();
    });
});

describe("trim", () => {
    test("original string not changed", () => {
        // arrange
        const indexedString = IndexedString.new(strTwo);
        // act
        indexedString.trim();
        // assert
        expect(indexedString.getChars()).toStrictEqual(indexedStrTwo);
    });

    test("trim 1", () => {
        // arrange
        const original: string = "  \n \tfeib jfnsbiu   hf  \t\t";
        const trim: string = "feib jfnsbiu   hf";
        const indexedString = IndexedString.new(original);
        // act
        const actual: IndexedString = indexedString.trim();
        // assert
        expect(actual.toString()).toStrictEqual(trim);
    });

    test("trim 2", () => {
        // arrange
        const original: string = "feib jfnsbiu   hf";
        const trim: string = "feib jfnsbiu   hf";
        const indexedString = IndexedString.new(original);
        // act
        const actual: IndexedString = indexedString.trim();
        // assert
        expect(actual.toString()).toStrictEqual(trim);
    });
});

describe("concat", () => {
    test("original strings not changed", () => {
        // arrange
        const a: string = "abc def";
        const b: string = "123 456";
        const c: string = "ěšč řžý";
        const d: string = ",./ ;'\\";
        const isA = IndexedString.new(a);
        const isB = IndexedString.new(b);
        const isC = IndexedString.new(c);
        const isD = IndexedString.new(d);
        // act
        isA.concat(isB, isC, isD);
        // assert
        expect(isA.toString()).toStrictEqual(a);
        expect(isB.toString()).toStrictEqual(b);
        expect(isC.toString()).toStrictEqual(c);
        expect(isD.toString()).toStrictEqual(d);
    });

    test("original indexes kept", () => {
        // arrange
        const a: IndexedChar[] = [{ char: 'a', index: 5 }];
        const b: IndexedChar[] = [{ char: 'b', index: 8 }];
        const c: IndexedChar[] = [{ char: 'c', index: 11 }];
        const isA = IndexedString.newFromArray(a);
        const isB = IndexedString.newFromArray(b);
        const isC = IndexedString.newFromArray(c);
        // act
        const result = isA.concat(isB, isC);
        // assert
        expect(result.getFirstIndex()).toBe(5);
        expect(result.getLastIndex()).toBe(11);
    });

    test("concat 4", () => {
        // arrange
        const a: string = "abc def";
        const b: string = "123 456";
        const c: string = "ěšč řžý";
        const d: string = ",./ ;'\\";
        const isA = IndexedString.new(a);
        const isB = IndexedString.new(b);
        const isC = IndexedString.new(c);
        const isD = IndexedString.new(d);
        const expected: string = a.concat(b, c, d);
        // act
        const actual: IndexedString = isA.concat(isB, isC, isD);
        // assert
        expect(actual.toString()).toStrictEqual(expected);
    });

    test("concat 1", () => {
        // arrange
        const a: string = "abc def";
        const isA = IndexedString.new(a);
        const expected: string = a.concat();
        // act
        const actual: IndexedString = isA.concat();
        // assert
        expect(actual.toString()).toStrictEqual(expected);
    });
});

describe("getFirstIndex", () => {
    test("empty string returns NaN", () => {
        // arrange
        const is: IndexedString = IndexedString.empty();
        // act
        const actual: number = is.getFirstIndex();
        // assert
        expect(actual).toBeNaN();
    });

    test("starting with number", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: 0 }, { char: 'a', index: 1 }, { char: 'a', index: 2 },
            { char: 'a', index: 3 }, { char: 'a', index: 4 }, { char: 'a', index: 5 }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: number = is.getFirstIndex();
        // assert
        expect(actual).toBe(0);
    });

    test("starting with NaN", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: 2 },
            { char: 'a', index: NaN }, { char: 'a', index: 4 }, { char: 'a', index: NaN }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: number = is.getFirstIndex();
        // assert
        expect(actual).toBeNaN();
    });
});

describe("getLastIndex", () => {
    test("empty string returns undefined", () => {
        // arrange
        const is: IndexedString = IndexedString.empty();
        // act
        const actual: number = is.getLastIndex();
        // assert
        expect(actual).toBeNaN();
    });

    test("ending with number", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: 0 }, { char: 'a', index: 1 }, { char: 'a', index: 2 },
            { char: 'a', index: 3 }, { char: 'a', index: 4 }, { char: 'a', index: 5 }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: number = is.getLastIndex();
        // assert
        expect(actual).toBe(5);
    });

    test("ending with NaN", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: 2 },
            { char: 'a', index: NaN }, { char: 'a', index: 4 }, { char: 'a', index: NaN }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: number = is.getLastIndex();
        // assert
        expect(actual).toBeNaN()
    });

    test("all NaN", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: NaN },
            { char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: NaN }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: number = is.getLastIndex();
        // assert
        expect(actual).toBeNaN();
    });
});

describe("getRange", () => {
    test("empty string returns undefined", () => {
        // arrange
        const is: IndexedString = IndexedString.empty();
        // act
        const actual: StartEndPair | undefined = is.getRange();
        // assert
        expect(actual).toBeUndefined();
    });

    test("all numbers", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: 0 }, { char: 'a', index: 1 }, { char: 'a', index: 2 },
            { char: 'a', index: 3 }, { char: 'a', index: 4 }, { char: 'a', index: 5 }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: StartEndPair | undefined = is.getRange();
        // assert
        expect(actual).toStrictEqual({start: 0, end: 5});
    });

    test("starting and ending with NaN", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: 2 },
            { char: 'a', index: NaN }, { char: 'a', index: 4 }, { char: 'a', index: NaN }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: StartEndPair | undefined = is.getRange();
        // assert
        expect(actual).toStrictEqual({start: NaN, end: NaN});
    });

    test("all NaN returns undefined", () => {
        // arrange
        const arr: IndexedChar[] = [{ char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: NaN },
            { char: 'a', index: NaN }, { char: 'a', index: NaN }, { char: 'a', index: NaN }];
        const is: IndexedString = IndexedString.newFromArray(arr);
        // act
        const actual: StartEndPair | undefined = is.getRange();
        // assert
        expect(actual).toStrictEqual({start: NaN, end: NaN});
    });
});