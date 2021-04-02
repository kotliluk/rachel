import Relation from "../relation/relation";
import RATreeNode from "./raTreeNode";
import ErrorWithTextRange from "../error/errorWithTextRange";

/**
 * Leave node of the relational algebra syntactic tree with reference to a source relation.
 */
export default class RelationNode extends RATreeNode {

    public constructor(relation: Relation) {
        super();
        this.resultRelation = relation;
    }

    public eval(): void {
        // nothing to evaluate
    }

    public fakeEval(cursorIndex: number): {result: Relation, whispers: string[], errors: ErrorWithTextRange[]} {
        // @ts-ignore
        return {result: this.resultRelation, whispers: [], errors: []};
    }

    public printInLine(): string {
        // @ts-ignore
        return this.resultRelation.getName();
    }

    public getOperationName(): string {
        // @ts-ignore
        return this.resultRelation.getName();
    }

    public getOperationSymbol(): string {
        return "";
    }
}