import Relation from "../../relation/relation";
import Row from "../../relation/row";
import RelationNode from "../relationNode";
import SelectionNode from "../selectionNode";
import {IndexedString} from "../../tools/indexedString";

const source: Relation = new Relation("Auto");
source.addColumn("Id", "number");
source.addColumn("Majitel", "string");
source.addColumn("Kola", "number");
const s1a: Row = new Row(source.getColumns());
s1a.addValue("Id", 1);
s1a.addValue("Majitel", "\"Lukas\"");
s1a.addValue("Kola", 4);
source.addRow(s1a);
const s1b: Row = new Row(source.getColumns());
s1b.addValue("Id", 2);
s1b.addValue("Majitel", "\"Lukas\"");
s1b.addValue("Kola", 4);
source.addRow(s1b);
const s1c: Row = new Row(source.getColumns());
s1c.addValue("Id", 3);
s1c.addValue("Majitel", "\"Pepa\"");
s1c.addValue("Kola", 4);
source.addRow(s1c);

describe('eval', () => {
    describe('selects rows correctly', () => {
        test('(Id == 1)', () => {
            const expr: string = "(Id == 1)";
            const expected: Relation = new Relation("Auto(...)");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "string");
            expected.addColumn("Kola", "number");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("Id", 1);
            e1a.addValue("Majitel", "\"Lukas\"");
            e1a.addValue("Kola", 4);
            expected.addRow(e1a);

            const node1: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node1.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('(Id != 1 + 0 && Majitel == "Lukas")', () => {
            const expr: string = "(Id != 1 && Majitel == \"Lukas\")";
            const expected: Relation = new Relation("Auto(...)");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "string");
            expected.addColumn("Kola", "number");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("Id", 2);
            e1a.addValue("Majitel", "\"Lukas\"");
            e1a.addValue("Kola", 4);
            expected.addRow(e1a);

            const node1: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const result = node1.getResult();
            expect(expected.equals(result)).toBeTruthy();
        });
    });

    describe('throws when absent column', () => {
        test('(AutoId == 1)', () => {
            const expr: string = "(AutoId == 1)";

            const selectionNode: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            expect(() => selectionNode.getResult()).toThrow();
        });
    });

    describe('throws when condition result is not boolean', () => {
        test('(1 + 1)', () => {
            const expr: string = "(1 + 1)";

            const selectionNode: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            expect(() => selectionNode.getResult()).toThrow();
        });
    });

    describe('throws when condition whitespaces only', () => {
        test('( )', () => {
            const expr: string = "( )";

            const selectionNode: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            expect(() => selectionNode.getResult()).toThrow();
        });
    });

    describe('throws when invalid condition', () => {
        test('(1 + + 2 < 5)', () => {
            const expr: string = "(1 + + 2 < 5)";

            const selectionNode: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            expect(() => selectionNode.getResult()).toThrow();
        });
    });
});

describe('fakeEval' , () => {
    describe('creates correct schema' , () => {
        test('cursor not in subtree nor projection - valid condition: (Id == 1)', () => {
            const expr: IndexedString = IndexedString.new("(Id == 1)", 10);
            const expected: Relation = new Relation("Auto(...)");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "string");
            expected.addColumn("Kola", "number");

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });

        test('cursor not in subtree nor projection - empty condition: ()', () => {
            const expr: IndexedString = IndexedString.new("()", 10);
            const expected: Relation = new Relation("Auto(...)");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "string");
            expected.addColumn("Kola", "number");

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });

        test('cursor not in subtree nor projection - invalid condition: (1 +)', () => {
            const expr: IndexedString = IndexedString.new("(1 +)", 10);
            const expected: Relation = new Relation("Auto(...)");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "string");
            expected.addColumn("Kola", "number");

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });
    });

    describe('finds cursor correctly' , () => {
        test('cursor inside - left margin', () => {
            const expr: IndexedString = IndexedString.new("(Id == 1)", 10);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola"]);

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(11);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('cursor outside - left margin', () => {
            const expr: IndexedString = IndexedString.new("(Id == 1)", 10);

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(10);
            expect(actual.whispers.length).toBe(0);
        });

        test('cursor inside - right margin', () => {
            const expr: IndexedString = IndexedString.new("(Id == 1)", 10);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola"]);

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(18);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('cursor outside - right margin', () => {
            const expr: IndexedString = IndexedString.new("(Id == 1)", 10);

            const node: SelectionNode = new SelectionNode(expr, new RelationNode(source), true);
            const actual = node.fakeEval(19);
            expect(actual.whispers.length).toBe(0);
        });
    });

    describe('passes found whispers' , () => {
        test('(Id == 1)(true)', () => {
            const exprPrev: IndexedString = IndexedString.new("(Id == 1)", 10);
            const expr: IndexedString = IndexedString.new("(true)", 19);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, new RelationNode(source), true);
            const node: SelectionNode = new SelectionNode(expr, nodePrev, true);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});