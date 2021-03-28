import Relation from "../../relation/relation";
import Row from "../../relation/row";
import RelationNode from "../relationNode";
import AntijoinNode, {AntijoinType} from "../antijoinNode";
import {IndexedString} from "../../tools/indexedString";
import SelectionNode from "../selectionNode";

describe('eval' , () => {
    describe('left antijoin', () => {
        describe('joins relations correctly', () => {
            test('1 Auto and 1 Majitel with common MajitelId = 1 -> natural join uses both, antijoin should return 0 rows', () => {
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

                const expected: Relation = new Relation("(Auto\u22b3Majitel)");
                expected.addColumn("AutoId", "number");
                expected.addColumn("Kola", "number");
                expected.addColumn("Motor", "string");
                expected.addColumn("Vyrobce", "string");
                expected.addColumn("Barva", "string");
                expected.addColumn("MajitelId", "number");

                const node: AntijoinNode = new AntijoinNode(AntijoinType.left, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });

            test('Majitel 1 with 2 Autos, Majitel 2 with 1 Autos, 1 Auto without a Majitel -> natural join does not use forth Auto, antijoin should return 1 row', () => {
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
                const l1b: Row = new Row(left.getColumns());
                l1b.addValue("AutoId", 2);
                l1b.addValue("MajitelId", 2);
                l1b.addValue("Kola", 8);
                l1b.addValue("Motor", "Motor V16");
                l1b.addValue("Vyrobce", "Tatra");
                l1b.addValue("Barva", "Modra");
                left.addRow(l1b);
                const l1c: Row = new Row(left.getColumns());
                l1c.addValue("AutoId", 3);
                l1c.addValue("MajitelId", 2);
                l1c.addValue("Kola", 6);
                l1c.addValue("Motor", "Motor V8");
                l1c.addValue("Vyrobce", "Tatra");
                l1c.addValue("Barva", "Cervena");
                left.addRow(l1c);
                const l1d: Row = new Row(left.getColumns());
                l1d.addValue("AutoId", 4);
                l1d.addValue("MajitelId", 3);   // Majitel with ID 3 does not exist
                l1d.addValue("Kola", 6);
                l1d.addValue("Motor", "Motor V8");
                l1d.addValue("Vyrobce", "Tatra");
                l1d.addValue("Barva", "Cervena");
                left.addRow(l1d);

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

                const expected: Relation = new Relation("(Auto\u22b3Majitel)");
                expected.addColumn("AutoId", "number");
                expected.addColumn("Kola", "number");
                expected.addColumn("Motor", "string");
                expected.addColumn("Vyrobce", "string");
                expected.addColumn("Barva", "string");
                expected.addColumn("MajitelId", "number");
                const e1a: Row = new Row(expected.getColumns());
                e1a.addValue("AutoId", 4);
                e1a.addValue("Kola", 6);
                e1a.addValue("Motor", "Motor V8");
                e1a.addValue("Vyrobce", "Tatra");
                e1a.addValue("Barva", "Cervena");
                e1a.addValue("MajitelId", 3);
                expected.addRow(e1a);

                const node: AntijoinNode = new AntijoinNode(AntijoinType.left, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });

            test('No common column -> Natural join uses both rows, antijoin should return 0 rows', () => {
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

                const expected: Relation = new Relation("(Auto\u22b3Majitel)");
                expected.addColumn("AutoId", "number");
                expected.addColumn("Majitel", "number");
                expected.addColumn("Kola", "number");
                expected.addColumn("Motor", "string");
                expected.addColumn("Vyrobce", "string");
                expected.addColumn("Barva", "string");

                const node: AntijoinNode = new AntijoinNode(AntijoinType.left, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });

            test('Common column MajitelId has different values in relations -> Natural join returns no row, antijoin should return 1 row', () => {
                const left: Relation = new Relation("Auto");
                left.addColumn("AutoId", "number");
                left.addColumn("MajitelId", "number");
                left.addColumn("Kola", "number");
                left.addColumn("Motor", "string");
                left.addColumn("Vyrobce", "string");
                left.addColumn("Barva", "string");
                const l1a: Row = new Row(left.getColumns());
                l1a.addValue("AutoId", 1);
                l1a.addValue("MajitelId", 2);
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

                const expected: Relation = new Relation("(Auto\u22b3Majitel)");
                expected.addColumn("AutoId", "number");
                expected.addColumn("Kola", "number");
                expected.addColumn("Motor", "string");
                expected.addColumn("Vyrobce", "string");
                expected.addColumn("Barva", "string");
                expected.addColumn("MajitelId", "number");
                const e1a: Row = new Row(expected.getColumns());
                e1a.addValue("AutoId", 1);
                e1a.addValue("Kola", 4);
                e1a.addValue("Motor", "Motor V4");
                e1a.addValue("Vyrobce", "Skoda");
                e1a.addValue("Barva", "Modra");
                e1a.addValue("MajitelId", 2);
                expected.addRow(e1a);

                const node: AntijoinNode = new AntijoinNode(AntijoinType.left, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });
        });
    });

    describe('right antijoin', () => {
        describe('joins relations correctly', () => {
            test('1 Auto and 1 Majitel with common MajitelId = 1 -> natural join uses both, antijoin should return 0 rows', () => {
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

                const expected: Relation = new Relation("(Auto\u22b2Majitel)");
                expected.addColumn("MajitelId", "number");
                expected.addColumn("Jmeno", "string");
                expected.addColumn("Prijmeni", "string");
                expected.addColumn("Bydliste", "string");

                const node: AntijoinNode = new AntijoinNode(AntijoinType.right, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });

            test('Majitel 1 with 2 Autos, Majitel 2 with 1 Autos, 1 Auto without a Majitel -> natural join uses both Majitels, antijoin should return no row', () => {
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
                const l1b: Row = new Row(left.getColumns());
                l1b.addValue("AutoId", 2);
                l1b.addValue("MajitelId", 2);
                l1b.addValue("Kola", 8);
                l1b.addValue("Motor", "Motor V16");
                l1b.addValue("Vyrobce", "Tatra");
                l1b.addValue("Barva", "Modra");
                left.addRow(l1b);
                const l1c: Row = new Row(left.getColumns());
                l1c.addValue("AutoId", 3);
                l1c.addValue("MajitelId", 2);
                l1c.addValue("Kola", 6);
                l1c.addValue("Motor", "Motor V8");
                l1c.addValue("Vyrobce", "Tatra");
                l1c.addValue("Barva", "Cervena");
                left.addRow(l1c);
                const l1d: Row = new Row(left.getColumns());
                l1d.addValue("AutoId", 4);
                l1d.addValue("MajitelId", 3);   // Majitel with ID 3 does not exist
                l1d.addValue("Kola", 6);
                l1d.addValue("Motor", "Motor V8");
                l1d.addValue("Vyrobce", "Tatra");
                l1d.addValue("Barva", "Cervena");
                left.addRow(l1d);

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

                const expected: Relation = new Relation("(Auto\u22b2Majitel)");
                expected.addColumn("MajitelId", "number");
                expected.addColumn("Jmeno", "string");
                expected.addColumn("Prijmeni", "string");
                expected.addColumn("Bydliste", "string");

                const node: AntijoinNode = new AntijoinNode(AntijoinType.right, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });

            test('No common column -> natural join returns 1 row, antijoin should return no row', () => {
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

                const expected: Relation = new Relation("(Auto\u22b2Majitel)");
                expected.addColumn("MajitelId", "number");
                expected.addColumn("Jmeno", "string");
                expected.addColumn("Prijmeni", "string");
                expected.addColumn("Bydliste", "string");

                const node: AntijoinNode = new AntijoinNode(AntijoinType.right, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });

            test('Common column MajitelId has different values in relations -> natural join returns no row, antijoin should return 1 row', () => {
                const left: Relation = new Relation("Auto");
                left.addColumn("AutoId", "number");
                left.addColumn("MajitelId", "number");
                left.addColumn("Kola", "number");
                left.addColumn("Motor", "string");
                left.addColumn("Vyrobce", "string");
                left.addColumn("Barva", "string");
                const l1a: Row = new Row(left.getColumns());
                l1a.addValue("AutoId", 1);
                l1a.addValue("MajitelId", 2);
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

                const expected: Relation = new Relation("(Auto\u22b2Majitel)");
                expected.addColumn("MajitelId", "number");
                expected.addColumn("Jmeno", "string");
                expected.addColumn("Prijmeni", "string");
                expected.addColumn("Bydliste", "string");
                const e1a: Row = new Row(expected.getColumns());
                e1a.addValue("MajitelId", 1);
                e1a.addValue("Jmeno", "Lukas");
                e1a.addValue("Prijmeni", "Kotlik");
                e1a.addValue("Bydliste", "Praha, CR");
                expected.addRow(e1a);

                const node: AntijoinNode = new AntijoinNode(AntijoinType.right, new RelationNode(left), new RelationNode(right));
                const actual = node.getResult();
                expect(expected.equals(actual)).toBeTruthy();
            });
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

            const right: Relation = new Relation("Majitel");
            right.addColumn("MajitelId", "number");
            right.addColumn("Jmeno", "string");
            const r1a: Row = new Row(right.getColumns());
            r1a.addValue("MajitelId", 1);
            r1a.addValue("Jmeno", "Lukas");
            right.addRow(r1a);

            const expectedLeft: Relation = new Relation("");
            expectedLeft.addColumn("AutoId", "number");
            expectedLeft.addColumn("MajitelId", "number");
            expectedLeft.addColumn("Kola", "number");
            expectedLeft.addColumn("Motor", "string");

            const expectedRight: Relation = new Relation("");
            expectedRight.addColumn("MajitelId", "number");
            expectedRight.addColumn("Jmeno", "string");

            const nodeLeft: AntijoinNode = new AntijoinNode(AntijoinType.left, new RelationNode(left), new RelationNode(right));
            const actualLeft = nodeLeft.fakeEval(-5);
            expect(expectedLeft.equals(actualLeft.result)).toBeTruthy();
            expect(actualLeft.whispers.length).toBe(0);
            expect(actualLeft.errors.length).toBe(0);

            const nodeRight: AntijoinNode = new AntijoinNode(AntijoinType.right, new RelationNode(left), new RelationNode(right));
            const actualRight = nodeRight.fakeEval(-5);
            expect(expectedRight.equals(actualRight.result)).toBeTruthy();
            expect(actualRight.whispers.length).toBe(0);
            expect(actualRight.errors.length).toBe(0);
        });

    describe('passes found whispers' , () => {
        test('from left: LAuto(LId == 1)\u22b3RAuto', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 10);
            const expected: Set<string> = new Set(["LId", "LMajitel", "LKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true);
            const node: AntijoinNode = new AntijoinNode(AntijoinType.left, nodePrev, rightSource);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('from right: LAuto\u22b3RAuto(RId == 1)', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 20);
            const expected: Set<string> = new Set(["RId", "RMajitel", "RKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true);
            const node: AntijoinNode = new AntijoinNode(AntijoinType.left, leftSource, nodePrev);
            const actual = node.fakeEval(25);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});