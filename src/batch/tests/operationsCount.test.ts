import {
  addOperations,
  binaryOperations,
  OperationsCount,
  operationsOfTree,
  totalOperations,
  unaryOperations,
  zeroOperations
} from "../operationsCount";
import {RATreeNode} from "../../ratree/raTreeNode";
import {AntijoinNode, AntijoinType} from "../../ratree/antijoinNode";
import {CartesianProductNode} from "../../ratree/cartesianProductNode";
import {DivisionNode} from "../../ratree/divisionNode";
import {RelationNode} from "../../ratree/relationNode";
import {Relation} from "../../relation/relation";
import {ProjectionNode} from "../../ratree/projectionNode";
import {IndexedString} from "../../types/indexedString";
import {SelectionNode} from "../../ratree/selectionNode";
import {SetOperationNode, SetOperationType} from "../../ratree/setOperationNode";
import {RenameNode} from "../../ratree/renameNode";
import {ThetaJoinNode, ThetaJoinType} from "../../ratree/thetaJoinNode";

const getAllZeros = (): OperationsCount => {
  return {
    antijoin: 0,
    cartesian: 0,
    division: 0,
    natural: 0,
    outerJoin: 0,
    projection: 0,
    rename: 0,
    selection: 0,
    semijoin: 0,
    union: 0,
    intersection: 0,
    difference: 0,
    thetaJoin: 0,
    thetaSemijoin: 0,
  }
}

const getAllOnes = (): OperationsCount => {
  return {
    antijoin: 1,
    cartesian: 1,
    division: 1,
    natural: 1,
    outerJoin: 1,
    projection: 1,
    rename: 1,
    selection: 1,
    semijoin: 1,
    union: 1,
    intersection: 1,
    difference: 1,
    thetaJoin: 1,
    thetaSemijoin: 1,
  }
}

const getAllTwos = (): OperationsCount => {
  return {
    antijoin: 2,
    cartesian: 2,
    division: 2,
    natural: 2,
    outerJoin: 2,
    projection: 2,
    rename: 2,
    selection: 2,
    semijoin: 2,
    union: 2,
    intersection: 2,
    difference: 2,
    thetaJoin: 2,
    thetaSemijoin: 2,
  }
}

describe('zeroOperations', () => {
  test('returns zeros for all operation counts', () => {
    // arrange
    const expected = getAllZeros()
    // act
    const actual = zeroOperations()
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

interface AddOperationsTestInput {
  toAdd: OperationsCount[],
  expected: OperationsCount,
}

describe('addOperations', () => {
  const inputs: AddOperationsTestInput[] = [
    { toAdd: [], expected: getAllZeros() },
    { toAdd: [ getAllZeros() ], expected: getAllZeros() },
    { toAdd: [ getAllZeros(), getAllOnes(), getAllOnes() ], expected: getAllTwos() },
  ]
  test.each(inputs)('%s', ({ toAdd, expected }) => {
    // act
    const actual = addOperations(...toAdd)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

interface CountOperationsTestInput {
  toSum: OperationsCount,
  expected: number,
}

describe('totalOperations', () => {
  const inputs: CountOperationsTestInput[] = [
    { toSum: getAllZeros(), expected: 0 },
    { toSum: getAllOnes(), expected: 14 },
  ]
  test.each(inputs)('%s', ({ toSum, expected }) => {
    // act
    const actual = totalOperations(toSum)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

describe('binaryOperations', () => {
  const inputs: CountOperationsTestInput[] = [
    { toSum: getAllZeros(), expected: 0 },
    { toSum: getAllOnes(), expected: 11 },
  ]
  test.each(inputs)('%s', ({ toSum, expected }) => {
    // act
    const actual = binaryOperations(toSum)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

describe('unaryOperations', () => {
  const inputs: CountOperationsTestInput[] = [
    { toSum: getAllZeros(), expected: 0 },
    { toSum: getAllOnes(), expected: 3 },
  ]
  test.each(inputs)('%s', ({ toSum, expected }) => {
    // act
    const actual = unaryOperations(toSum)
    // assert
    expect(actual).toStrictEqual(expected)
  })
})

const leafNode: RelationNode = new RelationNode(new Relation(''))

const tree: RATreeNode = new AntijoinNode(  // ANTIJOIN 1
  AntijoinType.left,
  new CartesianProductNode( // CARTESIAN 1
    new DivisionNode( // DIVISION 1
      new ProjectionNode(IndexedString.empty(), leafNode),  // PROJECTION 1
      new SelectionNode(IndexedString.empty(), leafNode, true), // SELECTION 1
      undefined
    ),
    new SetOperationNode( // SET OPERATION 1
      SetOperationType.difference,
      new ProjectionNode(IndexedString.empty(), leafNode),  // PROJECTION 2
      new SelectionNode(IndexedString.empty(), leafNode, true), // SELECTION 2
      undefined
    ),
    undefined
  ),
  new CartesianProductNode( // CARTESIAN 2
    new ThetaJoinNode(  // THETA SEMIJOIN 1
      ThetaJoinType.right,
      IndexedString.empty(),
      new RenameNode(IndexedString.empty(), leafNode),  // RENAME 1
      new RenameNode(IndexedString.empty(), leafNode),  // RENAME 2
      true,
    ),
    new ThetaJoinNode( // THETA JOIN 1
      ThetaJoinType.full,
      IndexedString.empty(),
      new RenameNode(IndexedString.empty(), leafNode),  // RENAME 3
      new RenameNode(IndexedString.empty(), leafNode),  // RENAME 4
      true,
    ),
    undefined
  )
)

describe('operationsOfTree', () => {
  // arrange
  const expected: OperationsCount = {
    antijoin: 1,
    cartesian: 2,
    division: 1,
    natural: 0,
    outerJoin: 0,
    projection: 2,
    rename: 4,
    selection: 2,
    semijoin: 0,
    union: 0,
    intersection: 0,
    difference: 1,
    thetaJoin: 1,
    thetaSemijoin: 1,
  }
  // act
  const actual = operationsOfTree(tree)
  // assert
  expect(actual).toStrictEqual(expected)
})
