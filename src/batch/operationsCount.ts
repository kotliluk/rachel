import {RATreeNode} from "../ratree/raTreeNode";
import {UnaryNode} from "../ratree/unaryNode";
import {BinaryNode} from "../ratree/binaryNode";
import {ProjectionNode} from "../ratree/projectionNode";
import {RenameNode} from "../ratree/renameNode";
import {SelectionNode} from "../ratree/selectionNode";
import {AntijoinNode} from "../ratree/antijoinNode";
import {CartesianProductNode} from "../ratree/cartesianProductNode";
import {DivisionNode} from "../ratree/divisionNode";
import {OuterJoinNode} from "../ratree/outerJoinNode";
import {NaturalJoinNode, NaturalJoinType} from "../ratree/naturalJoinNode";
import {SetOperationNode} from "../ratree/setOperationNode";
import {ThetaJoinNode, ThetaJoinType} from "../ratree/thetaJoinNode";

export const OperationsTypes: string[] = ["antijoin", "cartesian", "division", "natural", "outerJoin", "projection",
  "rename", "selection", "semijoin", "setOperation", "thetaJoin", "thetaSemijoin"];

/**
 * Counts of all supported relational algebra operations.
 */
// TODO presnejsi deleni
export interface OperationsCount {
  antijoin: number,
  cartesian: number,
  division: number,
  natural: number,
  outerJoin: number,
  projection: number,
  rename: number,
  selection: number,
  semijoin: number,
  setOperation: number,
  thetaJoin: number,
  thetaSemijoin: number,
}

/**
 * Creates zero counts for all operations.
 */
export function zeroOperations(): OperationsCount {
  return addOperations();
}

/**
 * Adds given OperationsCounts together.
 */
export function addOperations(...counts: OperationsCount[]): OperationsCount {
  return {
    antijoin: counts.reduce((agg, count) => agg + count.antijoin, 0),
    cartesian: counts.reduce((agg, count) => agg + count.cartesian, 0),
    division: counts.reduce((agg, count) => agg + count.division, 0),
    natural: counts.reduce((agg, count) => agg + count.natural, 0),
    outerJoin: counts.reduce((agg, count) => agg + count.outerJoin, 0),
    projection: counts.reduce((agg, count) => agg + count.projection, 0),
    rename: counts.reduce((agg, count) => agg + count.rename, 0),
    selection: counts.reduce((agg, count) => agg + count.selection, 0),
    semijoin: counts.reduce((agg, count) => agg + count.semijoin, 0),
    setOperation: counts.reduce((agg, count) => agg + count.setOperation, 0),
    thetaJoin: counts.reduce((agg, count) => agg + count.thetaJoin, 0),
    thetaSemijoin: counts.reduce((agg, count) => agg + count.thetaSemijoin, 0),
  }
}

/**
 * Sums all operation counts.
 */
export function totalOperations(o: OperationsCount): number {
  return binaryOperations(o) + unaryOperations(o);
}

/**
 * Sums all binary operation counts.
 */
export function binaryOperations(o: OperationsCount): number {
  return o.antijoin + o.cartesian + o.division + o.natural + o.outerJoin + o.semijoin + o.setOperation + o.thetaJoin + o.thetaSemijoin;
}

/**
 * Sums all unary operation counts.
 */
export function unaryOperations(o: OperationsCount): number {
  return o.projection + o.rename + o.selection;
}

/**
 * Counts all operations used in the given tree.
 */
export function operationsOfTree(tree: RATreeNode): OperationsCount {
  if (tree instanceof UnaryNode) {
    return addOperations(operationOfUnaryNode(tree), operationsOfTree(tree.getSubtree()));
  }
  if (tree instanceof BinaryNode) {
    return addOperations(operationOfBinaryNode(tree), operationsOfTree(tree.getLeftSubtree()), operationsOfTree(tree.getRightSubtree()));
  }
  // no subtree - relation node
  return zeroOperations();
}

/**
 * Returns OperationsCount with one given unary operation count set to 1, other operators to 0.
 */
export function operationOfUnaryNode(node: UnaryNode): OperationsCount {
  let ret: OperationsCount = zeroOperations();
  if (node instanceof ProjectionNode) {
    ret.projection = 1;
    return ret;
  }
  if (node instanceof RenameNode) {
    ret.rename = 1;
    return ret;
  }
  if (node instanceof SelectionNode) {
    ret.selection = 1;
    return ret;
  }
  return ret;
}

/**
 * Returns OperationsCount with one given binary operation count set to 1, other operators to 0.
 */
export function operationOfBinaryNode(node: BinaryNode): OperationsCount {
  let ret: OperationsCount = zeroOperations();
  if (node instanceof AntijoinNode) {
    ret.antijoin = 1;
    return ret;
  }
  if (node instanceof CartesianProductNode) {
    ret.cartesian = 1;
    return ret;
  }
  if (node instanceof DivisionNode) {
    ret.division = 1;
    return ret;
  }
  if (node instanceof OuterJoinNode) {
    ret.outerJoin = 1;
    return ret;
  }
  if (node instanceof NaturalJoinNode) {
    if (node.getType() === NaturalJoinType.natural) {
      ret.natural = 1;
    }
    else {
      ret.semijoin = 1;
    }
    return ret;
  }
  if (node instanceof SetOperationNode) {
    ret.setOperation = 1;
    return ret;
  }
  if (node instanceof ThetaJoinNode) {
    if (node.getType() === ThetaJoinType.full) {
      ret.thetaJoin = 1;
    }
    else {
      ret.thetaSemijoin = 1;
    }
    return ret;
  }
  return ret;
}