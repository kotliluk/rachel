import {Row} from "../relation/row";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";

/**
 * Result of the VETreeNode evaluation.
 * @public
 */
export interface VEResult {
    /**
     * result value
     * @type ColumnContent
     * @public
     */
    value: ColumnContent,
    /**
     * result type
     * @type (SupportedColumnType | "null")
     * @public
     */
    type: SupportedColumnType | "null"
}

/**
 * Abstract class for value-evaluating nodes producing new values.
 * @public
 */
export abstract class VETreeNode {

    /**
     * Evaluates this value-evaluating tree.
     *
     * @param source row with values to be used to reference to {@type Row}
     * @return evaluated value and its type {@type VEResult}
     * @public
     */
    public abstract eval(source: Row): VEResult;

    /**
     * Returns string representation of the node.
     *
     * @return string representation of the node {@type string}
     * @public
     */
    public abstract toString(): string;
}