import { RelationNode } from '../relationNode'
import { Relation } from '../../relation/relation'
import { Row } from '../../relation/row'
import { IndexedString } from '../../types/indexedString'
import { SelectionNode } from '../selectionNode'
import { ThetaJoinNode, ThetaJoinType } from '../thetaJoinNode'


const leftRelation: Relation = new Relation('LAuto')
leftRelation.addColumn('LId', 'number')
leftRelation.addColumn('LMajitel', 'string')
leftRelation.addColumn('LKola', 'number')
const leftRowA: Row = new Row(leftRelation.getColumns())
leftRowA.addValue('LId', 1)
leftRowA.addValue('LMajitel', 'Lukas Left')
leftRowA.addValue('LKola', 4)
leftRelation.addRow(leftRowA)
const leftRowB: Row = new Row(leftRelation.getColumns())
leftRowB.addValue('LId', 2)
leftRowB.addValue('LMajitel', 'Lukas Left')
leftRowB.addValue('LKola', 2)
leftRelation.addRow(leftRowB)
const leftRowC: Row = new Row(leftRelation.getColumns())
leftRowC.addValue('LId', 3)
leftRowC.addValue('LMajitel', 'Pepa Left')
leftRowC.addValue('LKola', 8)
leftRelation.addRow(leftRowC)
const leftSource: RelationNode = new RelationNode(leftRelation)

const rightRelation: Relation = new Relation('RAuto')
rightRelation.addColumn('RId', 'number')
rightRelation.addColumn('RMajitel', 'string')
rightRelation.addColumn('RKola', 'number')
const rightRowA: Row = new Row(rightRelation.getColumns())
rightRowA.addValue('RId', 1)
rightRowA.addValue('RMajitel', 'Lukas Right')
rightRowA.addValue('RKola', 4)
rightRelation.addRow(rightRowA)
const rightRowB: Row = new Row(rightRelation.getColumns())
rightRowB.addValue('RId', 2)
rightRowB.addValue('RMajitel', 'Lukas Right')
rightRowB.addValue('RKola', 2)
rightRelation.addRow(rightRowB)
const rightRowC: Row = new Row(rightRelation.getColumns())
rightRowC.addValue('RId', 3)
rightRowC.addValue('RMajitel', 'Pepa Right')
rightRowC.addValue('RKola', 8)
rightRelation.addRow(rightRowC)
const rightSource: RelationNode = new RelationNode(rightRelation)

