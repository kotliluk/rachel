import {Relation} from "../../relation/relation";
import {Row} from "../../relation/row";
import {ProjectionNode} from "../projectionNode";
import {RelationNode} from "../relationNode";
import {IndexedString} from "../../types/indexedString";
import {ColumnContent, SupportedColumnType} from "../../relation/columnType";


const getSourceNode = (): RelationNode => {
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

  return new RelationNode(sourceRelation);
}

const createRelation = (
  name: string,
  columns: [string, SupportedColumnType][],
  rows: [string, ColumnContent][][],
): Relation => {
  const relation: Relation = new Relation(name);
  columns.forEach(columnData => relation.addColumn(...columnData));
  rows.forEach(rowValues => {
    const row: Row = new Row(relation.getColumns());
    rowValues.forEach(rowValue => row.addValue(...rowValue));
    relation.addRow(row);
  });
  return relation;
}


describe('eval' , () => {
  test('projects valid columns correctly: [Kola, Id]', () => {
    // arrange
    const str = IndexedString.new("[Kola, Id]");
    const expected = createRelation(
      "Auto[...]",
      [["Id", "number"], ["Kola", "number"]],
      [ [["Id", 1], ["Kola", 4]] ],
    )
    // act
    const node: ProjectionNode = new ProjectionNode(str, getSourceNode());
    const actual = node.getResult();
    // assert
    expect(actual).toEqualTo(expected);
  });

  test('fails when absent column: [Radio]', () => {
    // arrange
    const str: IndexedString = IndexedString.new("[Radio]");
    // act + assert
    const node: ProjectionNode = new ProjectionNode(str, getSourceNode());
    expect(() => node.getResult()).toThrow();
  });

  test('fails when invalid column name: [3three]', () => {
    // arrange
    const str: IndexedString = IndexedString.new("[3three]");
    // act + assert
    const node: ProjectionNode = new ProjectionNode(str, getSourceNode());
    expect(() => node.getResult()).toThrow();
  });
});

interface FakeEvalCorrectSchemaTestInput {
  str: IndexedString
  expected: Relation
}

interface FakeEvalCorrectWhispersTestInput {
  cursorIndex: number
  expected: string[]
}

describe('fakeEval' , () => {
  describe('creates correct schema' , () => {
    const testInputs: FakeEvalCorrectSchemaTestInput[] = [
      {
        str: IndexedString.new("[Kola, Id]", 10),
        expected: createRelation("Auto[...]", [["Id", "number"], ["Kola", "number"]], []),
      },
      {
        str: IndexedString.new("[Kola, Absent]", 10),
        expected: createRelation("Auto[...]", [["Kola", "number"]], []),
      },
      {
        str: IndexedString.new("[Absent1, Absent2]", 10),
        expected: createRelation("Auto[...]", [], []),
      },
    ]

    test.each(testInputs)("%s", ({ str, expected }) => {
      // arrange
      const node: ProjectionNode = new ProjectionNode(str, getSourceNode());
      // act
      const actual = node.fakeEval(-5);
      // assert
      expect(actual.result).toEqualTo(expected);
    });
  });

  describe('finds cursor correctly' , () => {

    const testInputs: FakeEvalCorrectWhispersTestInput[] = [
      { cursorIndex: 11, expected: ["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"] },
      { cursorIndex: 10, expected: [] },
      { cursorIndex: 19, expected: ["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"] },
      { cursorIndex: 20, expected: [] },
    ]

    test.each(testInputs)('%s', ({ cursorIndex, expected }) => {
      // arrange
      const str = IndexedString.new("[Kola, Id]", 10);
      const node: ProjectionNode = new ProjectionNode(str, getSourceNode());
      // act
      const actual = node.fakeEval(cursorIndex);
      // assert
      expect(new Set(actual.whispers)).toStrictEqual(new Set(expected));
    });
  });

  describe('passes found whispers' , () => {
    test('[Kola, Id][Should, Not, Care]', () => {
      // arrange
      const strPrev = IndexedString.new("[Kola, Id]", 10);
      const str = IndexedString.new("[Should, Not, Care]", 20);
      const nodePrev = new ProjectionNode(strPrev, getSourceNode());
      const node = new ProjectionNode(str, nodePrev);
      const expected = new Set(["Id", "Majitel", "Kola", "Motor", "Vyrobce", "Barva"]);
      // act
      const actual = node.fakeEval(15);
      // assert
      expect(new Set(actual.whispers)).toStrictEqual(expected);
    });
  });
});
