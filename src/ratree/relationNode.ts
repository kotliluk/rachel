import Relation from "../relation/relation";
import RATreeNode from "./raTreeNode";

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

    public fakeEval(cursorIndex: number) {
        // @ts-ignore
        const relation: Relation = this.resultRelation;
        return {result: relation, whispers: [], errors: []};
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