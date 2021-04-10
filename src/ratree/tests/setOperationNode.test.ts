import Relation from "../../relation/relation";
import Row from "../../relation/row";
import RelationNode from "../relationNode";
import SetOperationNode, {SetOperationType} from "../setOperationNode";
import {IndexedString} from "../../types/indexedString";
import SelectionNode from "../selectionNode";

describe('eval' , () => {
    describe('union', () => {
        test('Two rows joined', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("MajitelId", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);

            const expected: Relation = new Relation("(Auto\u222aAuto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expected.addRow(expecteda);
            const expectedb: Row = new Row(right.getColumns());
            expectedb.addValue("AutoId", 2);
            expectedb.addValue("MajitelId", 1);
            expectedb.addValue("Kola", 4);
            expectedb.addValue("Motor", "Motor V4");
            expectedb.addValue("Vyrobce", "Skoda");
            expectedb.addValue("Barva", "Modra");
            expected.addRow(expectedb);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.union, new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Duplicit row added only once', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("MajitelId", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);
            const rightb: Row = new Row(left.getColumns());
            rightb.addValue("AutoId", 1);
            rightb.addValue("MajitelId", 1);
            rightb.addValue("Kola", 4);
            rightb.addValue("Motor", "Motor V4");
            rightb.addValue("Vyrobce", "Skoda");
            rightb.addValue("Barva", "Modra");
            right.addRow(rightb);

            const expected: Relation = new Relation("(Auto\u222aAuto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expected.addRow(expecteda);
            const expectedb: Row = new Row(right.getColumns());
            expectedb.addValue("AutoId", 2);
            expectedb.addValue("MajitelId", 1);
            expectedb.addValue("Kola", 4);
            expectedb.addValue("Motor", "Motor V4");
            expectedb.addValue("Vyrobce", "Skoda");
            expectedb.addValue("Barva", "Modra");
            expected.addRow(expectedb);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.union, new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Different schemas throw error', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("Majitel", "number");  // not MajitelId
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("Majitel", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.union, new RelationNode(left), new RelationNode(right), undefined);
            expect(() => node.getResult()).toThrow();
        });
    });

    describe('intersection', () => {
        test('no common rows', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("MajitelId", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);

            const expected: Relation = new Relation("(Auto\u2229Auto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");

            const node: SetOperationNode = new SetOperationNode(SetOperationType.intersection, new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('adds common row', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("MajitelId", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);
            const rightb: Row = new Row(left.getColumns());
            rightb.addValue("AutoId", 1);
            rightb.addValue("MajitelId", 1);
            rightb.addValue("Kola", 4);
            rightb.addValue("Motor", "Motor V4");
            rightb.addValue("Vyrobce", "Skoda");
            rightb.addValue("Barva", "Modra");
            right.addRow(rightb);

            const expected: Relation = new Relation("(Auto\u2229Auto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expected.addRow(expecteda);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.intersection, new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Different schemas throw error', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("Majitel", "number");  // not MajitelId
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("Majitel", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.intersection, new RelationNode(left), new RelationNode(right), undefined);
            expect(() => node.getResult()).toThrow();
        });
    });

    describe('difference', () => {
        test('no common rows', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("MajitelId", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);

            const expected: Relation = new Relation("(Auto\\Auto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expected.addRow(expecteda);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.difference, new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('removes common rows', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("MajitelId", "number");
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("MajitelId", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);
            const rightb: Row = new Row(left.getColumns());
            rightb.addValue("AutoId", 1);
            rightb.addValue("MajitelId", 1);
            rightb.addValue("Kola", 4);
            rightb.addValue("Motor", "Motor V4");
            rightb.addValue("Vyrobce", "Skoda");
            rightb.addValue("Barva", "Modra");
            right.addRow(rightb);

            const expected: Relation = new Relation("(Auto\\Auto)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");

            const node: SetOperationNode = new SetOperationNode(SetOperationType.difference, new RelationNode(left), new RelationNode(right), undefined);
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Different schemas throw error', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("MajitelId", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("MajitelId", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const right: Relation = new Relation("Auto");
            right.addColumn("AutoId", "number");
            right.addColumn("Majitel", "number");  // not MajitelId
            right.addColumn("Kola", "number");
            right.addColumn("Motor", "string");
            right.addColumn("Vyrobce", "string");
            right.addColumn("Barva", "string");
            const righta: Row = new Row(right.getColumns());
            righta.addValue("AutoId", 2);
            righta.addValue("Majitel", 1);
            righta.addValue("Kola", 4);
            righta.addValue("Motor", "Motor V4");
            righta.addValue("Vyrobce", "Skoda");
            righta.addValue("Barva", "Modra");
            right.addRow(righta);

            const node: SetOperationNode = new SetOperationNode(SetOperationType.difference, new RelationNode(left), new RelationNode(right), undefined);
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
        left.addColumn("MotorL", "string");
        const lefta: Row = new Row(left.getColumns());
        lefta.addValue("AutoId", 1);
        lefta.addValue("MajitelId", 1);
        lefta.addValue("Kola", 4);
        lefta.addValue("MotorL", "Motor V4");
        left.addRow(lefta);

        const right: Relation = new Relation("Majitel");
        right.addColumn("AutoId", "number");
        right.addColumn("MajitelId", "number");
        right.addColumn("KolaR", "number");
        right.addColumn("Motor", "string");
        const righta: Row = new Row(right.getColumns());
        righta.addValue("AutoId", 1);
        righta.addValue("MajitelId", 1);
        righta.addValue("KolaR", 4);
        righta.addValue("Motor", "Motor V4");
        right.addRow(righta);

        const expectedUnion: Relation = new Relation("(Auto\u222aMajitel)");
        expectedUnion.addColumn("AutoId", "number");
        expectedUnion.addColumn("MajitelId", "number");

        const expectedIntersection: Relation = new Relation("(Auto\u2229Majitel)");
        expectedIntersection.addColumn("AutoId", "number");
        expectedIntersection.addColumn("MajitelId", "number");

        const expectedDifference: Relation = new Relation("(Auto\\Majitel)");
        expectedDifference.addColumn("AutoId", "number");
        expectedDifference.addColumn("MajitelId", "number");

        const nodeUnion: SetOperationNode = new SetOperationNode(SetOperationType.union, new RelationNode(left), new RelationNode(right), undefined);
        const actualUnion = nodeUnion.fakeEval(-5);
        expect(expectedUnion.equals(actualUnion.result)).toBeTruthy();

        const nodeIntersection: SetOperationNode = new SetOperationNode(SetOperationType.intersection, new RelationNode(left), new RelationNode(right), undefined);
        const actualIntersection = nodeIntersection.fakeEval(-5);
        expect(expectedIntersection.equals(actualIntersection.result)).toBeTruthy();

        const nodeDifference: SetOperationNode = new SetOperationNode(SetOperationType.difference, new RelationNode(left), new RelationNode(right), undefined);
        const actualDifference = nodeDifference.fakeEval(-5);
        expect(expectedDifference.equals(actualDifference.result)).toBeTruthy();
    });

    describe('passes found whispers' , () => {
        test('from left: LAuto(LId == 1)\u222aRAuto', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 10);
            const expected: Set<string> = new Set(["LId", "LMajitel", "LKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true);
            const node: SetOperationNode = new SetOperationNode(SetOperationType.union, nodePrev, rightSource, undefined);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('from right: LAuto\u222aRAuto(RId == 1)', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 20);
            const expected: Set<string> = new Set(["RId", "RMajitel", "RKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true);
            const node: SetOperationNode = new SetOperationNode(SetOperationType.union, leftSource, nodePrev, undefined);
            const actual = node.fakeEval(25);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});