describe('ThetaJoinNode (group: #RATree)', () => {
  describe('eval', () => {
    describe('selects rows correctly', () => {
      describe('left', () => {
        test('LAuto⟨ LKola > RKola]RAuto', () => {
          const str: IndexedString = IndexedString.new('\u27e8 LKola > RKola]')
          const expected: Relation = new Relation('(LAuto\u27e8...]RAuto)')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          const rowA: Row = new Row(expected.getColumns())
          rowA.addValue('LId', 1)
          rowA.addValue('LMajitel', 'Lukas Left')
          rowA.addValue('LKola', 4)
          expected.addRow(rowA)
          const rowB: Row = new Row(expected.getColumns())
          rowB.addValue('LId', 3)
          rowB.addValue('LMajitel', 'Pepa Left')
          rowB.addValue('LKola', 8)
          expected.addRow(rowB)
          const rowC: Row = new Row(expected.getColumns())
          rowC.addValue('LId', 3)
          rowC.addValue('LMajitel', 'Pepa Left')
          rowC.addValue('LKola', 8)
          expected.addRow(rowC)

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual: Relation = thetaSemijoinNode.getResult()
          expect(actual.equals(expected)).toBeTruthy()
        })

        test('LAuto⟨ LKola > RKola && LMajitel == "Pepa Left"]RAuto', () => {
          const str: IndexedString = IndexedString.new('\u27e8 LKola > RKola && LMajitel == "Pepa Left"]')
          const expected: Relation = new Relation('(LAuto\u27e8...]RAuto)')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          const rowB: Row = new Row(expected.getColumns())
          rowB.addValue('LId', 3)
          rowB.addValue('LMajitel', 'Pepa Left')
          rowB.addValue('LKola', 8)
          expected.addRow(rowB)

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual: Relation = thetaSemijoinNode.getResult()
          expect(actual.equals(expected)).toBeTruthy()
        })
      })

      describe('right', () => {
        test('LAuto[LKola > RKola⟩RAuto', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola\u27e9')
          const expected: Relation = new Relation('(LAuto[...\u27e9RAuto)')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')
          const rowA: Row = new Row(expected.getColumns())
          rowA.addValue('RId', 2)
          rowA.addValue('RMajitel', 'Lukas Right')
          rowA.addValue('RKola', 2)
          expected.addRow(rowA)
          const rowB: Row = new Row(expected.getColumns())
          rowB.addValue('RId', 1)
          rowB.addValue('RMajitel', 'Lukas Right')
          rowB.addValue('RKola', 4)
          expected.addRow(rowB)
          const rowC: Row = new Row(expected.getColumns())
          rowC.addValue('RId', 2)
          rowC.addValue('RMajitel', 'Lukas Right')
          rowC.addValue('RKola', 2)
          expected.addRow(rowC)

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual: Relation = thetaSemijoinNode.getResult()
          expect(actual.equals(expected)).toBeTruthy()
        })

        test('LAuto[LKola > RKola && LMajitel == "Pepa Left"⟩RAuto', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola && LMajitel == "Pepa Left"\u27e9')
          const expected: Relation = new Relation('(LAuto[...\u27e9RAuto)')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')
          const rowB: Row = new Row(expected.getColumns())
          rowB.addValue('RId', 1)
          rowB.addValue('RMajitel', 'Lukas Right')
          rowB.addValue('RKola', 4)
          expected.addRow(rowB)
          const rowC: Row = new Row(expected.getColumns())
          rowC.addValue('RId', 2)
          rowC.addValue('RMajitel', 'Lukas Right')
          rowC.addValue('RKola', 2)
          expected.addRow(rowC)

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual: Relation = thetaSemijoinNode.getResult()
          expect(actual.equals(expected)).toBeTruthy()
        })
      })

      describe('full', () => {
        test('LAuto[LKola > RKola]RAuto', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola]')
          const expected: Relation = new Relation('(LAuto[...]RAuto)')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')
          const rowA: Row = new Row(expected.getColumns())
          rowA.addValue('LId', 1)
          rowA.addValue('LMajitel', 'Lukas Left')
          rowA.addValue('LKola', 4)
          rowA.addValue('RId', 2)
          rowA.addValue('RMajitel', 'Lukas Right')
          rowA.addValue('RKola', 2)
          expected.addRow(rowA)
          const rowB: Row = new Row(expected.getColumns())
          rowB.addValue('LId', 3)
          rowB.addValue('LMajitel', 'Pepa Left')
          rowB.addValue('LKola', 8)
          rowB.addValue('RId', 1)
          rowB.addValue('RMajitel', 'Lukas Right')
          rowB.addValue('RKola', 4)
          expected.addRow(rowB)
          const rowC: Row = new Row(expected.getColumns())
          rowC.addValue('LId', 3)
          rowC.addValue('LMajitel', 'Pepa Left')
          rowC.addValue('LKola', 8)
          rowC.addValue('RId', 2)
          rowC.addValue('RMajitel', 'Lukas Right')
          rowC.addValue('RKola', 2)
          expected.addRow(rowC)

          const thetaJoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual: Relation = thetaJoinNode.getResult()
          expect(actual.equals(expected)).toBeTruthy()
        })

        test('LAuto[LKola > RKola && LMajitel == "Pepa Left"]RAuto', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola && LMajitel == "Pepa Left"]')
          const expected: Relation = new Relation('(LAuto[...]RAuto)')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')
          const rowB: Row = new Row(expected.getColumns())
          rowB.addValue('LId', 3)
          rowB.addValue('LMajitel', 'Pepa Left')
          rowB.addValue('LKola', 8)
          rowB.addValue('RId', 1)
          rowB.addValue('RMajitel', 'Lukas Right')
          rowB.addValue('RKola', 4)
          expected.addRow(rowB)
          const rowC: Row = new Row(expected.getColumns())
          rowC.addValue('LId', 3)
          rowC.addValue('LMajitel', 'Pepa Left')
          rowC.addValue('LKola', 8)
          rowC.addValue('RId', 2)
          rowC.addValue('RMajitel', 'Lukas Right')
          rowC.addValue('RKola', 2)
          expected.addRow(rowC)

          const thetaJoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual: Relation = thetaJoinNode.getResult()
          expect(actual.equals(expected)).toBeTruthy()
        })
      })
    })

    describe('throws when absent column', () => {
      describe('left', () => {
        test('LAuto⟨LeftId == 1]RAuto', () => {
          const str: IndexedString = IndexedString.new('\u27e8LeftId == 1]')

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          expect(() => thetaSemijoinNode.getResult()).toThrow()
        })
      })

      describe('right', () => {
        test('LAuto[LeftId == 1⟩RAuto', () => {
          const str: IndexedString = IndexedString.new('[LeftId == 1\u27e9')

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          expect(() => thetaSemijoinNode.getResult()).toThrow()
        })
      })

      describe('full', () => {
        test('LAuto[LeftId == 1]RAuto', () => {
          const str: IndexedString = IndexedString.new('[LeftId == 1]')

          const thetaJoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          expect(() => thetaJoinNode.getResult()).toThrow()
        })
      })
    })

    describe('throws when invalid condition', () => {
      describe('left', () => {
        test('LAuto⟨LId == 1 +]RAuto', () => {
          const str: IndexedString = IndexedString.new('\u27e8LId == 1 +]')

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          expect(() => thetaSemijoinNode.getResult()).toThrow()
        })
      })

      describe('right', () => {
        test('LAuto[LId == 1 +⟩RAuto', () => {
          const str: IndexedString = IndexedString.new('[LId == 1 +\u27e9')

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          expect(() => thetaSemijoinNode.getResult()).toThrow()
        })
      })

      describe('full', () => {
        test('LAuto[Id == 1 +]RAuto', () => {
          const str: IndexedString = IndexedString.new('[Id == 1 +]')

          const thetaJoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          expect(() => thetaJoinNode.getResult()).toThrow()
        })
      })
    })

    describe('throws when result not boolean', () => {
      describe('left', () => {
        test('LAuto⟨1 + 2]RAuto', () => {
          const str: IndexedString = IndexedString.new('\u27e81 + 2]')

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          expect(() => thetaSemijoinNode.getResult()).toThrow()
        })
      })

      describe('right', () => {
        test('LAuto[1 + 2⟩RAuto', () => {
          const str: IndexedString = IndexedString.new('[1 + 2\u27e9')

          const thetaSemijoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          expect(() => thetaSemijoinNode.getResult()).toThrow()
        })
      })

      describe('full', () => {
        test('LAuto[1 + 2]RAuto', () => {
          const str: IndexedString = IndexedString.new('[1 + 2]')

          const thetaJoinNode: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          expect(() => thetaJoinNode.getResult()).toThrow()
        })
      })
    })
  })

  describe('fakeEval', () => {
    describe('creates correct schema', () => {
      describe('left', () => {
        test('cursor not in subtree nor theta join - valid condition: ⟨ LKola > RKola]', () => {
          const str: IndexedString = IndexedString.new('\u27e8 LKola > RKola]', 10)
          const expected: Relation = new Relation('\u27e8]')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })

        test('cursor not in subtree nor projection - empty condition: ⟨]', () => {
          const str: IndexedString = IndexedString.new('\u27e8]', 10)
          const expected: Relation = new Relation('\u27e8]')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })

        test('cursor not in subtree nor projection - invalid condition: ⟨1 +]', () => {
          const str: IndexedString = IndexedString.new('\u27e81 +]', 10)
          const expected: Relation = new Relation('\u27e8]')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })
      })

      describe('right', () => {
        test('cursor not in subtree nor theta join - valid condition: [LKola > RKola⟩', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola\u27e9', 10)
          const expected: Relation = new Relation('[\u27e9')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })

        test('cursor not in subtree nor projection - empty condition: [⟩', () => {
          const str: IndexedString = IndexedString.new('[\u27e9', 10)
          const expected: Relation = new Relation('[\u27e9')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })

        test('cursor not in subtree nor projection - invalid condition: [1 +⟩', () => {
          const str: IndexedString = IndexedString.new('[1 +\u27e9', 10)
          const expected: Relation = new Relation('[\u27e9')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })
      })

      describe('full', () => {
        test('cursor not in subtree nor theta join - valid condition: [LKola > RKola]', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola]', 10)
          const expected: Relation = new Relation('[]')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })

        test('cursor not in subtree nor projection - empty condition: []', () => {
          const str: IndexedString = IndexedString.new('[]', 10)
          const expected: Relation = new Relation('[]')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })

        test('cursor not in subtree nor projection - invalid condition: [1 +]', () => {
          const str: IndexedString = IndexedString.new('[1 +]', 10)
          const expected: Relation = new Relation('[]')
          expected.addColumn('LId', 'number')
          expected.addColumn('LMajitel', 'string')
          expected.addColumn('LKola', 'number')
          expected.addColumn('RId', 'number')
          expected.addColumn('RMajitel', 'string')
          expected.addColumn('RKola', 'number')

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(-5)
          expect(expected.equals(actual.result)).toBeTruthy()
        })
      })
    })

    describe('finds cursor correctly', () => {
      describe('left', () => {
        test('cursor inside - left margin', () => {
          const str: IndexedString = IndexedString.new('\u27e8LKola = RKola]', 10)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola', 'RId', 'RMajitel', 'RKola'])

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(11)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('cursor outside - left margin', () => {
          const str: IndexedString = IndexedString.new('\u27e8LKola = RKola]', 10)

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(10)
          expect(actual.whispers.length).toBe(0)
        })

        test('cursor inside - right margin', () => {
          const str: IndexedString = IndexedString.new('\u27e8LKola = RKola]', 10)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola', 'RId', 'RMajitel', 'RKola'])

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(24)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('cursor outside - right margin', () => {
          const str: IndexedString = IndexedString.new('\u27e8LKola = RKola]', 10)

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, str, leftSource, rightSource, true)
          const actual = node.fakeEval(25)
          expect(actual.whispers.length).toBe(0)
        })
      })

      describe('right', () => {
        test('cursor inside - left margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola\u27e9', 10)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola', 'RId', 'RMajitel', 'RKola'])

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(11)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('cursor outside - left margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola\u27e9', 10)

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(10)
          expect(actual.whispers.length).toBe(0)
        })

        test('cursor inside - right margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola\u27e9', 10)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola', 'RId', 'RMajitel', 'RKola'])

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(24)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('cursor outside - right margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola\u27e9', 10)

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, str, leftSource, rightSource, true)
          const actual = node.fakeEval(25)
          expect(actual.whispers.length).toBe(0)
        })
      })

      describe('full', () => {
        test('cursor inside - left margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola]', 10)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola', 'RId', 'RMajitel', 'RKola'])

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(11)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('cursor outside - left margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola]', 10)

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(10)
          expect(actual.whispers.length).toBe(0)
        })

        test('cursor inside - right margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola]', 10)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola', 'RId', 'RMajitel', 'RKola'])

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(24)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('cursor outside - right margin', () => {
          const str: IndexedString = IndexedString.new('[LKola > RKola]', 10)

          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, str, leftSource, rightSource, true)
          const actual = node.fakeEval(25)
          expect(actual.whispers.length).toBe(0)
        })
      })
    })

    describe('passes found whispers', () => {
      describe('left', () => {
        test('from left: LAuto(LId == 1)⟨LKola = RKola]RAuto', () => {
          const exprPrev: IndexedString = IndexedString.new('(LId == 1)', 10)
          const expr: IndexedString = IndexedString.new('\u27e8LKola = RKola]', 20)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola'])

          const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true)
          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, expr, nodePrev, rightSource, true)
          const actual = node.fakeEval(15)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('from right: LAuto⟨LKola = RKola]RAuto(RId == 1)', () => {
          const exprPrev: IndexedString = IndexedString.new('(RId == 1)', 30)
          const expr: IndexedString = IndexedString.new('\u27e8LKola = RKola]', 10)
          const expected: Set<string> = new Set(['RId', 'RMajitel', 'RKola'])

          const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true)
          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.left, expr, leftSource, nodePrev, true)
          const actual = node.fakeEval(35)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })
      })

      describe('right', () => {
        test('from left: LAuto(LId == 1)[LKola = RKola⟩RAuto', () => {
          const exprPrev: IndexedString = IndexedString.new('(LId == 1)', 10)
          const expr: IndexedString = IndexedString.new('[LKola = RKola\u27e9', 20)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola'])

          const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true)
          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, expr, nodePrev, rightSource, true)
          const actual = node.fakeEval(15)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('from right: LAuto[LKola = RKola⟩RAuto(RId == 1)', () => {
          const exprPrev: IndexedString = IndexedString.new('(RId == 1)', 30)
          const expr: IndexedString = IndexedString.new('[LKola = RKola\u27e9', 10)
          const expected: Set<string> = new Set(['RId', 'RMajitel', 'RKola'])

          const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true)
          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.right, expr, leftSource, nodePrev, true)
          const actual = node.fakeEval(35)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })
      })

      describe('full', () => {
        test('from left: LAuto(LId == 1)[LKola > RKola]RAuto', () => {
          const exprPrev: IndexedString = IndexedString.new('(LId == 1)', 10)
          const expr: IndexedString = IndexedString.new('[LKola > RKola]', 20)
          const expected: Set<string> = new Set(['LId', 'LMajitel', 'LKola'])

          const nodePrev: SelectionNode = new SelectionNode(exprPrev, leftSource, true)
          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, expr, nodePrev, rightSource, true)
          const actual = node.fakeEval(15)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })

        test('from right: LAuto[LKola > RKola]RAuto(RId == 1)', () => {
          const exprPrev: IndexedString = IndexedString.new('(RId == 1)', 30)
          const expr: IndexedString = IndexedString.new('[LKola > RKola]', 10)
          const expected: Set<string> = new Set(['RId', 'RMajitel', 'RKola'])

          const nodePrev: SelectionNode = new SelectionNode(exprPrev, rightSource, true)
          // act
          const node: ThetaJoinNode = new ThetaJoinNode(ThetaJoinType.full, expr, leftSource, nodePrev, true)
          const actual = node.fakeEval(35)
          expect(new Set(actual.whispers)).toStrictEqual(expected)
        })
      })
    })
  })
})
