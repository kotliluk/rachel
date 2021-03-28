import RATreeNode from "./raTreeNode";
import ProjectionNode from "./projectionNode";
import RenameNode from "./renameNode";
import SelectionNode from "./selectionNode";
import UnaryNode, {UnaryNodeClass} from "./unaryNode";
import AntijoinNode, {AntijoinType} from "./antijoinNode";
import CartesianProductNode from "./cartesianProductNode";
import DivisionNode from "./divisionNode";
import OuterJoinNode, {OuterJoinType} from "./outerJoinNode";
import NaturalJoinNode, {NaturalJoinType} from "./naturalJoinNode";
import SetOperationNode, {SetOperationType} from "./setOperationNode";
import BinaryNode, {BinaryNodeClass} from "./binaryNode";
import {getRange, IndexedString} from "../tools/indexedString";
import ThetaJoinNode, {ThetaJoinType} from "./thetaJoinNode";

/**
 * Factory for creating unary and binary nodes of given class.
 */
export default class RATreeFactory {

    /**
     * Creates new unary node of given class.
     *
     * @param unaryClass wanted class
     * @param subtree source subtree for a node
     * @param nullValuesSupport whether null values are supported
     * @param expr expression used to specify node's behavior
     */
    public static createUnary(unaryClass: UnaryNodeClass, subtree: RATreeNode,
                              nullValuesSupport: boolean, expr: string | IndexedString): UnaryNode {
        switch (unaryClass) {
            case "projection":
                return new ProjectionNode(expr, subtree);
            case "rename":
                return new RenameNode(expr, subtree);
            case "selection":
                return new SelectionNode(expr, subtree, nullValuesSupport);
        }
    }

    /**
     * Creates new binary node of given class.
     *
     * @param binaryClass wanted class
     * @param left left source subtree for a node
     * @param right right source subtree for a node
     * @param nullValuesSupport whether null values are supported
     * @param expr expression used to specify node's behavior
     */
    public static createBinary(binaryClass: BinaryNodeClass, left: RATreeNode, right: RATreeNode,
                               nullValuesSupport: boolean, expr: string | IndexedString): BinaryNode {
        switch (binaryClass) {
            case "left antijoin":
                return new AntijoinNode(AntijoinType.left, left, right);
            case "right antijoin":
                return new AntijoinNode(AntijoinType.right, left, right);
            case "cartesian product":
                return new CartesianProductNode(left, right, getRange(expr));
            case "division":
                return new DivisionNode(left, right, getRange(expr));
            case "natural join":
                return new NaturalJoinNode(NaturalJoinType.natural, left, right);
            case "left outer join":
                return new OuterJoinNode(OuterJoinType.left, left, right);
            case "right outer join":
                return new OuterJoinNode(OuterJoinType.right, left, right);
            case "full outer join":
                return new OuterJoinNode(OuterJoinType.full, left, right);
            case "left semijoin":
                return new NaturalJoinNode(NaturalJoinType.leftSemi, left, right);
            case "right semijoin":
                return new NaturalJoinNode(NaturalJoinType.rightSemi, left, right);
            case "union":
                return new SetOperationNode(SetOperationType.union, left, right, getRange(expr));
            case "intersection":
                return new SetOperationNode(SetOperationType.intersection, left, right, getRange(expr));
            case "difference":
                return new SetOperationNode(SetOperationType.difference, left, right, getRange(expr));
            case "theta join":
                return new ThetaJoinNode(ThetaJoinType.full, expr, left, right, nullValuesSupport);
            case "left theta semijoin":
                return new ThetaJoinNode(ThetaJoinType.left, expr, left, right, nullValuesSupport);
            case "right theta semijoin":
                return new ThetaJoinNode(ThetaJoinType.right, expr, left, right, nullValuesSupport);
        }
    }
}