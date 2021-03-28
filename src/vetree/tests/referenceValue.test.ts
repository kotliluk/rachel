import Row from "../../relation/row";
import {ColumnContent, SupportedColumnType} from "../../relation/columnType";
import {ReferenceValue} from "../referenceValue";

const numColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>();
numColumns.set("One", "number");
numColumns.set("Two", "number");
numColumns.set("Three", "number");

const strColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>();
strColumns.set("AAA", "string");
strColumns.set("BBB", "string");
strColumns.set("CCC", "string");

const boolColumns: Map<string, SupportedColumnType> = new Map<string, SupportedColumnType>();
boolColumns.set("True", "boolean");
boolColumns.set("False", "boolean");

const numRowWithAllValues: Row = new Row(numColumns);
numRowWithAllValues.addValue("One", 1);
numRowWithAllValues.addValue("Two", 2);
numRowWithAllValues.addValue("Three", 3);

const strRowWithAllValues: Row = new Row(strColumns);
strRowWithAllValues.addValue("AAA", "aaa");
strRowWithAllValues.addValue("BBB", "bbb");
strRowWithAllValues.addValue("CCC", "ccc");

const boolRowWithAllValues: Row = new Row(boolColumns);
boolRowWithAllValues.addValue("True", true);
boolRowWithAllValues.addValue("False", false);

const numRowWithOneNumberNullValue: Row = new Row(numColumns);
numRowWithOneNumberNullValue.addValue("One", null);
numRowWithOneNumberNullValue.addValue("Two", 2);
numRowWithOneNumberNullValue.addValue("Three", 3);

const strRowWithAAANullValue: Row = new Row(strColumns);
strRowWithAAANullValue.addValue("AAA", null);
strRowWithAAANullValue.addValue("BBB", "bbb");
strRowWithAAANullValue.addValue("CCC", "ccc");

describe('eval', () => {
    describe('rows with wanted value given', () => {
        test('wants number value', () => {
            const sourceOne: Row = numRowWithAllValues;

            const wantedColumn: string = "One";
            const expectedValue: {value: ColumnContent, type: SupportedColumnType | "null"} = {value: 1, type: "number"};
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);

            const actualValue: {value: ColumnContent, type: SupportedColumnType | "null"} = reference.eval(sourceOne);
            expect(actualValue).toStrictEqual(expectedValue);
        });

        test('wants string value', () => {
            const sourceOne: Row = strRowWithAllValues;

            const wantedColumn: string = "AAA";
            const expectedValue: {value: ColumnContent, type: SupportedColumnType | "null"} = {value: "aaa", type: "string"};
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);

            const actualValue: {value: ColumnContent, type: SupportedColumnType | "null"} = reference.eval(sourceOne);
            expect(actualValue).toStrictEqual(expectedValue);
        });

        test('wants boolean value', () => {
            const sourceOne: Row = boolRowWithAllValues;

            const wantedColumn: string = "True";
            const expectedValue: {value: ColumnContent, type: SupportedColumnType | "null"} = {value: true, type: "boolean"};
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);

            const actualValue: {value: ColumnContent, type: SupportedColumnType | "null"} = reference.eval(sourceOne);
            expect(actualValue).toStrictEqual(expectedValue);
        });

        test('wants null value (from number type)', () => {
            const sourceOne: Row = numRowWithOneNumberNullValue;

            const wantedColumn: string = "One";
            const expectedValue: {value: ColumnContent, type: SupportedColumnType | "null"} = {value: null, type: "number"};
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);

            const actualValue: {value: ColumnContent, type: SupportedColumnType | "null"} = reference.eval(sourceOne);
            expect(actualValue).toStrictEqual(expectedValue);
        });
    });

    describe('rows without wanted value given', () => {
        test('wants absent number value', () => {
            const sourceOne: Row = numRowWithAllValues;

            const wantedColumn: string = "Four";
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);
            expect(() => reference.eval(sourceOne)).toThrow();
        });

        test('wants absent string value', () => {
            const sourceOne: Row = strRowWithAllValues;

            const wantedColumn: string = "DDD";
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);
            expect(() => reference.eval(sourceOne)).toThrow();
        });

        test('wants absent boolean value', () => {
            const sourceOne: Row = boolRowWithAllValues;

            const wantedColumn: string = "NotTrueNotFalse";
            const reference: ReferenceValue = new ReferenceValue(wantedColumn);
            expect(() => reference.eval(sourceOne)).toThrow();
        });
    });
});