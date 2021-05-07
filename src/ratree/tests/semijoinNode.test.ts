import {Relation} from "../../relation/relation";
import {Row} from "../../relation/row";
import {RelationNode} from "../relationNode";
import {NaturalJoinNode, NaturalJoinType} from "../naturalJoinNode";
import {IndexedString} from "../../types/indexedString";
import {SelectionNode} from "../selectionNode";

const leftWithOneRow: Relation = new Relation("Auto");
leftWithOneRow.addColumn("AutoId", "number");
leftWithOneRow.addColumn("MajitelId", "number");
leftWithOneRow.addColumn("Kola", "number");
leftWithOneRow.addColumn("Motor", "string");
leftWithOneRow.addColumn("Vyrobce", "string");
leftWithOneRow.addColumn("Barva", "string");
const left1R_R1: Row = new Row(leftWithOneRow.getColumns());
left1R_R1.addValue("AutoId", 1);
left1R_R1.addValue("MajitelId", 1);
left1R_R1.addValue("Kola", 4);
left1R_R1.addValue("Motor", "Motor V4");
left1R_R1.addValue("Vyrobce", "Skoda");
left1R_R1.addValue("Barva", "Modra");
leftWithOneRow.addRow(left1R_R1);

const rightWithOneRow: Relation = new Relation("Majitel");
rightWithOneRow.addColumn("MajitelId", "number");
rightWithOneRow.addColumn("Jmeno", "string");
rightWithOneRow.addColumn("Prijmeni", "string");
rightWithOneRow.addColumn("Bydliste", "string");
const right1R_R1: Row = new Row(rightWithOneRow.getColumns());
right1R_R1.addValue("MajitelId", 1);
right1R_R1.addValue("Jmeno", "Lukas");
right1R_R1.addValue("Prijmeni", "Kotlik");
right1R_R1.addValue("Bydliste", "Praha, CR");
rightWithOneRow.addRow(right1R_R1);

const rightWithTwoRows: Relation = new Relation("Majitel");
rightWithTwoRows.addColumn("MajitelId", "number");
rightWithTwoRows.addColumn("Jmeno", "string");
rightWithTwoRows.addColumn("Prijmeni", "string");
rightWithTwoRows.addColumn("Bydliste", "string");
const right2R_R1: Row = new Row(rightWithTwoRows.getColumns());
right2R_R1.addValue("MajitelId", 1);
right2R_R1.addValue("Jmeno", "Lukas");
right2R_R1.addValue("Prijmeni", "Kotlik");
right2R_R1.addValue("Bydliste", "Praha, CR");
rightWithTwoRows.addRow(right2R_R1);
const right2R_R2: Row = new Row(rightWithTwoRows.getColumns());
right2R_R2.addValue("MajitelId", 2);
right2R_R2.addValue("Jmeno", "Pepa");
right2R_R2.addValue("Prijmeni", "Ridic");
right2R_R2.addValue("Bydliste", "Velke Mezirici");
rightWithTwoRows.addRow(right2R_R2);

