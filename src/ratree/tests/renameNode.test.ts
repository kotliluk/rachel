import Relation from "../../relation/relation";
import Row from "../../relation/row";
import RelationNode from "../relationNode";
import RenameNode from "../renameNode";
import {IndexedString} from "../../types/indexedString";

const sourceRelationOne: Relation = new Relation("Auto");
sourceRelationOne.addColumn("Id", "number");
sourceRelationOne.addColumn("Majitel", "number");
sourceRelationOne.addColumn("Kola", "number");
sourceRelationOne.addColumn("Motor", "string");
sourceRelationOne.addColumn("Vyrobce", "string");
sourceRelationOne.addColumn("Barva", "string");
const s1a: Row = new Row(sourceRelationOne.getColumns());
s1a.addValue("Id", 1);
s1a.addValue("Majitel", 1);
s1a.addValue("Kola", 4);
s1a.addValue("Motor", "Motor V4");
s1a.addValue("Vyrobce", "Skoda");
s1a.addValue("Barva", "Modra");
sourceRelationOne.addRow(s1a);
const sourceOne: RelationNode = new RelationNode(sourceRelationOne);

describe('eval', () => {
    describe('renames valid rename correctly', () => {
        test('< Kola -> PocetKol >', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol >");
            const expected: Relation = new Relation("Auto<...>");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("PocetKol", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("Id", 1);
            e1a.addValue("Majitel", 1);
            e1a.addValue("PocetKol", 4);
            e1a.addValue("Motor", "Motor V4");
            e1a.addValue("Vyrobce", "Skoda");
            e1a.addValue("Barva", "Modra");
            expected.addRow(e1a);

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('< Kola -> PocetKol, Motor -> TypMotoru, Majitel -> MajitelId >', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol, Motor -> TypMotoru, Majitel -> MajitelId >");
            const expected: Relation = new Relation("Auto<...>");
            expected.addColumn("Id", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("PocetKol", "number");
            expected.addColumn("TypMotoru", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const e2a: Row = new Row(expected.getColumns());
            e2a.addValue("Id", 1);
            e2a.addValue("MajitelId", 1);
            e2a.addValue("PocetKol", 4);
            e2a.addValue("TypMotoru", "Motor V4");
            e2a.addValue("Vyrobce", "Skoda");
            e2a.addValue("Barva", "Modra");
            expected.addRow(e2a);

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });
    });

    describe('fails when duplicit name', () => {
        test('< Motor -> Vyrobce > makes duplicit column Vyrobce', () => {
            const str: IndexedString = IndexedString.new("< Motor -> Vyrobce >");

            const node: RenameNode = new RenameNode(str, sourceOne);
            expect(() => node.getResult()).toThrow();
        });
    });

    describe('fails when absent source column', () => {
        test('< Moto -> Vyrobce >, Moto is absent', () => {
            const str: IndexedString = IndexedString.new("< Moto -> Vyrobce >");

            const node: RenameNode = new RenameNode(str, sourceOne);
            expect(() => node.getResult()).toThrow();
        });
    });

    describe('fails when invalid rename string', () => {
        test('< Kola => PocetKol >', () => {
            const str: IndexedString = IndexedString.new("< Kola => PocetKol >");

            const node: RenameNode = new RenameNode(str, sourceOne);
            expect(() => node.getResult()).toThrow();
        });

        test('< null -> Vyrobce >, null is a keyword', () => {
            const str: IndexedString = IndexedString.new("< null -> Vyrobce >");

            const node: RenameNode = new RenameNode(str, sourceOne);
            expect(() => node.getResult()).toThrow();
        });

        test('< Motor -> false >, false is a keyword', () => {
            const str: IndexedString = IndexedString.new("< Motor -> false >");

            const node: RenameNode = new RenameNode(str, sourceOne);
            expect(() => node.getResult()).toThrow();
        });
    });
});

describe('fakeEval' , () => {
    describe('creates correct schema' , () => {
        test('cursor not in subtree nor rename - valid renames: < Kola -> PocetKol, Motor -> TypMotoru >', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol, Motor -> TypMotoru >", 10);
            const expected: Relation = new Relation("Auto<...>");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("PocetKol", "number");
            expected.addColumn("TypMotoru", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });

        test('cursor not in subtree nor projection - one valid rename: < Kola -> PocetKol, Motor -> null >', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol, Motor -> null >", 10);
            const expected: Relation = new Relation("Auto<...>");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("PocetKol", "number");
            expected.addColumn("Motor", "string");      // invalid rename is not applied
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });

        test('cursor not in subtree nor projection - no valid rename: < Kolaa -> PocetKol, Motor -> null >', () => {
            const str: IndexedString = IndexedString.new("< Kolaa -> PocetKol, Motor -> null >", 10);
            const expected: Relation = new Relation("Auto<...>");
            expected.addColumn("Id", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("Kola", "number");       // invalid rename is not applied
            expected.addColumn("Motor", "string");      // invalid rename is not applied
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
        });
    });

    describe('finds cursor correctly' , () => {
        test('cursor inside - left margin', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol >", 10);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.fakeEval(11);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('cursor outside - left margin', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol >", 10);

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.fakeEval(10);
            expect(actual.whispers.length).toBe(0);
        });

        test('cursor inside - before arrow', () => {
            const str: IndexedString = IndexedString.new("< Kola -> PocetKol >", 10);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);

            const node: RenameNode = new RenameNode(str, sourceOne);
            const actual = node.fakeEval(17);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });

    describe('passes found whispers' , () => {
        test('< Kola -> PocetKol >< Should -> Not, Care -> >', () => {
            const strPrev: IndexedString = IndexedString.new("< Kola -> PocetKol >", 10);
            const str: IndexedString = IndexedString.new("< Should -> Not, Care -> >", 30);
            const expected: Set<string> = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);

            const nodePrev: RenameNode = new RenameNode(strPrev, sourceOne);
            const node: RenameNode = new RenameNode(str, nodePrev);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});