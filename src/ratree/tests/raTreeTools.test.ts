import { BinaryNode } from '../binaryNode'
import { UnaryNode } from '../unaryNode'
import { NodeFakeEvalResult, RATreeNode } from '../raTreeNode'
import { depthSearch, getTreeDepth } from '../raTreeTools'


/**
 * Testing binary node class. Used only for searching by index.
 */
class TestBinary extends BinaryNode {
  constructor (readonly name: string, left: RATreeNode, right: RATreeNode) {
    super(left, right)
  }

  eval (): void {
  }

  printInLine (): string {
    return this.name
  }

  getOperationName (): string {
    return this.name
  }

  // @ts-ignore
  fakeEval (cursorIndex: number): NodeFakeEvalResult { }

  getOperationSymbol (): string {
    return ''
  }
}

/**
 * Testing unary node class. Used only for searching by index.
 */
class TestUnary extends UnaryNode {
  constructor (readonly name: string, subtree: RATreeNode) {
    super(subtree)
  }

  eval (): void {
  }

  printInLine (): string {
    return this.name
  }

  getOperationName (): string {
    return this.name
  }

  // @ts-ignore
  fakeEval (cursorIndex: number): NodeFakeEvalResult { }

  getOperationSymbol (): string {
    return ''
  }
}

/**
 * Testing leaf node class. Used only for searching by index.
 */
class TestLeaf extends RATreeNode {
  constructor (readonly name: string) {
    super()
  }

  eval (): void {
  }

  printInLine (): string {
    return this.name
  }

  getOperationName (): string {
    return this.name
  }

  // @ts-ignore
  fakeEval (cursorIndex: number): NodeFakeEvalResult { }

  getOperationSymbol (): string {
    return ''
  }
}

/**
 * Symmetric tree with 11 nodes, width 4, depth 3.
 */
const treeA: RATreeNode = new TestBinary(
    'Node 0',
    new TestBinary(
        'Node 1',
        new TestUnary(
            'Node 2',
            new TestLeaf('Node 3')
        ),
        new TestUnary(
            'Node 4',
            new TestLeaf('Node 5')
        )
    ),
    new TestBinary(
        'Node 6',
        new TestUnary(
            'Node 7',
            new TestLeaf('Node 8')
        ),
        new TestUnary(
            'Node 9',
            new TestLeaf('Node 10')
        )
    )
)

/**
 * Tree with 1 node, width 0, depth 0.
 */
const treeB: RATreeNode = new TestLeaf('Node 0')

/**
 * Asymmetric tree with 8 nodes, width 4, depth 4.
 */
const treeC: RATreeNode = new TestBinary(
    'Node 0',
    new TestLeaf('Node 1'),
    new TestBinary(
        'Node 2',
        new TestBinary(
            'Node 3',
            new TestBinary(
                'Node 4',
                new TestLeaf('Node 5'),
                new TestLeaf('Node 6')
            ),
            new TestLeaf('Node 7')
        ),
        new TestLeaf('Node 8')
    )
)

describe('depthSearch', () => {
  describe('present index given', () => {
    test.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])('finds index %i in 11 nodes', (index) => {
      // act
      const result: RATreeNode | null = depthSearch(treeA, index)
      // assert
      expect(result?.getOperationName()).toStrictEqual('Node ' + index)
    })
  })

  describe('absent index given', () => {
    test.each([-1, 11, 12, 9999999])('does not find index %i in 11 nodes', (index) => {
      // act
      const result: RATreeNode | null = depthSearch(treeA, index)
      // assert
      expect(result).toBeNull()
    })
  })
})

interface GetTreeDepthTestInput {
  tree: RATreeNode
  expectedDepth: number
}

describe('getTreeDepth', () => {
  const inputs: GetTreeDepthTestInput[] = [
    { tree: treeA, expectedDepth: 3 },
    { tree: treeB, expectedDepth: 0 },
    { tree: treeC, expectedDepth: 4 },
  ]

  test.each(inputs)('%s', ({ tree, expectedDepth }) => {
    // act
    const result: number = getTreeDepth(tree)
    // assert
    expect(result).toBe(expectedDepth)
  })
})