describe('eval' , () => {
    describe('left semijoin', () => {
        test('1 Auto and 1 Majitel with common MajitelId = 1 -> should be joined as 1 row', () => {
            const expected: Relation = new Relation("(Auto<*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expected.addRow(expecteda);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, new RelationNode(leftWithOneRow), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Majitel 1 with 2 Autos, Majitel 2 with 1 Autos, 1 Auto without a Majitel -> 3 rows expected', () => {
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
            const leftb: Row = new Row(left.getColumns());
            leftb.addValue("AutoId", 2);
            leftb.addValue("MajitelId", 2);
            leftb.addValue("Kola", 8);
            leftb.addValue("Motor", "Motor V16");
            leftb.addValue("Vyrobce", "Tatra");
            leftb.addValue("Barva", "Modra");
            left.addRow(leftb);
            const leftc: Row = new Row(left.getColumns());
            leftc.addValue("AutoId", 3);
            leftc.addValue("MajitelId", 2);
            leftc.addValue("Kola", 6);
            leftc.addValue("Motor", "Motor V8");
            leftc.addValue("Vyrobce", "Tatra");
            leftc.addValue("Barva", "Cervena");
            left.addRow(leftc);
            const leftd: Row = new Row(left.getColumns());
            leftd.addValue("AutoId", 4);
            leftd.addValue("MajitelId", 3);   // Majitel with ID 3 does not exist
            leftd.addValue("Kola", 6);
            leftd.addValue("Motor", "Motor V8");
            leftd.addValue("Vyrobce", "Tatra");
            leftd.addValue("Barva", "Cervena");
            left.addRow(leftd);

            const expected: Relation = new Relation("(Auto<*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expected.addRow(expecteda);
            const expectedd: Row = new Row(expected.getColumns());
            expectedd.addValue("AutoId", 2);
            expectedd.addValue("Kola", 8);
            expectedd.addValue("Motor", "Motor V16");
            expectedd.addValue("Vyrobce", "Tatra");
            expectedd.addValue("Barva", "Modra");
            expectedd.addValue("MajitelId", 2);
            expected.addRow(expectedd);
            const expectede: Row = new Row(expected.getColumns());
            expectede.addValue("AutoId", 3);
            expectede.addValue("Kola", 6);
            expectede.addValue("Motor", "Motor V8");
            expectede.addValue("Vyrobce", "Tatra");
            expectede.addValue("Barva", "Cervena");
            expectede.addValue("MajitelId", 2);
            expected.addRow(expectede);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, new RelationNode(left), new RelationNode(rightWithTwoRows));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('No common column, there should be joined as Cartesian product -> 1 row expected', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("Majitel", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("Majitel", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const expected: Relation = new Relation("(Auto<*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Majitel", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Majitel", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expected.addRow(expecteda);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, new RelationNode(left), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Common column MajitelId has different values in relations -> no row expected', () => {
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
            lefta.addValue("MajitelId", 2);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const expected: Relation = new Relation("(Auto<*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, new RelationNode(left), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });
    });

    describe('right semijoin', () => {
        test('1 Auto and 1 Majitel with common MajitelId = 1 -> should be joined as 1 row', () => {
            const expected: Relation = new Relation("(Auto*>Majitel)");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("MajitelId", 1);
            expecteda.addValue("Jmeno", "Lukas");
            expecteda.addValue("Prijmeni", "Kotlik");
            expecteda.addValue("Bydliste", "Praha, CR");
            expected.addRow(expecteda);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.rightSemi, new RelationNode(leftWithOneRow), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Majitel 1 with 2 Autos, Majitel 2 with 1 Autos, 1 Auto without a Majitel -> 3 rows expected', () => {
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
            const leftb: Row = new Row(left.getColumns());
            leftb.addValue("AutoId", 2);
            leftb.addValue("MajitelId", 2);
            leftb.addValue("Kola", 8);
            leftb.addValue("Motor", "Motor V16");
            leftb.addValue("Vyrobce", "Tatra");
            leftb.addValue("Barva", "Modra");
            left.addRow(leftb);
            const leftc: Row = new Row(left.getColumns());
            leftc.addValue("AutoId", 3);
            leftc.addValue("MajitelId", 2);
            leftc.addValue("Kola", 6);
            leftc.addValue("Motor", "Motor V8");
            leftc.addValue("Vyrobce", "Tatra");
            leftc.addValue("Barva", "Cervena");
            left.addRow(leftc);
            const leftd: Row = new Row(left.getColumns());
            leftd.addValue("AutoId", 4);
            leftd.addValue("MajitelId", 3);   // Majitel with ID 3 does not exist
            leftd.addValue("Kola", 6);
            leftd.addValue("Motor", "Motor V8");
            leftd.addValue("Vyrobce", "Tatra");
            leftd.addValue("Barva", "Cervena");
            left.addRow(leftd);

            const expected: Relation = new Relation("(Auto*>Majitel)");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("MajitelId", 1);
            expecteda.addValue("Jmeno", "Lukas");
            expecteda.addValue("Prijmeni", "Kotlik");
            expecteda.addValue("Bydliste", "Praha, CR");
            expected.addRow(expecteda);
            const expectedd: Row = new Row(expected.getColumns());
            expectedd.addValue("MajitelId", 2);
            expectedd.addValue("Jmeno", "Pepa");
            expectedd.addValue("Prijmeni", "Ridic");
            expectedd.addValue("Bydliste", "Velke Mezirici");
            expected.addRow(expectedd);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.rightSemi, new RelationNode(left), new RelationNode(rightWithTwoRows));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('No common column, there should be joined as Cartesian product -> 1 row expected', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("Majitel", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("Majitel", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const expected: Relation = new Relation("(Auto*>Majitel)");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("MajitelId", 1);
            expecteda.addValue("Jmeno", "Lukas");
            expecteda.addValue("Prijmeni", "Kotlik");
            expecteda.addValue("Bydliste", "Praha, CR");
            expected.addRow(expecteda);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.rightSemi, new RelationNode(left), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Common column MajitelId has different values in relations -> no row expected', () => {
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
            lefta.addValue("MajitelId", 2);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const expected: Relation = new Relation("(Auto*>Majitel)");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.rightSemi, new RelationNode(left), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });
    });

    describe('full natural join' , () => {
        test('1 Auto and 1 Majitel with common MajitelId = 1 -> should be joined as 1 row', () => {
            const expected: Relation = new Relation("(Auto*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expecteda.addValue("Jmeno", "Lukas");
            expecteda.addValue("Prijmeni", "Kotlik");
            expecteda.addValue("Bydliste", "Praha, CR");
            expected.addRow(expecteda);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.natural, new RelationNode(leftWithOneRow), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Majitel 1 with 2 Autos, Majitel 2 with 1 Autos, 1 Auto without a Majitel -> 3 rows expected', () => {
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
            const leftb: Row = new Row(left.getColumns());
            leftb.addValue("AutoId", 2);
            leftb.addValue("MajitelId", 2);
            leftb.addValue("Kola", 8);
            leftb.addValue("Motor", "Motor V16");
            leftb.addValue("Vyrobce", "Tatra");
            leftb.addValue("Barva", "Modra");
            left.addRow(leftb);
            const leftc: Row = new Row(left.getColumns());
            leftc.addValue("AutoId", 3);
            leftc.addValue("MajitelId", 2);
            leftc.addValue("Kola", 6);
            leftc.addValue("Motor", "Motor V8");
            leftc.addValue("Vyrobce", "Tatra");
            leftc.addValue("Barva", "Cervena");
            left.addRow(leftc);
            const leftd: Row = new Row(left.getColumns());
            leftd.addValue("AutoId", 4);
            leftd.addValue("MajitelId", 3);   // Majitel with ID 3 does not exist
            leftd.addValue("Kola", 6);
            leftd.addValue("Motor", "Motor V8");
            leftd.addValue("Vyrobce", "Tatra");
            leftd.addValue("Barva", "Cervena");
            left.addRow(leftd);

            const expected: Relation = new Relation("(Auto*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expecteda.addValue("Jmeno", "Lukas");
            expecteda.addValue("Prijmeni", "Kotlik");
            expecteda.addValue("Bydliste", "Praha, CR");
            expected.addRow(expecteda);
            const expectedd: Row = new Row(expected.getColumns());
            expectedd.addValue("AutoId", 2);
            expectedd.addValue("Kola", 8);
            expectedd.addValue("Motor", "Motor V16");
            expectedd.addValue("Vyrobce", "Tatra");
            expectedd.addValue("Barva", "Modra");
            expectedd.addValue("MajitelId", 2);
            expectedd.addValue("Jmeno", "Pepa");
            expectedd.addValue("Prijmeni", "Ridic");
            expectedd.addValue("Bydliste", "Velke Mezirici");
            expected.addRow(expectedd);
            const expectede: Row = new Row(expected.getColumns());
            expectede.addValue("AutoId", 3);
            expectede.addValue("Kola", 6);
            expectede.addValue("Motor", "Motor V8");
            expectede.addValue("Vyrobce", "Tatra");
            expectede.addValue("Barva", "Cervena");
            expectede.addValue("MajitelId", 2);
            expectede.addValue("Jmeno", "Pepa");
            expectede.addValue("Prijmeni", "Ridic");
            expectede.addValue("Bydliste", "Velke Mezirici");
            expected.addRow(expectede);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.natural, new RelationNode(left), new RelationNode(rightWithTwoRows));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('No common column, there should be joined as Cartesian product -> 1 row expected', () => {
            // 'l' for left, 'r' for right, 'e' for expected, 'a' for result
            const left: Relation = new Relation("Auto");
            left.addColumn("AutoId", "number");
            left.addColumn("Majitel", "number");
            left.addColumn("Kola", "number");
            left.addColumn("Motor", "string");
            left.addColumn("Vyrobce", "string");
            left.addColumn("Barva", "string");
            const lefta: Row = new Row(left.getColumns());
            lefta.addValue("AutoId", 1);
            lefta.addValue("Majitel", 1);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const expected: Relation = new Relation("(Auto*Majitel)");
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
            const expecteda: Row = new Row(expected.getColumns());
            expecteda.addValue("AutoId", 1);
            expecteda.addValue("Majitel", 1);
            expecteda.addValue("Kola", 4);
            expecteda.addValue("Motor", "Motor V4");
            expecteda.addValue("Vyrobce", "Skoda");
            expecteda.addValue("Barva", "Modra");
            expecteda.addValue("MajitelId", 1);
            expecteda.addValue("Jmeno", "Lukas");
            expecteda.addValue("Prijmeni", "Kotlik");
            expecteda.addValue("Bydliste", "Praha, CR");
            expected.addRow(expecteda);

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.natural, new RelationNode(left), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
        });

        test('Common column MajitelId has different values in relations -> no row expected', () => {
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
            lefta.addValue("MajitelId", 2);
            lefta.addValue("Kola", 4);
            lefta.addValue("Motor", "Motor V4");
            lefta.addValue("Vyrobce", "Skoda");
            lefta.addValue("Barva", "Modra");
            left.addRow(lefta);

            const expected: Relation = new Relation("(Auto*Majitel)");
            expected.addColumn("AutoId", "number");
            expected.addColumn("Kola", "number");
            expected.addColumn("Motor", "string");
            expected.addColumn("Vyrobce", "string");
            expected.addColumn("Barva", "string");
            expected.addColumn("MajitelId", "number");
            expected.addColumn("Jmeno", "string");
            expected.addColumn("Prijmeni", "string");
            expected.addColumn("Bydliste", "string");

            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.natural, new RelationNode(left), new RelationNode(rightWithOneRow));
            const actual = node.getResult();
            expect(expected.equals(actual)).toBeTruthy();
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

        const expectedFull: Relation = new Relation("");
        expectedFull.addColumn("AutoId", "number");
        expectedFull.addColumn("Kola", "number");
        expectedFull.addColumn("Motor", "string");
        expectedFull.addColumn("MajitelId", "number");
        expectedFull.addColumn("Jmeno", "string");

        const nodeLeft: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, new RelationNode(left), new RelationNode(right));
        const actualLeft = nodeLeft.fakeEval(-5);
        expect(expectedLeft.equals(actualLeft.result)).toBeTruthy();

        const nodeRight: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.rightSemi, new RelationNode(left), new RelationNode(right));
        const actualRight = nodeRight.fakeEval(-5);
        expect(expectedRight.equals(actualRight.result)).toBeTruthy();

        const nodeFull: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.natural, new RelationNode(left), new RelationNode(right));
        const actualFull = nodeFull.fakeEval(-5);
        expect(expectedFull.equals(actualFull.result)).toBeTruthy();
    });

    describe('passes found whispers' , () => {
        test('from left: LAuto(LId == 1)<*RAuto', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 10);
            const expected: Set<string> = new Set(["LId", "LMajitel", "LKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true);
            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, nodePrev, rightSource);
            const actual = node.fakeEval(15);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });

        test('from right: LAuto<*RAuto(RId == 1)', () => {
            const exprPrev: IndexedString = IndexedString.new("(LId == 1)", 20);
            const expected: Set<string> = new Set(["RId", "RMajitel", "RKola"]);

            const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true);
            const node: NaturalJoinNode = new NaturalJoinNode(NaturalJoinType.leftSemi, leftSource, nodePrev);
            const actual = node.fakeEval(25);
            expect(new Set(actual.whispers)).toStrictEqual(expected);
        });
    });
});