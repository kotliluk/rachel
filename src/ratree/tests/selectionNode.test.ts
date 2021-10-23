import {Relation} from "../../relation/relation";
import {Row} from "../../relation/row";
import {RelationNode} from "../relationNode";
import {SelectionNode} from "../selectionNode";
import {IndexedString} from "../../types/indexedString";
import {createRelation} from "./common";


const getSourceNode = (): RelationNode => {
    const source: Relation = new Relation("Auto");
    source.addColumn("Id", "number");
    source.addColumn("Majitel", "string");
    source.addColumn("Kola", "number");

    const s1a: Row = new Row(source.getColumns());
    s1a.addValue("Id", 1);
    s1a.addValue("Majitel", "Lukas");
    s1a.addValue("Kola", 4);
    source.addRow(s1a);
    const s1b: Row = new Row(source.getColumns());
    s1b.addValue("Id", 2);
    s1b.addValue("Majitel", "Lukas");
    s1b.addValue("Kola", 4);
    source.addRow(s1b);
    const s1c: Row = new Row(source.getColumns());
    s1c.addValue("Id", 3);
    s1c.addValue("Majitel", "Pepa");
    s1c.addValue("Kola", 4);
    source.addRow(s1c);

    return new RelationNode(source);
}


describe('eval', () => {
    describe('selects rows correctly', () => {
        test('(Id == 1)', () => {
            // arrange
            const expr: IndexedString = IndexedString.new("(Id == 1)");
            const expected = createRelation(
              "Auto(...)",
              [["Id", "number"], ["Majitel", "string"], ["Kola", "number"]],
              [ [["Id", 1], ["Majitel", "Lukas"], ["Kola", 4]] ],
            );
            const node: SelectionNode = new SelectionNode(expr, getSourceNode(), true);
            // act
            const actual = node.getResult();
            // assert
            expect(actual).toEqualTo(expected);
        });

        test('(Id != 1 + 0 && Majitel == "Lukas")', () => {
            // arrange
            const expr: IndexedString = IndexedString.new('(Id != 1 && Majitel == "Lukas")');
            const expected = createRelation(
              "Auto(...)",
              [["Id", "number"], ["Majitel", "string"], ["Kola", "number"]],
              [ [["Id", 2], ["Majitel", "Lukas"], ["Kola", 4]] ],
            );
            const node: SelectionNode = new SelectionNode(expr, getSourceNode(), true);
            // act
            const actual = node.getResult();
            // assert
            expect(actual).toEqualTo(expected);
        });
    });

    describe('throws when invalid expression', () => {

        const testInputs: IndexedString[] = [
            IndexedString.new("(Absent == 1)"),
            IndexedString.new("(1 + 1)"),
            IndexedString.new("( )"),
            IndexedString.new("(1 + + 2 < 5)"),
        ]

        test.each(testInputs)("%s", (expr) => {
            // arrange
            const selectionNode: SelectionNode = new SelectionNode(expr, getSourceNode(), true);
            // act + assert
            expect(() => selectionNode.getResult()).toThrow();
        });
    });
});

interface FakeEvalCorrectWhispersTestInput {
    cursorIndex: number
    expected: string[]
}

describe('fakeEval' , () => {
    describe('creates correct schema' , () => {
        const testInputs: IndexedString[] = [
            IndexedString.new("(Id == 1)", 10),
            IndexedString.new("()", 10),
            IndexedString.new("(1 +)", 10),
        ]

        test.each(testInputs)("%s", (str) => {
            // arrange
            const node = new SelectionNode(str, getSourceNode(), true);
            const expected = createRelation("Auto(...)", [["Id", "number"], ["Majitel", "string"], ["Kola", "number"]], []);
            // act
            const actual = node.fakeEval(-5);
            // assert
            expect(actual.result).toEqualTo(expected);
        });
    });

    describe('finds cursor correctly' , () => {
        const testInputs: FakeEvalCorrectWhispersTestInput[] = [
            { cursorIndex: 11, expected: ["Id", "Majitel", "Kola"] },
            { cursorIndex: 10, expected: [] },
            { cursorIndex: 18, expected: ["Id", "Majitel", "Kola"] },
            { cursorIndex: 19, expected: [] },
        ]

        test.each(testInputs)('%s', ({ cursorIndex, expected }) => {
            // arrange
            const expr = IndexedString.new("(Id == 1)", 10);
            const node = new SelectionNode(expr, getSourceNode(), true);
            // act
            const actual = node.fakeEval(cursorIndex);
            // assert
            expect(new Set(actual.whispers)).toStrictEqual(new Set(expected));
        });
    });

    describe('passes found whispers' , () => {
        test('(Id == 1)(true)', () => {
            // arrange
            const exprPrev: IndexedString = IndexedString.new("(Id == 1)", 10);
            const expr: IndexedString = IndexedString.new("(true)", 19);
            const nodePrev: SelectionNode = new SelectionNode(exprPrev, getSourceNode(), true);
            const node: SelectionNode = new SelectionNode(expr, nodePrev, true);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola"]);
            // act
            const actual = node.fakeEval(15);
            // assert
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});
