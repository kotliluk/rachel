import Relation from "../../relation/relation";
import Row from "../../relation/row";
import ProjectionNode from "../projectionNode";
import RelationNode from "../relationNode";
import {IndexedString} from "../../types/indexedString";

const sourceRelation: Relation = new Relation("Auto");
sourceRelation.addColumn("Id", "number");
sourceRelation.addColumn("Majitel", "number");
sourceRelation.addColumn("Kola", "number");
sourceRelation.addColumn("Motor", "string");
sourceRelation.addColumn("Vyrobce", "string");
sourceRelation.addColumn("Barva", "string");
const s1a: Row = new Row(sourceRelation.getColumns());
s1a.addValue("Id", 1);
s1a.addValue("Majitel", 1);
s1a.addValue("Kola", 4);
s1a.addValue("Motor", "Motor V4");
s1a.addValue("Vyrobce", "Skoda");
s1a.addValue("Barva", "Modra");
sourceRelation.addRow(s1a);
const sourceNode: RelationNode = new RelationNode(sourceRelation);

describe('eval' , () => {
    test('projects valid columns correctly: [Kola, Id]', () => {
        const str: IndexedString = IndexedString.new("[Kola, Id]");
        const expected: Relation = new Relation("Auto[...]");
        expected.addColumn("Id", "number");
        expected.addColumn("Kola", "number")
        const e1a: Row = new Row(expected.getColumns());
        e1a.addValue("Id", 1);
        e1a.addValue("Kola", 4);
        expected.addRow(e1a);

        const node: ProjectionNode = new ProjectionNode(str, sourceNode);
        const actual = node.getResult();
        expect(expected.equals(actual)).toBeTruthy();
    });

    test('fails when absent column: [Radio]', () => {
        const str: IndexedString = IndexedString.new("[Radio]");

        const node: ProjectionNode = new ProjectionNode(str, sourceNode);
        expect(() => node.getResult()).toThrow();
    });

    test('fails when invalid column name: [3three]', () => {
        const str: IndexedString = IndexedString.new("[3three]");

        const node: ProjectionNode = new ProjectionNode(str, sourceNode);
        expect(() => node.getResult()).toThrow();
    });
});

describe('fakeEval' , () => {
    describe('creates correct schema' , () => {
        test('cursor not in subtree nor projection - valid projection: [Kola, Id]', () => {
            const str: IndexedString = IndexedString.new("[Kola, Id]", 10);
            const expected: Relation = new Relation("Auto[...]");
            expected.addColumn("Id", "number");
            expected.addColumn("Kola", "number");

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });

        test('cursor not in subtree nor projection - one absent column: [Kola, Absent]', () => {
            const str: IndexedString = IndexedString.new("[Kola, Absent]", 10);
            const expected: Relation = new Relation("Auto[...]");
            expected.addColumn("Kola", "number");

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });

        test('cursor not in subtree nor projection - all absent columns: [Absent1, Absent2]', () => {
            const str: IndexedString = IndexedString.new("[Absent1, Absent2]", 10);
            const expected: Relation = new Relation("Auto[...]");

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });
    });

    describe('finds cursor correctly' , () => {
        test('cursor inside - left margin', () => {
            const str: IndexedString = IndexedString.new("[Kola, Id]", 10);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(11);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('cursor outside - left margin', () => {
            const str: IndexedString = IndexedString.new("[Kola, Id]", 10);

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(10);
            expect(actual.whispers.length).toBe(0);
        });

        test('cursor inside - right margin', () => {
            const str: IndexedString = IndexedString.new("[Kola, Id]", 10);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(19);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('cursor outside - right margin', () => {
            const str: IndexedString = IndexedString.new("[Kola, Id]", 10);

            const node: ProjectionNode = new ProjectionNode(str, sourceNode);
            const actual = node.fakeEval(20);
            expect(actual.whispers.length).toBe(0);
        });
    });

    describe('passes found whispers' , () => {
        test('[Kola, Id][Should, Not, Care]', () => {
            const strPrev: IndexedString = IndexedString.new("[Kola, Id]", 10);
            const str: IndexedString = IndexedString.new("[Should, Not, Care]", 20);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);

            const nodePrev: ProjectionNode = new ProjectionNode(strPrev, sourceNode);
            const node: ProjectionNode = new ProjectionNode(str, nodePrev);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});