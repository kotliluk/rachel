import {BinaryNode} from "./binaryNode";
import {RATreeNode} from "./raTreeNode";
import {Relation}  from "../relation/relation";
import {Row}  from "../relation/row";
import { isEqual } from "lodash";
import {ErrorFactory} from "../error/errorFactory";
import {language} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Types of set operation node: union, intersection, difference.
 * @public
 */
export enum SetOperationType {
    union = "\u222a",
    intersection = "\u2229",
    difference = "\\"
}

/**
 * Set operation node of the relational algebra syntactic tree.
 * @extends BinaryNode
 * @public
 */
export class SetOperationNode extends BinaryNode {

    private readonly type: SetOperationType;

    /**
     * Creates a new SetOperationNode.
     *
     * @param operator type of set operation {@type SetOperationType}
     * @param leftSubtree left subtree {@type RATreeNode}
     * @param rightSubtree right subtree {@type RATreeNode}
     * @param stringRange position of the operator in the original text {@type StartEndPair?}
     * @public
     */
    public constructor(operator: SetOperationType, leftSubtree: RATreeNode, rightSubtree: RATreeNode,
                       private stringRange: StartEndPair | undefined) {
        super(leftSubtree, rightSubtree);
        this.type = operator;
    }

    /**
     * Evaluates the RA query in this node and its subtree.
     * Expectations on source schemas: equality
     */
    public eval(): void {
        if (this.isEvaluated()) {
            return;
        }
        const leftSource: Relation = this.leftSubtree.getResult();
        const rightSource: Relation = this.rightSubtree.getResult();

        if (!isEqual(leftSource.getColumns(), rightSource.getColumns())) {
            let typeStr: string = this.getOperationName().toLowerCase();
            throw ErrorFactory.semanticError(language().semanticErrors.setOperationNode_notEqualColumns,
                this.stringRange, leftSource.getSchemaString(), rightSource.getSchemaString(), typeStr);
        }
        // copy of relational schema
        const result: Relation = new Relation("(" + leftSource.getName() + this.type + rightSource.getName() + ")");
        leftSource.forEachColumn((type, name) => result.addColumn(name, type));
        // change of relation rows
        let resultRows: Row[];
        const leftRows: Row[] = leftSource.getRows();
        const rightRows: Row[] = rightSource.getRows();
        if (this.type === SetOperationType.union) {
            resultRows = [...leftRows, ...rightRows];
        }
        else if (this.type === SetOperationType.intersection) {
            resultRows = [...leftRows].filter(lr => [...rightRows].some(rr => lr.equals(rr)));
        }
        else /* this.type === SetOperationType.difference */ {
            resultRows = [...leftRows].filter(lr => ![...rightRows].some(rr => lr.equals(rr)));
        }
        resultRows.forEach(row => result.addRow(row));
        this.resultRelation = result;
    }
    /**
     * Evaluates the RA query in this node and its subtree.
     * It searches for given cursor index in parametrized nodes and if it finds it, returns the available columns.
     * Otherwise returns the result relation schema (only column names, no rows).
     * When an error occurs, it is faked to work, and adds it to the errors array.
     *
     * Strict expectations: equality
     * Returned schema: intersection of source schemas
     * Returned schema may be empty (when there is no common column in sources).
     *
     * @param cursorIndex index of the cursor in original text input {@type number}
     * @return resulting relation schema gained by evaluating this node and its subtree or found columns to whisper {@type NodeFakeEvalResult}
     * @public
     */
    public fakeEval(cursorIndex: number) {
        const left = this.leftSubtree.fakeEval(cursorIndex);
        const right = this.rightSubtree.fakeEval(cursorIndex);
        // join of relational schema - "left intersection right"
        const result: Relation = new Relation("(" + left.result.getName() + this.type + right.result.getName() + ")");
        left.result.forEachColumn((type, name) => {
            if (right.result.hasColumn(name)) {
                result.addColumn(name, type);
            }
        });
        // checks errors in schema
        const errors = left.errors;
        errors.push(...right.errors);
        if (!isEqual(left.result.getColumns(), right.result.getColumns()) && left.result.getName() !== "" && right.result.getName() !== "") {
            let typeStr: string = this.getOperationName().toLowerCase();
            errors.push(ErrorFactory.semanticError(language().semanticErrors.setOperationNode_notEqualColumns,
                this.stringRange, left.result.getSchemaString(), right.result.getSchemaString(), typeStr));
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
        const lang = language().operations;
        if (this.type === SetOperationType.union) {
            return lang.union;
        }
        else if (this.type === SetOperationType.intersection) {
            return lang.intersection;
        }
        else {
            return lang.difference;
        }
    }

    /**
     * Return the symbolic representation of the RA operation of the node.
     * Example: returns "(some + expr = 15)" for SelectionNode.
     *
     * @return name of the RA operation of the node {@type string}
     * @public
     */
    public getOperationSymbol(): string {
        return this.type;
    }
}