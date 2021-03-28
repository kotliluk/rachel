import Row from "../relation/row";
import {VETreeNode} from "./veTreeNode";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";
import {ErrorFactory, SyntaxErrorCodes} from "../error/errorFactory";

/**
 * Types of ComputingOperator class.
 */
enum ComputingOperatorType {
    plus = "+",
    minus = "-",
    multiplication = "*",
    division = "/"
}

/**
 * Comparing operator takes two number values and returns a new computed number.
 */
export class ComputingOperator extends VETreeNode {

    /**
     * Creates an addition (+) computing operator.
     *
     * @param left Left subtree evaluating to a number value
     * @param right Right subtree evaluating to a number value
     * @param range Range of the operator in the input string to highlight errors
     */
    public static add(left: VETreeNode, right: VETreeNode, range: {start: number, end: number} | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.plus, left, right, range);
    }

    /**
     * Creates a deduction (-) computing operator.
     *
     * @param left Left subtree evaluating to a number value
     * @param right Right subtree evaluating to a number value
     * @param range Range of the operator in the input string to highlight errors
     */
    public static deduct(left: VETreeNode, right: VETreeNode, range: {start: number, end: number} | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.minus, left, right, range);
    }

    /**
     * Creates a multiplication (*) computing operator.
     *
     * @param left Left subtree evaluating to a number value
     * @param right Right subtree evaluating to a number value
     * @param range Range of the operator in the input string to highlight errors
     */
    public static multiply(left: VETreeNode, right: VETreeNode, range: {start: number, end: number} | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.multiplication, left, right, range);
    }

    /**
     * Creates a division (/) computing operator.
     *
     * @param left Left subtree evaluating to a number value
     * @param right Right subtree evaluating to a number value
     * @param range Range of the operator in the input string to highlight errors
     */
    public static divide(left: VETreeNode, right: VETreeNode, range: {start: number, end: number} | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.division, left, right, range);
    }

    private constructor(private readonly type: ComputingOperatorType, private readonly left: VETreeNode,
                        private readonly right: VETreeNode, private readonly range: {start: number, end: number} | undefined) {
        super();
    }

    /**
     * Evaluates recursively subtrees and transforms their number results into a new number.
     * If any subtree evaluates to string or boolean, throws error.
     * If any subtree evaluates to null, returns null.
     *
     * @param source row with actual values of columns recursively passed to leaf reference nodes
     * @return number produced from subtrees with given operation, or null if any subtree returned null
     */
    public eval(source: Row): { value: number | null, type: "number" } {
        const leftResult: { value: ColumnContent, type: SupportedColumnType | "null" } = this.left.eval(source);
        const rightResult: { value: ColumnContent, type: SupportedColumnType | "null" } = this.right.eval(source);

        if (leftResult.type !== "number" || rightResult.type !== "number") {
            throw ErrorFactory.syntaxError(SyntaxErrorCodes.computingOperator_eval_inputTypesNotNumbers, this.range,
                this.type, leftResult.type, rightResult.type);
        }

        if (leftResult.value === null || rightResult.value === null) {
            return { value: null, type: "number" };
        }

        switch (this.type) {
            case ComputingOperatorType.plus:
                // @ts-ignore (ensured by first if)
                return { value: leftResult.value + rightResult.value, type: "number" };
            case ComputingOperatorType.minus:
                // @ts-ignore (ensured by first if)
                return { value: leftResult.value - rightResult.value, type: "number" };
            case ComputingOperatorType.multiplication:
                // @ts-ignore (ensured by first if)
                return { value: leftResult.value * rightResult.value, type: "number" };
            case ComputingOperatorType.division:
                // @ts-ignore (ensured by first if)
                return { value: leftResult.value / rightResult.value, type: "number" };
        }
    }

    public toString(): string {
        return "(" + this.left.toString() + " " + this.type + " " + this.right.toString() + ")";
    }
}