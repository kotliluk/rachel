import { Relation } from '../../relation/relation'
import { ProjectionNode } from '../projectionNode'
import { RelationNode } from '../relationNode'
import { IndexedString } from '../../types/indexedString'
import { createRelation } from './common'


const getSourceNode = (): RelationNode => {
  const relation = createRelation(
    'Auto',
    [['Id', 'number'], ['Owner', 'number'], ['Wheels', 'number'], ['Motor', 'string'], ['Brand', 'string'], ['Color', 'string']],
    [[['Id', 1], ['Owner', 1], ['Wheels', 4], ['Motor', 'V4'], ['Brand', 'Skoda'], ['Color', 'Blue']]],
  )

  return new RelationNode(relation)
}


describe('eval', () => {
  test('projects valid columns correctly: [Wheels, Id]', () => {
    // arrange
    const str = IndexedString.new('[Wheels, Id]')
    const expected = createRelation(
      'Auto[...]',
      [['Id', 'number'], ['Wheels', 'number']],
      [[['Id', 1], ['Wheels', 4]]],
    )
    // act
    const node: ProjectionNode = new ProjectionNode(str, getSourceNode())
    const actual = node.getResult()
    // assert
    expect(actual).toEqualTo(expected)
  })

  test('fails when absent column: [Radio]', () => {
    // arrange
    const str: IndexedString = IndexedString.new('[Radio]')
    // act + assert
    const node: ProjectionNode = new ProjectionNode(str, getSourceNode())
    expect(() => node.getResult()).toThrow()
  })

  test('fails when invalid column name: [3three]', () => {
    // arrange
    const str: IndexedString = IndexedString.new('[3three]')
    // act + assert
    const node: ProjectionNode = new ProjectionNode(str, getSourceNode())
    expect(() => node.getResult()).toThrow()
  })
})

interface FakeEvalCorrectSchemaTestInput {
  str: IndexedString
  expected: Relation
}

interface FakeEvalCorrectWhispersTestInput {
  cursorIndex: number
  expected: string[]
}

describe('fakeEval', () => {
  describe('creates correct schema', () => {
    const testInputs: FakeEvalCorrectSchemaTestInput[] = [
      {
        str: IndexedString.new('[Wheels, Id]', 10),
        expected: createRelation('Auto[...]', [['Id', 'number'], ['Wheels', 'number']], []),
      },
      {
        str: IndexedString.new('[Wheels, Absent]', 10),
        expected: createRelation('Auto[...]', [['Wheels', 'number']], []),
      },
      {
        str: IndexedString.new('[Absent1, Absent2]', 10),
        expected: createRelation('Auto[...]', [], []),
      },
    ]

    test.each(testInputs)('%s', ({ str, expected }) => {
      // arrange
      const node: ProjectionNode = new ProjectionNode(str, getSourceNode())
      // act
      const actual = node.fakeEval(-5)
      // assert
      expect(actual.result).toEqualTo(expected)
    })
  })

  describe('finds cursor correctly', () => {
    const testInputs: FakeEvalCorrectWhispersTestInput[] = [
      { cursorIndex: 11, expected: ['Id', 'Owner', 'Wheels', 'Motor', 'Brand', 'Color'] },
      { cursorIndex: 10, expected: [] },
      { cursorIndex: 21, expected: ['Id', 'Owner', 'Wheels', 'Motor', 'Brand', 'Color'] },
      { cursorIndex: 22, expected: [] },
    ]

    test.each(testInputs)('%s', ({ cursorIndex, expected }) => {
      // arrange
      const str = IndexedString.new('[Wheels, Id]', 10)
      const node: ProjectionNode = new ProjectionNode(str, getSourceNode())
      // act
      const actual = node.fakeEval(cursorIndex)
      // assert
      expect(new Set(actual.whispers)).toStrictEqual(new Set(expected))
    })
  })

  describe('passes found whispers', () => {
    test('[Wheels, Id][Should, Not, Care]', () => {
      // arrange
      const strPrev = IndexedString.new('[Wheels, Id]', 10)
      const str = IndexedString.new('[Should, Not, Care]', 20)
      const nodePrev = new ProjectionNode(strPrev, getSourceNode())
      const node = new ProjectionNode(str, nodePrev)
      const expected = new Set(['Id', 'Owner', 'Wheels', 'Motor', 'Brand', 'Color'])
      // act
      const actual = node.fakeEval(15)
      // assert
      expect(new Set(actual.whispers)).toStrictEqual(expected)
    })
  })
})
