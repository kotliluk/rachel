import {Row}  from "../relation/row";
import {VETreeNode} from "./veTreeNode";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";

/**
 * Class storing literal value of number, string or null type.
 */
export class LiteralValue extends VETreeNode {

    /**
     * Creates a literal storing given value.
     *
     * @param value value to be returned by eval(...) function
     * @param type type of the literal value
     */
    public constructor(private readonly value: ColumnContent, private readonly type: SupportedColumnType | "null") {
        super();
    }

    /**
     * Returns stored value.
     *
     * @param source row with actual values of columns (note: not used in literals)
     * @return stored value and its type
     */
    public eval(source: Row): { value: ColumnContent, type: SupportedColumnType | "null" } {
        return { value: this.value, type: this.type };
    }

    public toString(): string {
        if (this.value === null) {
            return "null";
        }
        return this.value.toString();
    }
}