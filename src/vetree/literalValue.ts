import {Row} from "../relation/row";
import {VEResult, VETreeNode} from "./veTreeNode";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";

/**
 * Class storing literal value of number, string or null type.
 * @extends VETreeNode
 * @public
 */
export class LiteralValue extends VETreeNode {

    /**
     * Creates a literal storing given value.
     *
     * @param value value to be returned by eval(...) function {@type ColumnContent}
     * @param type type of the literal value {@type (SupportedColumnType | "null")}
     */
    public constructor(private readonly value: ColumnContent, private readonly type: SupportedColumnType | "null") {
        super();
    }

    /**
     * Returns stored value.
     *
     * @param source row with actual values of columns (note: not used in literals) {@type Row}
     * @return stored value and its type {@type VEResult}
     * @public
     */
    public eval(source: Row): VEResult {
        return { value: this.value, type: this.type };
    }

    /**
     * Returns string representation of the node.
     *
     * @return string representation of the node {@type string}
     * @public
     */
    public toString(): string {
        if (this.value === null) {
            return "null";
        }
        return this.value.toString();
    }
}