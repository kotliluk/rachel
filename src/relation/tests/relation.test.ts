import {Relation} from "../relation";
import {Row} from "../row";
import {SupportedColumnType} from "../columnType";


/**
 * Initialized to Relation with two columns: First (string) and Second (number)
 */
let relation: Relation = new Relation("Test");

beforeEach(() => {
    relation = new Relation("Test");
    relation.addColumn("First", "string");
    relation.addColumn("Second", "number");
})

describe('addColumn', () => {
    test('adding columns should not finish the schema', () => {
        // assert
        expect(relation.hasFinishedSchema()).toBeFalsy();
    });

    test('adds columns with different names successfully', () => {
        // assert
        const columns = [...relation.getColumns()];
        expect(columns)
          .toHaveLength(2)
          .toContainStrict(["First", "string"])
          .toContainStrict(["Second", "number"]);
    });

    test('does not add columns with a duplicit name', () => {
        // act - there already is a First column in initialized relation
        relation.addColumn("First", "number");
        // assert
        const columns = [...relation.getColumns()]
        expect(columns)
          .toHaveLength(2)
          .toContainStrict(["First", "string"]);
    });

    test('does not add more columns after row addition', () => {
        // arrange
        relation.addRow(new Row(relation.getColumns()));
        // act
        relation.addColumn("Third", "number");
        // assert
        const columns = [...relation.getColumns()]
        expect(columns)
          .toHaveLength(2)
          .toContainStrict(["First", "string"])
          .toContainStrict(["Second", "number"])
          .not.toContainStrict(["Third", "number"]);
    });
});

describe('addRow', () => {
    test('finishes row after addition', () => {
        // act
        const row = new Row(relation.getColumns());
        relation.addRow(row);
        // assert
        expect(row.isFinished()).toBeTruthy();
    });

    test('finishes relation after addition', () => {
        // act
        const row = new Row(relation.getColumns());
        relation.addRow(row);
        // assert
        expect(relation.hasFinishedSchema()).toBeTruthy();
    });

    test('adds rows with valid columns successfully', () => {
        // arrange - creates two different rows
        const row1 = new Row(relation.getColumns());
        row1.addValue("First", "one");
        const row2 = new Row(relation.getColumns());
        row2.addValue("First", "two");
        // act
        relation.addRow(row1);
        relation.addRow(row2);
        // assert
        expect(relation.getRowsCount()).toBe(2);
    });

    describe('does not add rows with invalid columns', () => {
        test('too few columns', () => {
            // arrange
            const tooFew = new Map<string, SupportedColumnType>([["First", "string"]]);
            const row = new Row(tooFew);
            // act
            relation.addRow(row);
            // assert
            expect(relation.getRowsCount()).toBe(0);
            expect(row.isFinished()).toBeFalsy();
        });

        test('too many columns', () => {
            // arrange
            const tooMany = new Map<string, SupportedColumnType>([
                ["First", "string"], ["Second", "number"], ["Third", "boolean"]
            ]);
            const row = new Row(tooMany);
            // act
            relation.addRow(row);
            // assert
            expect(relation.getRowsCount()).toBe(0);
            expect(row.isFinished()).toBeFalsy();
        });

        test('different columns (types)', () => {
            // arrange
            const differentTypes = new Map<string, SupportedColumnType>([["First", "number"], ["Second", "number"]]);
            const row = new Row(differentTypes);
            // act
            relation.addRow(row);
            // assert
            expect(relation.getRowsCount()).toBe(0);
            expect(row.isFinished()).toBeFalsy();
        });
    });

    test('duplicit rows stored only once in a relation', () => {
        // arrange
        const rowOne = new Row(relation.getColumns());
        rowOne.addValue("First", "Some value");
        rowOne.addValue("Second", 5);
        const rowTwo = new Row(relation.getColumns());
        rowTwo.addValue("First", "Some value");
        rowTwo.addValue("Second", 5);
        // act
        relation.addRow(rowOne);
        relation.addRow(rowTwo);
        // assert
        expect(relation.getRowsCount()).toBe(1);    // still size 1
    });
});
