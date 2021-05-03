import {LiteralValue} from "../literalValue";
import {ComparingOperator} from "../comparingOperator";
import {Row}  from "../../relation/row";
import {ColumnContent, SupportedColumnType} from "../../relation/columnType";
import {IndexedString} from "../../types/indexedString";

const literalFour: LiteralValue = new LiteralValue(4, "number");
const literalFive: LiteralValue = new LiteralValue(5, "number");
const literalAAA: LiteralValue = new LiteralValue("AAA", "string");
const literalBBB: LiteralValue = new LiteralValue("BBB", "string");
const literalNull: LiteralValue = new LiteralValue(null, "null");

// uses literals, row just to fill eval parameter
const fakeRowOne: Row = new Row(new Map<string, SupportedColumnType>());

describe('eval', () => {
     describe('number inputs given', () => {
         test('4 == 5 = false', () => {
             const left: LiteralValue = literalFour;
             const right: LiteralValue = literalFive;
             const expected: {value: boolean, type: "boolean"} = {value: false, type: "boolean"};

             const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
             const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
             expect(actual).toStrictEqual(expected);
         });

         test('4 != 5 = true', () => {
             const left: LiteralValue = literalFour;
             const right: LiteralValue = literalFive;
             const expected: {value: boolean, type: "boolean"} = {value: true, type: "boolean"};

             const comparingOperator: ComparingOperator = ComparingOperator.nonEqual(IndexedString.new('!='), left, right);
             const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
             expect(actual).toStrictEqual(expected);
         });

         test('4 > 5 = false', () => {
             const left: LiteralValue = literalFour;
             const right: LiteralValue = literalFive;
             const expected: {value: boolean, type: "boolean"} = {value: false, type: "boolean"};

             const comparingOperator: ComparingOperator = ComparingOperator.more(IndexedString.new('>'), left, right);
             const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
             expect(actual).toStrictEqual(expected);
         });

         test('4 >= 5 = false', () => {
             const left: LiteralValue = literalFour;
             const right: LiteralValue = literalFive;
             const expected: {value: boolean, type: "boolean"} = {value: false, type: "boolean"};

             const comparingOperator: ComparingOperator = ComparingOperator.moreOrEqual(IndexedString.new('>='), left, right);
             const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
             expect(actual).toStrictEqual(expected);
         });

         test('4 < 5 = true', () => {
             const left: LiteralValue = literalFour;
             const right: LiteralValue = literalFive;
             const expected: {value: boolean, type: "boolean"} = {value: true, type: "boolean"};

             const comparingOperator: ComparingOperator = ComparingOperator.less(IndexedString.new('<'), left, right);
             const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
             expect(actual).toStrictEqual(expected);
         });

         test('4 <= 5 = true', () => {
             const left: LiteralValue = literalFour;
             const right: LiteralValue = literalFive;
             const expected: {value: boolean, type: "boolean"} = {value: true, type: "boolean"};

             const comparingOperator: ComparingOperator = ComparingOperator.lessOrEqual(IndexedString.new('<='), left, right);
             const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
             expect(actual).toStrictEqual(expected);
         });
     });

    describe('string inputs given', () => {
        test('AAA == BBB = false', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalBBB;
            const expected: {value: boolean, type: "boolean"} = {value: false, type: "boolean"};

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
            expect(actual).toStrictEqual(expected);
        });

        test('AAA != BBB = true', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalBBB;
            const expected: {value: boolean, type: "boolean"} = {value: true, type: "boolean"};

            const comparingOperator: ComparingOperator = ComparingOperator.nonEqual(IndexedString.new('!='), left, right);
            const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
            expect(actual).toStrictEqual(expected);
        });

        test('AAA > BBB = false', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalBBB;
            const expected: {value: boolean, type: "boolean"} = {value: false, type: "boolean"};

            const comparingOperator: ComparingOperator = ComparingOperator.more(IndexedString.new('>'), left, right);
            const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
            expect(actual).toStrictEqual(expected);
        });

        test('AAA >= BBB = false', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalBBB;
            const expected: {value: boolean, type: "boolean"} = {value: false, type: "boolean"};

            const comparingOperator: ComparingOperator = ComparingOperator.moreOrEqual(IndexedString.new('>='), left, right);
            const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
            expect(actual).toStrictEqual(expected);
        });

        test('AAA < BBB = true', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalBBB;
            const expected: {value: boolean, type: "boolean"} = {value: true, type: "boolean"};

            const comparingOperator: ComparingOperator = ComparingOperator.less(IndexedString.new('<'), left, right);
            const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
            expect(actual).toStrictEqual(expected);
        });

        test('AAA <= BBB = true', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalBBB;
            const expected: {value: boolean, type: "boolean"} = {value: true, type: "boolean"};

            const comparingOperator: ComparingOperator = ComparingOperator.lessOrEqual(IndexedString.new('<='), left, right);
            const actual: {value: ColumnContent, type: SupportedColumnType | "null"} = comparingOperator.eval(fakeRowOne);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe('string and number inputs given', () => {
        test('AAA == 5 throws', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalFive;

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            expect(() => comparingOperator.eval(fakeRowOne)).toThrow();
        });

        test('AAA != 5 = true', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalFive;

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            expect(() => comparingOperator.eval(fakeRowOne)).toThrow();
        });

        test('AAA > 5 = false', () => {
            const left: LiteralValue = literalAAA;
            const right: LiteralValue = literalFive;

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            expect(() => comparingOperator.eval(fakeRowOne)).toThrow();
        });

        test('5 >= BBB = false', () => {
            const left: LiteralValue = literalFive;
            const right: LiteralValue = literalBBB;

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            expect(() => comparingOperator.eval(fakeRowOne)).toThrow();
        });

        test('5 < BBB = true', () => {
            const left: LiteralValue = literalFive;
            const right: LiteralValue = literalBBB;

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            expect(() => comparingOperator.eval(fakeRowOne)).toThrow();
        });

        test('5 <= BBB = true', () => {
            const left: LiteralValue = literalFive;
            const right: LiteralValue = literalBBB;

            const comparingOperator: ComparingOperator = ComparingOperator.equal(IndexedString.new('=='), left, right);
            expect(() => comparingOperator.eval(fakeRowOne)).toThrow();
        });
    });
});