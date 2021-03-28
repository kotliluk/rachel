import Row from "../relation/row";
import {VETreeNode} from "./veTreeNode";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";
import {ErrorFactory, SyntaxErrorCodes} from "../error/errorFactory";
import {getRange, IndexedString} from "../tools/indexedString";

/**
 * Types of ComparingOperator class.
 */
export enum ComparingOperatorType {
    equal,
    nonEqual,
    less,
    more,
    lessOrEqual,
    moreOrEqual
}

/**
 * Comparing operator compares two values and returns boolean.
 */
export class ComparingOperator extends VETreeNode {

    /**
     * Creates new ComparingOperator instance of equality type (type = ComparingOperatorType.equal).
     *
     * @param operator used string representation of equality operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     * @return new ComparingOperator instance of equality type
     */
    public static equal(operator: string | IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
        return new ComparingOperator(ComparingOperatorType.equal, operator, left, right);
    }

    /**
     * Creates new ComparingOperator instance of non-equality type (type = ComparingOperatorType.nonEqual).
     *
     * @param operator used string representation of non-equality operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     * @return new ComparingOperator instance of non-equality type
     */
    public static nonEqual(operator: string | IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
        return new ComparingOperator(ComparingOperatorType.nonEqual, operator, left, right);
    }

    /**
     * Creates new ComparingOperator instance of less type (type = ComparingOperatorType.less).
     *
     * @param operator used string representation of less operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     * @return new ComparingOperator instance of less type
     */
    public static less(operator: string | IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
        return new ComparingOperator(ComparingOperatorType.less, operator, left, right);
    }

    /**
     * Creates new ComparingOperator instance of more type (type = ComparingOperatorType.more).
     *
     * @param operator used string representation of more operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     * @return new ComparingOperator instance of more type
     */
    public static more(operator: string | IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
        return new ComparingOperator(ComparingOperatorType.more, operator, left, right);
    }

    /**
     * Creates new ComparingOperator instance of less-or-equal type (type = ComparingOperatorType.lessOrEqual).
     *
     * @param operator used string representation of less-or-equal operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     * @return new ComparingOperator instance of less-or-equal type
     */
    public static lessOrEqual(operator: string | IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
        return new ComparingOperator(ComparingOperatorType.lessOrEqual, operator, left, right);
    }

    /**
     * Creates new ComparingOperator instance of more-or-equal type (type = ComparingOperatorType.moreOrEqual).
     *
     * @param operator used string representation of more-or-equal operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     * @return new ComparingOperator instance of more-or-equal type
     */
    public static moreOrEqual(operator: string | IndexedString, left: VETreeNode, right: VETreeNode): ComparingOperator {
        return new ComparingOperator(ComparingOperatorType.moreOrEqual, operator, left, right);
    }

    /**
     * Creates new ComparingOperator of the given type.
     *
     * @param type ComparingOperator type
     * @param operator used string representation of the operator
     * @param left left subtree producing a value
     * @param right right subtree producing a value
     */
    public constructor(private readonly type: ComparingOperatorType, private readonly operator: string | IndexedString,
                       private readonly left: VETreeNode, private readonly right: VETreeNode) {
        super();
    }

    /**
     * Evaluate the node and its subtrees and compares their value results to produce a boolean value. It needs to
     * receive results of the same type from its subtrees.
     * NOTE: If one of the subtrees' results is null, only equality and non-equality are valid. Other comparing
     * operations returns always false.
     *
     * @param source row with actual values of columns recursively passed to leaf reference nodes
     * @return boolean comparing left and right subtrees' values
     */
    public eval(source: Row): { value: boolean, type: "boolean" } {
        const leftResult: { value: ColumnContent, type: SupportedColumnType | "null" } = this.left.eval(source);
        const rightResult: { value: ColumnContent, type: SupportedColumnType | "null" } = this.right.eval(source);

        if (leftResult.type !== "null" && rightResult.type !== "null" && leftResult.type !== rightResult.type) {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.comparingOperator_eval_differentInputTypes,
                getRange(this.operator), this.operator.toString(), leftResult.type, rightResult.type);
        }

        // if both values are null but both types are not null, returns false
        if (leftResult.value === null && rightResult.value === null && leftResult.type !== "null" && rightResult.type !== "null") {
            return {value: false, type: "boolean"};
        }
        if (this.type === ComparingOperatorType.equal) {
            return {value: leftResult.value === rightResult.value, type: "boolean"};
        }
        if (this.type === ComparingOperatorType.nonEqual) {
            // if any value of non-null type is null, returns false
            if ((leftResult.value === null && leftResult.type !== "null") || (rightResult.value === null && rightResult.type !== "null")) {
                return {value: false, type: "boolean"};
            }
            return {value: leftResult.value !== rightResult.value, type: "boolean"};
        }
        if (this.type === ComparingOperatorType.less) {
            if (leftResult.value === null || rightResult.value === null) {
                return {value: false, type: "boolean"};
            }
            return {value: leftResult.value < rightResult.value, type: "boolean"};
        }
        if (this.type === ComparingOperatorType.more) {
            if (leftResult.value === null || rightResult.value === null) {
                return {value: false, type: "boolean"};
            }
            return {value: leftResult.value > rightResult.value, type: "boolean"};
        }
        if (this.type === ComparingOperatorType.lessOrEqual) {
            if (leftResult.value === null || rightResult.value === null) {
                return {value: false, type: "boolean"};
            }
            return {value: leftResult.value <= rightResult.value, type: "boolean"};
        }
        // if (this.type === ComparingOperatorType.moreOrEqual)
            if (leftResult.value === null || rightResult.value === null) {
                return {value: false, type: "boolean"};
            }
            return {value: leftResult.value >= rightResult.value, type: "boolean"};
    }

    public toString(): string {
        return "(" + this.left.toString() + " " + this.operator + " " + this.right.toString() + ")";
    }
}