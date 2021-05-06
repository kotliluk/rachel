import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation} from "../relation/relation";
import {Row} from "../relation/row";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Cartesian product node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @public
 */
export class CartesianProductNode extends BinaryNode {

    /**
     * Creates a new CartesianProductNode.
     *
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @param stringRange position of the operator in the original text {@type StartEndPair?}
     * @public
     */
    public constructor(leftSubtree: RATreeNode, rightSubtree: RATreeNode, private stringRange: StartEndPair | undefined) {
        super(leftSubtree, rightSubtree);
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * Expectations on source schemas: disjointness
     * @public
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();
        // join of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + "\u2a2f" + rightSource.getName() + ")");
        leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        rightSource.forEachColumn((type, name) => {
            if (!result.addColumn(name, type)) {
                throw ErrorFactory.semanticError(language().semanticErrors.binaryNode_commonColumns,
                    this.stringRange, "cartesian product", name);
            }
        });
        // join of relation rows
        leftSource.getRows().forEach(leftRow => {
            rightSource.getRows().forEach(rightRow => {
                let newRow: Row = new Row(result.getColumns());
                leftRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                rightRow.getValues().forEach((value, name) => newRow.addValue(name, value));
                result.addRow(newRow);
            });
        });
        this.resultRelation = result;
    }
    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: disjointness
     * Returned schema: union of source schemas
     * Returned fake schema is not affected when disjointness is not held
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        // evaluates the subtrees
        const left = this.leftSubtree.fakeEval(cursorIndex);
        const right = this.rightSubtree.fakeEval(cursorIndex);
        // creates return relation
        const result: Relation = new Relation("");
        left.result.forEachColumn((type, name) => result.addColumn(name, type));
        right.result.forEachColumn((type, name) => result.addColumn(name, type));
        // checks errors
        left.errors.push(...right.errors);
        const commonColumns: string[] = [];
        left.result.getColumnNames().forEach(leftColumn => {
            if (right.result.hasColumn(leftColumn)) {
                commonColumns.push(leftColumn);
            }
        });
        if (commonColumns.length > 0) {
            left.errors.push(ErrorFactory.semanticError(language().semanticErrors.binaryNode_commonColumns,
                this.stringRange, "cartesian product", commonColumns.join('", "')));
        }
        return {
            result,
            whispers: left.whispers.length !== 0 ? left.whispers : right.whispers,
            errors: left.errors
        };
    }

    /**
     * Creates a string with a structure of the RA tree in one line.
     *
     * @return string with a structure of the RA tree in one line {@type string}
     * @public
     */
    public printInLine(): string {
        return "(" + this.leftSubtree.printInLine() + this.getOperationSymbol() + this.rightSubtree.printInLine() + ")";
    }

    /**
     * Return the word name of the RA operation of the node.
     * Example: returns "Selection" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationName(): string {
        return language().operations.cartesianProduct;
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return "⨯";
    }
}