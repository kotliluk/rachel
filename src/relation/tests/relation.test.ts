import Relation from "../relation";
import Row from "../row";
import {SupportedColumnType} from "../columnType";

describe('addColumn', () => {
    test('adds columns with different names successfully', () => {
        let relation = new Relation("Test");

        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("Second", "string")).toBeTruthy();
        expect(relation.addColumn("Third", "number")).toBeTruthy();

        expect(relation.hasColumn("First")).toBeTruthy();
        expect(relation.hasColumn("Second")).toBeTruthy();
        expect(relation.hasColumn("Third")).toBeTruthy();

        let added = relation.getColumns();
        expect(added.size).toBe(3);

        expect(relation.hasFinishedSchema()).toBeFalsy();
    });

    test('does not add columns with a duplicit name', () => {
        let relation = new Relation("Test");

        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("First", "number")).toBeFalsy();

        let added = relation.getColumns();
        expect(added.size).toBe(1);

        expect(relation.hasFinishedSchema()).toBeFalsy();
    });

    test('does not add more columns after row addition', () => {
        let relation = new Relation("Test");

        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("Second", "string")).toBeTruthy();
        expect(relation.addColumn("Third", "number")).toBeTruthy();

        let rowOne = new Row(relation.getColumns());
        expect(rowOne.isFinished()).toBeFalsy();
        expect(relation.addRow(rowOne)).toBeTruthy();
        expect(rowOne.isFinished()).toBeTruthy();
        expect(relation.hasFinishedSchema()).toBeTruthy();

        expect(relation.addColumn("Forth", "number")).toBeFalsy();
    });
});

describe('addRow', () => {
    test('adds rows with valid columns successfully', () => {
        let relation = new Relation("Test");

        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("Second", "string")).toBeTruthy();
        expect(relation.addColumn("Third", "number")).toBeTruthy();

        let rowOne = new Row(relation.getColumns());
        expect(rowOne.isFinished()).toBeFalsy();
        expect(relation.addRow(rowOne)).toBeTruthy();
        expect(rowOne.isFinished()).toBeTruthy();
        expect(relation.hasFinishedSchema()).toBeTruthy();

        let rowTwo = new Row(relation.getColumns());
        rowTwo.addValue("First", "Some value");
        rowTwo.addValue("Second", "Another value");
        rowTwo.addValue("Third", 462020);
        expect(rowTwo.isFinished()).toBeFalsy();
        expect(relation.addRow(rowTwo)).toBeTruthy();
        expect(rowTwo.isFinished()).toBeTruthy();
        expect(relation.hasFinishedSchema()).toBeTruthy();
    });

    test('does not add rows with invalid columns', () => {
        let relation = new Relation("Test");

        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("Second", "string")).toBeTruthy();
        expect(relation.addColumn("Third", "number")).toBeTruthy();

        let tooFew = new Map<string, SupportedColumnType>();
        tooFew.set("First", "string");
        tooFew.set("Second", "string");
        let rowOne = new Row(tooFew);
        expect(rowOne.isFinished()).toBeFalsy();
        expect(relation.addRow(rowOne)).toBeFalsy();
        expect(rowOne.isFinished()).toBeFalsy();      // should stay unfinished

        let tooMany = new Map<string, SupportedColumnType>();
        tooMany.set("First", "string");
        tooMany.set("Second", "string");
        tooMany.set("Third", "number");
        tooMany.set("Forth", "number");
        let rowTwo = new Row(tooMany);
        expect(rowTwo.isFinished()).toBeFalsy();
        expect(relation.addRow(rowTwo)).toBeFalsy();
        expect(rowTwo.isFinished()).toBeFalsy();

        let differentTypes = new Map<string, SupportedColumnType>();
        differentTypes.set("First", "string");
        differentTypes.set("Second", "number");    // 'Second' is of string type in relation definition
        differentTypes.set("Third", "number");
        let rowThree = new Row(differentTypes);
        expect(rowThree.isFinished()).toBeFalsy();
        expect(relation.addRow(rowThree)).toBeFalsy();
        expect(rowThree.isFinished()).toBeFalsy();
    });

    test('duplicit rows stored only once in a relation', () => {
        let relation = new Relation("Test");

        expect(relation.addColumn("First", "string")).toBeTruthy();
        expect(relation.addColumn("Second", "string")).toBeTruthy();
        expect(relation.addColumn("Third", "number")).toBeTruthy();

        let rowOne = new Row(relation.getColumns());
        rowOne.addValue("First", "Some value");
        rowOne.addValue("Second", "Another value");
        rowOne.addValue("Third", 462020);
        expect(rowOne.isFinished()).toBeFalsy();
        expect(relation.addRow(rowOne)).toBeTruthy();
        expect(rowOne.isFinished()).toBeTruthy();
        expect(relation.hasFinishedSchema()).toBeTruthy();
        expect(relation.getRows().length).toBe(1);

        let rowTwo = new Row(relation.getColumns());
        rowTwo.addValue("First", "Some value");
        rowTwo.addValue("Second", "Another value");
        rowTwo.addValue("Third", 462020);
        expect(rowTwo.isFinished()).toBeFalsy();
        expect(relation.addRow(rowTwo)).toBeTruthy();
        expect(rowTwo.isFinished()).toBeTruthy();
        expect(relation.hasFinishedSchema()).toBeTruthy();
        expect(relation.getRows().length).toBe(1);    // still size 1
    });
});