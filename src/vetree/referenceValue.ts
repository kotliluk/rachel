import Row from "../relation/row";
import {VETreeNode} from "./veTreeNode";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";
import {ErrorFactory, SemanticErrorCodes} from "../error/errorFactory";
import {getRange, IndexedString} from "../tools/indexedString";

/**
 * Class storing reference to a column.
 */
export class ReferenceValue extends VETreeNode {

    /**
     * Creates a reference to the given column.
     *
     * @param columnName name of the column whose value is returned by eval(...) function
     */
    public constructor(private readonly columnName: string | IndexedString) {
        super();
    }

    /**
     * Returns value (expected to be string, number, or boolean) of the referenced column from given source row.
     *
     * @param source row with actual values of columns
     * @return referenced value and its type
     */
    public eval(source: Row): { value: ColumnContent, type: SupportedColumnType } {
        const value: ColumnContent | undefined = source.getValue(this.columnName.toString());
        const type: SupportedColumnType | undefined = source.getType(this.columnName.toString());
        if (value === undefined || type === undefined) {
            throw ErrorFactory.semanticError(SemanticErrorCodes.referenceValue_eval_absentColumn,
                getRange(this.columnName), this.columnName.toString(), [...source.getColumnNames()].join(', '));
        }
        return { value: value, type: type };
    }

    public toString(): string {
        return this.columnName.toString();
    }
}