import {assertParamsCount, joinStringArrays} from "../errorFactory";


describe("assertParamsCount", () => {
    test("expected 0, given 0", () => {
        // arrange
        const expectedCount: number = 0;
        const params: string[] = [];
        const code: number = 46;
        const expected: string[] = [];
        // act
        assertParamsCount(expectedCount, params, code);
        // assert
        expect(params).toStrictEqual(expected);
    });

    test("expected 0, given 1", () => {
        // arrange
        const expectedCount: number = 0;
        const params: string[] = ['aaa'];
        const code: number = 46;
        const expected: string[] = ['aaa'];
        // act
        assertParamsCount(expectedCount, params, code);
        // assert
        expect(params).toStrictEqual(expected);
    });

    test("expected 2, given 1", () => {
        // arrange
        const expectedCount: number = 2;
        const params: string[] = ['aaa'];
        const code: number = 46;
        const expected: string[] = ['aaa', ''];
        // act
        assertParamsCount(expectedCount, params, code);
        // assert
        expect(params).toStrictEqual(expected);
    });

    test("expected 5, given 3", () => {
        // arrange
        const expectedCount: number = 5;
        const params: string[] = ['aaa', 'bbb', 'ccc'];
        const code: number = 46;
        const expected: string[] = ['aaa', 'bbb', 'ccc', '', ''];
        // act
        assertParamsCount(expectedCount, params, code);
        // assert
        expect(params).toStrictEqual(expected);
    });
});

describe("joinStringArrays", () => {
    test("[a, bb, ccc, d], [1, 222, 3]", () => {
        // arrange
        const arrA: string[] = ['a', 'bb', 'ccc', 'd'];
        const arrB: string[] = ['1', '222', '3'];
        const expected: string = "a1bb222ccc3d";
        // act
        const actual: string = joinStringArrays(arrA, arrB);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("[abcd], []", () => {
        // arrange
        const arrA: string[] = ['abcd'];
        const arrB: string[] = [];
        const expected: string = "abcd";
        // act
        const actual: string = joinStringArrays(arrA, arrB);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("[a, bb, ccc, d], ['', '0   0', '']", () => {
        // arrange
        const arrA: string[] = ['a', 'bb', 'ccc', 'd'];
        const arrB: string[] = ['', '0   0', ''];
        const expected: string = "abb0   0cccd";
        // act
        const actual: string = joinStringArrays(arrA, arrB);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("more in second array: [a, bb, ccc, d], [1, 2, 3, 4, 5]", () => {
        // arrange
        const arrA: string[] = ['a', 'bb', 'ccc', 'd'];
        const arrB: string[] = ['1', '2', '3', '4', '5'];
        const expected: string = "a1bb2ccc3d";
        // act
        const actual: string = joinStringArrays(arrA, arrB);
        // assert
        expect(actual).toStrictEqual(expected);
    });
});