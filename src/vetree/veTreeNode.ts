import Row from "../relation/row";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";

/**
 * Abstract class for value-evaluating nodes producing new values.
 */
export abstract class VETreeNode {

    /**
     * Evaluates this value-evaluating tree.
     *
     * @param source row with values to be used to reference to
     * @return evaluated value and its type
     */
    public abstract eval(source: Row): { value: ColumnContent, type: SupportedColumnType | "null" };

    /**
     * @return string representation of the value-evaluating tree
     */
    public abstract toString(): string;
}