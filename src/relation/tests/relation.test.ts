import {Relation} from "../relation";
import {Row} from "../row";
import {SupportedColumnType} from "../columnType";


let relation: Relation = new Relation("Test");

beforeEach(() => {
    relation = new Relation("Test");
})

describe('addColumn', () => {
    test('adds columns with different names successfully', () => {
        // columns should be added successfully
        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("Second", "number")).toBeTruthy();
        // columns should exist in relation
        expect(relation.hasColumn("First")).toBeTruthy();
        expect(relation.hasColumn("Second")).toBeTruthy();
        // both columns should exist
        expect(relation.getColumns().size).toBe(2);
        // adding columns should not finish the schema
        expect(relation.hasFinishedSchema()).toBeFalsy();
    });

    test('does not add columns with a duplicit name', () => {
        // column should be added successfully only once
        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("First", "number")).toBeFalsy();
        // column should exist only once
        expect(relation.getColumns().size).toBe(1);
        // adding columns should not finish the schema
        expect(relation.hasFinishedSchema()).toBeFalsy();
    });

    test('does not add more columns after row addition', () => {
        relation.addColumn("First", "string");
        relation.addColumn("Second", "number");
        // adds a row with compatible columns
        const rowOne = new Row(relation.getColumns());
        relation.addRow(rowOne);
        // should not add more columns after row addition
        expect(relation.addColumn("Third", "number")).toBeFalsy();
        expect(relation.getColumns().size).toBe(2);
    });
});

describe('addRow', () => {
    test('adds rows with valid columns successfully', () => {
        relation.addColumn("First", "string");
        relation.addColumn("Second", "number");
        // should add a row with compatible columns
        const rowOne = new Row(relation.getColumns());
        expect(relation.addRow(rowOne)).toBeTruthy();
        // row and relation schemas should be finished after addition
        expect(rowOne.isFinished()).toBeTruthy();
        expect(relation.hasFinishedSchema()).toBeTruthy();
        // should add next row with compatible columns
        const rowTwo = new Row(relation.getColumns());
        rowTwo.addValue("First", "Some value");
        rowTwo.addValue("Second", 462020);
        expect(relation.addRow(rowTwo)).toBeTruthy();
    });

    describe('does not add rows with invalid columns', () => {
        test('too few columns', () => {
            relation.addColumn("First", "string");
            relation.addColumn("Second", "number");
            // should not add a row with too few columns
            const tooFew = new Map<string, SupportedColumnType>([["First", "string"]]);
            const rowOne = new Row(tooFew);
            expect(relation.addRow(rowOne)).toBeFalsy();
            expect(rowOne.isFinished()).toBeFalsy();
        });

        test('too many columns', () => {
            relation.addColumn("First", "string");
            relation.addColumn("Second", "number");
            // should not add a row with too many columns
            const tooMany = new Map<string, SupportedColumnType>([
                ["First", "string"], ["Second", "number"], ["Third", "boolean"]
            ]);
            const rowTwo = new Row(tooMany);
            expect(relation.addRow(rowTwo)).toBeFalsy();
            expect(rowTwo.isFinished()).toBeFalsy();
        });

        test('different columns', () => {
            relation.addColumn("First", "string");
            relation.addColumn("Second", "number");
            // should not add a row with different columns
            const differentTypes = new Map<string, SupportedColumnType>([["First", "number"], ["Second", "number"]]);
            const rowThree = new Row(differentTypes);
            expect(relation.addRow(rowThree)).toBeFalsy();
            expect(rowThree.isFinished()).toBeFalsy();
        });
    });

    test('duplicit rows stored only once in a relation', () => {
        relation.addColumn("First", "string");
        relation.addColumn("Second", "string");

        const rowOne = new Row(relation.getColumns());
        rowOne.addValue("First", "Some value");
        rowOne.addValue("Second", "Another value");
        expect(relation.addRow(rowOne)).toBeTruthy();
        expect(relation.getRows().length).toBe(1);

        const rowTwo = new Row(relation.getColumns());
        rowTwo.addValue("First", "Some value");
        rowTwo.addValue("Second", "Another value");
        expect(relation.addRow(rowTwo)).toBeTruthy();
        expect(relation.getRows().length).toBe(1);    // still size 1
    });
});
