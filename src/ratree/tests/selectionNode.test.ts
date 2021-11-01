import { RelationNode } from '../relationNode'
import { SelectionNode } from '../selectionNode'
import { IndexedString } from '../../types/indexedString'
import { createRelation } from './common'


const getSourceNode = (): RelationNode => {
  const relation = createRelation(
    'Auto',
    [['Id', 'number'], ['Owner', 'string'], ['Wheels', 'number']],
    [
      [['Id', 1], ['Owner', 'Lukas'], ['Wheels', 4]],
      [['Id', 2], ['Owner', 'Lukas'], ['Wheels', 4]],
      [['Id', 3], ['Owner', 'Peter'], ['Wheels', 4]],
    ],
  )

  return new RelationNode(relation)
}


interface FakeEvalCorrectWhispersTestInput {
  cursorIndex: number
  expected: string[]
}

describe('SelectionNode (group: #ZKS, #RATree)', () => {
  describe('eval', () => {
    describe('selects rows correctly', () => {
      test('(Id == 1)', () => {
        // arrange
        const expr: IndexedString = IndexedString.new('(Id == 1)')
        const expected = createRelation(
          'Auto(...)',
          [['Id', 'number'], ['Owner', 'string'], ['Wheels', 'number']],
          [[['Id', 1], ['Owner', 'Lukas'], ['Wheels', 4]]],
        )
        const node: SelectionNode = new SelectionNode(expr, getSourceNode(), true)
        // act
        const actual = node.getResult()
        // assert
        expect(actual).toEqualTo(expected)
      })

      test('(Id != 1 + 0 && Owner == "Lukas")', () => {
        // arrange
        const expr: IndexedString = IndexedString.new('(Id != 1 && Owner == "Lukas")')
        const expected = createRelation(
          'Auto(...)',
          [['Id', 'number'], ['Owner', 'string'], ['Wheels', 'number']],
          [[['Id', 2], ['Owner', 'Lukas'], ['Wheels', 4]]],
        )
        const node: SelectionNode = new SelectionNode(expr, getSourceNode(), true)
        // act
        const actual = node.getResult()
        // assert
        expect(actual).toEqualTo(expected)
      })
    })

    describe('throws when invalid expression', () => {
      const testInputs: IndexedString[] = [
        IndexedString.new('(Absent == 1)'),
        IndexedString.new('(1 + 1)'),
        IndexedString.new('( )'),
        IndexedString.new('(1 + + 2 < 5)'),
      ]

      test.each(testInputs)('%s', (expr) => {
        // arrange
        const selectionNode: SelectionNode = new SelectionNode(expr, getSourceNode(), true)
        // act + assert
        expect(() => selectionNode.getResult()).toThrow()
      })
    })
  })

  describe('fakeEval', () => {
    describe('creates correct schema', () => {
      const testInputs: IndexedString[] = [
        IndexedString.new('(Id == 1)', 10),
        IndexedString.new('()', 10),
        IndexedString.new('(1 +)', 10),
      ]

      test.each(testInputs)('%s', (str) => {
        // arrange
        const node = new SelectionNode(str, getSourceNode(), true)
        const expected = createRelation('Auto(...)', [['Id', 'number'], ['Owner', 'string'], ['Wheels', 'number']], [])
        // act
        const actual = node.fakeEval(-5)
        // assert
        expect(actual.result).toEqualTo(expected)
      })
    })

    describe('finds cursor correctly', () => {
      const testInputs: FakeEvalCorrectWhispersTestInput[] = [
        {cursorIndex: 11, expected: ['Id', 'Owner', 'Wheels']},
        {cursorIndex: 10, expected: []},
        {cursorIndex: 18, expected: ['Id', 'Owner', 'Wheels']},
        {cursorIndex: 19, expected: []},
      ]

      test.each(testInputs)('%s', ({cursorIndex, expected}) => {
        // arrange
        const expr = IndexedString.new('(Id == 1)', 10)
        const node = new SelectionNode(expr, getSourceNode(), true)
        // act
        const actual = node.fakeEval(cursorIndex)
        // assert
        expect(new Set(actual.whispers)).toStrictEqual(new Set(expected))
      })
    })

    describe('passes found whispers', () => {
      test('(Id == 1)(true)', () => {
        // arrange
        const exprPrev: IndexedString = IndexedString.new('(Id == 1)', 10)
        const expr: IndexedString = IndexedString.new('(true)', 19)
        const nodePrev: SelectionNode = new SelectionNode(exprPrev, getSourceNode(), true)
        const node: SelectionNode = new SelectionNode(expr, nodePrev, true)
        const expected: Set<string> = new Set(['Id', 'Owner', 'Wheels'])
        // act
        const actual = node.fakeEval(15)
        // assert
        expect(new Set(actual.whispers)).toStrictEqual(expected)
      })
    })
  })
})
