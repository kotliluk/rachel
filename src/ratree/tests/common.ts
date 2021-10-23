import {ColumnContent, SupportedColumnType} from "../../relation/columnType";
import {Relation} from "../../relation/relation";
import {Row} from "../../relation/row";


export const createRelation = (
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
