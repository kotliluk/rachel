import Relation from "../../relation/relation";
import Row from "../../relation/row";
import RelationNode from "../relationNode";
import CartesianProductNode from "../cartesianProductNode";
import {IndexedString} from "../../types/indexedString";
import SelectionNode from "../selectionNode";

describe('eval' , () => {
    describe('joins relations correctly', () => {
        test('2 relations with 1 row each', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("Majitel", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("Majitel", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);

            const right: Relation = new Relation("Majitel");
            right.addColumn("MajitelId", "number");
            right.addColumn("Jmeno", "string");
            right.addColumn("Prijmeni", "string");
            right.addColumn("Bydliste", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("MajitelId", 1);
            r1a.addValue("Jmeno", "Lukas");
            r1a.addValue("Prijmeni", "Kotlik");
            r1a.addValue("Bydliste", "Praha, CR");
            right.addRow(r1a);

            const expected: Relation = new Relation("(Auto\u2a2fMajitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("AutoId", 1);
            e1a.addValue("Majitel", 1);
            e1a.addValue("Kola", 4);
            e1a.addValue("Motor", "Motor V4");
            e1a.addValue("Vyrobce", "Skoda");
            e1a.addValue("Barva", "Modra");
            e1a.addValue("MajitelId", 1);
            e1a.addValue("Jmeno", "Lukas");
            e1a.addValue("Prijmeni", "Kotlik");
            e1a.addValue("Bydliste", "Praha, CR");
            expected.addRow(e1a);

            const node: CartesianProductNode = new CartesianProductNode(new RelationNode(left), new RelationNode(right));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('2 relations with 2 rows each', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("Majitel", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("Majitel", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);
            const l1b: Row = new Row(left.getColumns());
            l1b.addValue("AutoId", 2);
            l1b.addValue("Majitel", 2);
            l1b.addValue("Kola", 8);
            l1b.addValue("Motor", "Motor V16");
            l1b.addValue("Vyrobce", "Tatra");
            l1b.addValue("Barva", "Modra");
            left.addRow(l1b);

            const right: Relation = new Relation("Majitel");
            right.addColumn("MajitelId", "number");
            right.addColumn("Jmeno", "string");
            right.addColumn("Prijmeni", "string");
            right.addColumn("Bydliste", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("MajitelId", 1);
            r1a.addValue("Jmeno", "Lukas");
            r1a.addValue("Prijmeni", "Kotlik");
            r1a.addValue("Bydliste", "Praha, CR");
            right.addRow(r1a);
            const r1b: Row = new Row(right.getColumns());
            r1b.addValue("MajitelId", 2);
            r1b.addValue("Jmeno", "Pepa");
            r1b.addValue("Prijmeni", "Ridic");
            r1b.addValue("Bydliste", "Velke Mezirici");
            right.addRow(r1b);

            const expected: Relation = new Relation("(Auto\u2a2fMajitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("AutoId", 1);
            e1a.addValue("Majitel", 1);
            e1a.addValue("Kola", 4);
            e1a.addValue("Motor", "Motor V4");
            e1a.addValue("Vyrobce", "Skoda");
            e1a.addValue("Barva", "Modra");
            e1a.addValue("MajitelId", 1);
            e1a.addValue("Jmeno", "Lukas");
            e1a.addValue("Prijmeni", "Kotlik");
            e1a.addValue("Bydliste", "Praha, CR");
            expected.addRow(e1a);
            const e1b: Row = new Row(expected.getColumns());
            e1b.addValue("AutoId", 1);
            e1b.addValue("Majitel", 1);
            e1b.addValue("Kola", 4);
            e1b.addValue("Motor", "Motor V4");
            e1b.addValue("Vyrobce", "Skoda");
            e1b.addValue("Barva", "Modra");
            e1b.addValue("MajitelId", 2);
            e1b.addValue("Jmeno", "Pepa");
            e1b.addValue("Prijmeni", "Ridic");
            e1b.addValue("Bydliste", "Velke Mezirici");
            expected.addRow(e1b);
            const e1c: Row = new Row(expected.getColumns());
            e1c.addValue("AutoId", 2);
            e1c.addValue("Majitel", 2);
            e1c.addValue("Kola", 8);
            e1c.addValue("Motor", "Motor V16");
            e1c.addValue("Vyrobce", "Tatra");
            e1c.addValue("Barva", "Modra");
            e1c.addValue("MajitelId", 1);
            e1c.addValue("Jmeno", "Lukas");
            e1c.addValue("Prijmeni", "Kotlik");
            e1c.addValue("Bydliste", "Praha, CR");
            expected.addRow(e1c);
            const e1d: Row = new Row(expected.getColumns());
            e1d.addValue("AutoId", 2);
            e1d.addValue("Majitel", 2);
            e1d.addValue("Kola", 8);
            e1d.addValue("Motor", "Motor V16");
            e1d.addValue("Vyrobce", "Tatra");
            e1d.addValue("Barva", "Modra");
            e1d.addValue("MajitelId", 2);
            e1d.addValue("Jmeno", "Pepa");
            e1d.addValue("Prijmeni", "Ridic");
            e1d.addValue("Bydliste", "Velke Mezirici");
            expected.addRow(e1d);

            const node: CartesianProductNode = new CartesianProductNode(new RelationNode(left), new RelationNode(right));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });
    });

    describe('fails when relations have common column', () => {
        test('common Id column', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("Id", "number");
            left.addColumn("Majitel", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("Id", 1);
            l1a.addValue("Majitel", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);

            const right: Relation = new Relation("Majitel");
            right.addColumn("Id", "number");
            right.addColumn("Jmeno", "string");
            right.addColumn("Prijmeni", "string");
            right.addColumn("Bydliste", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("Id", 1);
            r1a.addValue("Jmeno", "Lukas");
            r1a.addValue("Prijmeni", "Kotlik");
            r1a.addValue("Bydliste", "Praha, CR");
            right.addRow(r1a);

            const node: CartesianProductNode = new CartesianProductNode(new RelationNode(left), new RelationNode(right));
            expect(() => node.getResult()).toThrow();
        });
    });
});

const leftRelation: Relation = new Relation("LAuto");
leftRelation.addColumn("LId", "number");
leftRelation.addColumn("LMajitel", "string");
leftRelation.addColumn("LKola", "number");
const leftRowA: Row = new Row(leftRelation.getColumns());
leftRowA.addValue("LId", 1);
leftRowA.addValue("LMajitel", "Lukas Left");
leftRowA.addValue("LKola", 4);
leftRelation.addRow(leftRowA);
const leftRowB: Row = new Row(leftRelation.getColumns());
leftRowB.addValue("LId", 2);
leftRowB.addValue("LMajitel", "Lukas Left");
leftRowB.addValue("LKola", 2);
leftRelation.addRow(leftRowB);
const leftRowC: Row = new Row(leftRelation.getColumns());
leftRowC.addValue("LId", 3);
leftRowC.addValue("LMajitel", "Pepa Left");
leftRowC.addValue("LKola", 8);
leftRelation.addRow(leftRowC);
const leftSource: RelationNode = new RelationNode(leftRelation);

const rightRelation: Relation = new Relation("RAuto");
rightRelation.addColumn("RId", "number");
rightRelation.addColumn("RMajitel", "string");
rightRelation.addColumn("RKola", "number");
const rightRowA: Row = new Row(rightRelation.getColumns());
rightRowA.addValue("RId", 1);
rightRowA.addValue("RMajitel", "Lukas Right");
rightRowA.addValue("RKola", 4);
rightRelation.addRow(rightRowA);
const rightRowB: Row = new Row(rightRelation.getColumns());
rightRowB.addValue("RId", 2);
rightRowB.addValue("RMajitel", "Lukas Right");
rightRowB.addValue("RKola", 2);
rightRelation.addRow(rightRowB);
const rightRowC: Row = new Row(rightRelation.getColumns());
rightRowC.addValue("RId", 3);
rightRowC.addValue("RMajitel", "Pepa Right");
rightRowC.addValue("RKola", 8);
rightRelation.addRow(rightRowC);
const rightSource: RelationNode = new RelationNode(rightRelation);

describe('fakeEval' , () => {
    test('creates correct schema when cursor not in subtrees', () => {
        // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
        const left: Relation = new Relation("Auto");
        left.addColumn("AutoId", "number");
        left.addColumn("MajitelId", "number");
        left.addColumn("Kola", "number");
        left.addColumn("Motor", "string");
        const lefta: Row = new Row(left.getColumns());
        lefta.addValue("AutoId", 1);
        lefta.addValue("MajitelId", 1);
        lefta.addValue("Kola", 4);
        lefta.addValue("Motor", "Motor V4");
        left.addRow(lefta);

        const right: Relation = new Relation("Majitel");
        right.addColumn("MajitelId", "number");
        right.addColumn("Jmeno", "string");
        right.addColumn("Prijmeni", "string");
        const righta: Row = new Row(right.getColumns());
        righta.addValue("MajitelId", 1);
        righta.addValue("Jmeno", "Lukas");
        righta.addValue("Prijmeni", "Kotlik");
        right.addRow(righta);

        const expected: Relation = new Relation("");
        expected.addColumn("AutoId", "number");
        expected.addColumn("Kola", "number");
        expected.addColumn("Motor", "string");
        expected.addColumn("MajitelId", "number");
        expected.addColumn("Jmeno", "string");
        expected.addColumn("Prijmeni", "string");

        const node: CartesianProductNode = new CartesianProductNode(new RelationNode(left), new RelationNode(right));
        const actual = node.fakeEval(-5);
        expect(expected.equals(actual.result)).toBeTruthy();
        expect(actual.whispers.length).toBe(0);
    });

    describe('passes found whispers' , () => {
        test('from left: LAuto(LId == 1)\u2a2fRAuto', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 10);
            const expected: Set<string> = new Set(["LId", "LMajitel", "LKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true);
            const node: CartesianProductNode = new CartesianProductNode(nodePrev, rightSource);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('from right: LAuto\u2a2fRAuto(RId == 1)', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 20);
            const expected: Set<string> = new Set(["RId", "RMajitel", "RKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true);
            const node: CartesianProductNode = new CartesianProductNode(leftSource, nodePrev);
            const actual = node.fakeEval(25);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});
