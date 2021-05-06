import {Row} from "../relation/row";
import {VEResult, VETreeNode} from "./veTreeNode";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Types of ComputingOperator class.
 * @public
 */
enum ComputingOperatorType {
    plus = "+",
    minus = "-",
    multiplication = "*",
    division = "/"
}

/**
 * Comparing operator takes two number values and returns a new computed number.
 * @extends VETreeNode
 * @public
 */
export class ComputingOperator extends VETreeNode {

    /**
     * Creates an addition (+) computing operator.
     *
     * @param left Left subtree evaluating to a number value {@type VETreeNode}
     * @param right Right subtree evaluating to a number value {@type VETreeNode}
     * @param range Range of the operator in the input string to highlight errors {@type StartEndPair?}
     * @return new ComputingOperator instance of add type {@type ComputingOperator}
     * @public
     */
    public static add(left: VETreeNode, right: VETreeNode, range: StartEndPair | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.plus, left, right, range);
    }

    /**
     * Creates a deduction (-) computing operator.
     *
     * @param left Left subtree evaluating to a number value {@type VETreeNode}
     * @param right Right subtree evaluating to a number value {@type VETreeNode}
     * @param range Range of the operator in the input string to highlight errors {@type StartEndPair?}
     * @return new ComputingOperator instance of deduct type {@type ComputingOperator}
     * @public
     */
    public static deduct(left: VETreeNode, right: VETreeNode, range: StartEndPair | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.minus, left, right, range);
    }

    /**
     * Creates a multiplication (*) computing operator.
     *
     * @param left Left subtree evaluating to a number value {@type VETreeNode}
     * @param right Right subtree evaluating to a number value {@type VETreeNode}
     * @param range Range of the operator in the input string to highlight errors {@type StartEndPair?}
     * @return new ComputingOperator instance of multiply type {@type ComputingOperator}
     * @public
     */
    public static multiply(left: VETreeNode, right: VETreeNode, range: StartEndPair | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.multiplication, left, right, range);
    }

    /**
     * Creates a division (/) computing operator.
     *
     * @param left Left subtree evaluating to a number value {@type VETreeNode}
     * @param right Right subtree evaluating to a number value {@type VETreeNode}
     * @param range Range of the operator in the input string to highlight errors {@type StartEndPair?}
     * @return new ComputingOperator instance of divide type {@type ComputingOperator}
     * @public
     */
    public static divide(left: VETreeNode, right: VETreeNode, range: StartEndPair | undefined): ComputingOperator {
        return new ComputingOperator(ComputingOperatorType.division, left, right, range);
    }

    private constructor(private readonly type: ComputingOperatorType, private readonly left: VETreeNode,
                        private readonly right: VETreeNode, private readonly range: StartEndPair | undefined) {
        super();
    }

    /**
     * Evaluates recursively subtrees and transforms their number results into a new number.
     * If any subtree evaluates to string or boolean, throws error.
     * If any subtree evaluates to null, returns null.
     *
     * @param source row with actual values of columns recursively passed to leaf reference nodes {@type Row}
     * @return number produced from subtrees with given operation, or null if any subtree returned null {@type VEResult}
     */
    public eval(source: Row): { value: number | null, type: "number" } {
        const leftResult: VEResult = this.left.eval(source);
        const rightResult: VEResult = this.right.eval(source);

        if (leftResult.type !== "number" || rightResult.type !== "number") {
            throw ErrorFactory.syntaxError(language().syntaxErrors.computingOperator_inputTypesNotNumbers, this.range,
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

    /**
     * Returns string representation of the node.
     *
     * @return string representation of the node {@type string}
     * @public
     */
    public toString(): string {
        return "(" + this.left.toString() + " " + this.type + " " + this.right.toString() + ")";
    }
}