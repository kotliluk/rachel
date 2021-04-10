import Relation from "../../relation/relation";
import Row from "../../relation/row";
import RelationNode from "../relationNode";
import DivisionNode from "../divisionNode";
import {IndexedString} from "../../types/indexedString";
import SelectionNode from "../selectionNode";

describe('eval' , () => {
    describe('joins relations correctly', () => {
        test('test 1', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("MajitelId", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("Kola", 4);
            r1a.addValue("Motor", "Motor V4");
            r1a.addValue("Vyrobce", "Skoda");
            r1a.addValue("Barva", "Modra");
            right.addRow(r1a);

            const expected: Relation = new Relation("(Auto\u00f7Auto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("AutoId", 1);
            e1a.addValue("MajitelId", 1);
            expected.addRow(e1a);

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('test 2', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);
            const l1b: Row = new Row(left.getColumns());
            l1b.addValue("Kola", 4);
            l1b.addValue("Motor", "Motor V16");
            l1b.addValue("Vyrobce", "Tatra");
            l1b.addValue("Barva", "Modra");
            left.addRow(l1b);
            const l1c: Row = new Row(left.getColumns());
            l1c.addValue("Kola", 6);
            l1c.addValue("Motor", "Motor V8");
            l1c.addValue("Vyrobce", "Tatra");
            l1c.addValue("Barva", "Cervena");
            left.addRow(l1c);
            const l1d: Row = new Row(left.getColumns());
            l1d.addValue("Kola", 6);
            l1d.addValue("Motor", "Motor V8");
            l1d.addValue("Vyrobce", "Tatra");
            l1d.addValue("Barva", "Cervena");
            left.addRow(l1d);

            const right: Relation = new Relation("Auto");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("Motor", "Motor V4");
            r1a.addValue("Vyrobce", "Skoda");
            r1a.addValue("Barva", "Modra");
            right.addRow(r1a);
            const r1b: Row = new Row(right.getColumns());
            r1b.addValue("Motor", "Motor V16");
            r1b.addValue("Vyrobce", "Tatra");
            r1b.addValue("Barva", "Modra");
            right.addRow(r1b);

            const expected: Relation = new Relation("(Auto\u00f7Auto)");
            expected.addColumn("Kola", "number");
            const e1a: Row = new Row(expected.getColumns());
            e1a.addValue("Kola", 4);
            expected.addRow(e1a);

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('test 3', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const r1a: Row = new Row(right.getColumns());
            l1a.addValue("Kola", 8);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            right.addRow(r1a);

            const expected: Relation = new Relation("(Auto\u00f7Auto)");
            expected.addColumn("AutoId", "number");

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });
    });

    describe('fails when invalid schemas', () => {
        test('right relation has an extra column', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("MajitelId", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            right.addColumn("Extra", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("Kola", 4);
            r1a.addValue("Motor", "Motor V4");
            r1a.addValue("Vyrobce", "Skoda");
            r1a.addValue("Barva", "Modra");
            r1a.addValue("Extra", "Extra");
            right.addRow(r1a);

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            expect(() => node.getResult()).toThrow();
        });

        test('left relation does not have an extra column', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            l1a.addValue("Vyrobce", "Skoda");
            l1a.addValue("Barva", "Modra");
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("Kola", 4);
            r1a.addValue("Motor", "Motor V4");
            r1a.addValue("Vyrobce", "Skoda");
            r1a.addValue("Barva", "Modra");
            right.addRow(r1a);

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
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
    describe('creates correct schema' , () => {
        test('cursor not in subtrees - valid source columns', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("MajitelId", 1);
            l1a.addValue("Kola", 4);
            l1a.addValue("Motor", "Motor V4");
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("Kola", 4);
            r1a.addValue("Motor", "Motor V4");
            right.addRow(r1a);

            const expected: Relation = new Relation("(Auto\u00f7Auto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
            expect(actual.whispers.length).toBe(0);
            expect(actual.errors.length).toBe(0);
        });

        test('cursor not in subtrees - right is not proper subset (returns no whispers and 1 error)', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("MajitelId", 1);
            l1a.addValue("Kola", 4);
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("AutoId", 1);
            r1a.addValue("MajitelId", 1);
            r1a.addValue("Kola", 4);
            right.addRow(r1a);

            const expected: Relation = new Relation("(Auto\u00f7Auto)");

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
            expect(actual.whispers.length).toBe(0);
            expect(actual.errors.length).toBe(1);
        });

        test('cursor not in subtrees - right is not subset (returns no whispers and 1 error)', () => {
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            const l1a: Row = new Row(left.getColumns());
            l1a.addValue("AutoId", 1);
            l1a.addValue("MajitelId", 1);
            left.addRow(l1a);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MId", "number");
            right.addColumn("Kola", "number");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("AutoId", 1);
            r1a.addValue("MId", 1);
            r1a.addValue("Kola", 4);
            right.addRow(r1a);

            const expected: Relation = new Relation("(Auto\u00f7Auto)");
            expected.addColumn("MajitelId", "number");

            const node: DivisionNode = new DivisionNode(new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.fakeEval(-5);
            expect(expected.equals(actual.result)).toBeTruthy();
            expect(actual.whispers.length).toBe(0);
            expect(actual.errors.length).toBe(1);
        });
    });

    describe('passes found whispers' , () => {
        test('from left: LAuto(LId == 1)\u00f7RAuto', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 10);
            const expected: Set<string> = new Set(["LId", "LMajitel", "LKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true);
            const node: DivisionNode = new DivisionNode(nodePrev, rightSource, undefined);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('from right: LAuto\u00f7RAuto(RId == 1)', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 20);
            const expected: Set<string> = new Set(["RId", "RMajitel", "RKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true);
            const node: DivisionNode = new DivisionNode(leftSource, nodePrev, undefined);
            const actual = node.fakeEval(25);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});
