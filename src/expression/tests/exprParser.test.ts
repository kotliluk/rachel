import { Relation } from '../../relation/relation'
import {
  BinaryOperatorToken,
  ClosingParenthesis,
  ExprToken,
  OpeningParenthesis,
  RelationToken,
  UnaryOperatorToken,
} from '../exprTokens'
import { ExprParser } from '../exprParser'
import { RATreeNode } from '../../ratree/raTreeNode'
import { RelationNode } from '../../ratree/relationNode'
import { ProjectionNode } from '../../ratree/projectionNode'
import { SelectionNode } from '../../ratree/selectionNode'
import { RenameNode } from '../../ratree/renameNode'
import { NaturalJoinNode, NaturalJoinType } from '../../ratree/naturalJoinNode'
import { AntijoinNode, AntijoinType } from '../../ratree/antijoinNode'
import { DivisionNode } from '../../ratree/divisionNode'
import { OuterJoinNode, OuterJoinType } from '../../ratree/outerJoinNode'
import { IndexedString } from '../../types/indexedString'

/* TESTING BINARY */

function relationToken (str: string) {
  return new RelationToken(IndexedString.new(str))
}

function naturalJoin (str: string) {
  return BinaryOperatorToken.naturalJoin(IndexedString.new(str))
}

function leftSemijoin (str: string) {
  return BinaryOperatorToken.leftSemijoin(IndexedString.new(str))
}

function rightSemijoin (str: string) {
  return BinaryOperatorToken.rightSemijoin(IndexedString.new(str))
}

function leftAntijoin (str: string) {
  return BinaryOperatorToken.leftAntijoin(IndexedString.new(str))
}

function rightAntijoin (str: string) {
  return BinaryOperatorToken.rightAntijoin(IndexedString.new(str))
}

function fullOuterJoin (str: string) {
  return BinaryOperatorToken.fullOuterJoin(IndexedString.new(str))
}

function leftOuterJoin (str: string) {
  return BinaryOperatorToken.leftOuterJoin(IndexedString.new(str))
}

function rightOuterJoin (str: string) {
  return BinaryOperatorToken.rightOuterJoin(IndexedString.new(str))
}

function thetaJoin (str: string) {
  return BinaryOperatorToken.thetaJoin(IndexedString.new(str))
}

function leftThetaSemijoin (str: string) {
  return BinaryOperatorToken.leftThetaSemijoin(IndexedString.new(str))
}

function rightThetaSemijoin (str: string) {
  return BinaryOperatorToken.rightThetaSemijoin(IndexedString.new(str))
}

function cartesianProduct (str: string) {
  return BinaryOperatorToken.cartesianProduct(IndexedString.new(str))
}

function division (str: string) {
  return BinaryOperatorToken.division(IndexedString.new(str))
}

function difference (str: string) {
  return BinaryOperatorToken.difference(IndexedString.new(str))
}

function union (str: string) {
  return BinaryOperatorToken.union(IndexedString.new(str))
}

function intersection (str: string) {
  return BinaryOperatorToken.intersection(IndexedString.new(str))
}

/* TESTING UNARY */

function selection (str: string) {
  return UnaryOperatorToken.selection(IndexedString.new(str))
}

function projection (str: string) {
  return UnaryOperatorToken.projection(IndexedString.new(str))
}

function rename (str: string) {
  return UnaryOperatorToken.rename(IndexedString.new(str))
}

/* TESTING PARENTHESES */

function openingParenthesis (str: string) {
  return new OpeningParenthesis(IndexedString.new(str))
}

function closingParenthesis (str: string) {
  return new ClosingParenthesis(IndexedString.new(str))
}

/**
 * Asserts equality of string representations of tokens in given arrays.
 */
function assertTokenArray (actual: ExprToken[], expected: ExprToken[]) {
  expect(actual.length).toBe(expected.length)
  actual.forEach((a, i) => {
    expect(a.type).toStrictEqual(expected[i].type)
    expect(a.str.toString()).toStrictEqual(expected[i].str.toString())
  })
}

const relations: Map<string, Relation> = new Map<string, Relation>()
const auto: Relation = new Relation('Auto')
auto.addColumn('Id', 'number')
auto.addColumn('Majitel', 'number')
auto.addColumn('Kola', 'number')
auto.addColumn('Motor', 'string')
auto.addColumn('Vyrobce', 'string')
auto.addColumn('Barva', 'string')
relations.set('Auto', auto)
const majitel: Relation = new Relation('Majitel')
majitel.addColumn('Id', 'number')
majitel.addColumn('Jmeno', 'string')
majitel.addColumn('Prijmeni', 'string')
majitel.addColumn('Bydliste', 'string')
relations.set('Majitel', majitel)
const exprParser: ExprParser = new ExprParser(relations, true)

describe('parseTokens', () => {
  test('Auto', () => {
    // arrange
    const str = 'Auto'
    const expected: ExprToken[] = [relationToken('Auto')]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  test('Auto * Majitel', () => {
    // arrange
    const str = 'Auto * Majitel'
    const expected: ExprToken[] = [
      relationToken('Auto'),
      naturalJoin('*'),
      relationToken('Majitel'),
    ]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  test('Auto(Id = 1)', () => {
    // arrange
    const str = 'Auto(Id = 1)'
    const expected: ExprToken[] = [
      relationToken('Auto'),
      selection('(Id = 1)'),
    ]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  test('Auto(Id = 1)<Id -> AutoId>', () => {
    // arrange
    const str = 'Auto(Id = 1)<Id -> AutoId>'
    const expected: ExprToken[] = [
      relationToken('Auto'),
      selection('(Id = 1)'),
      rename('<Id -> AutoId>'),
    ]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  test('Auto *F* (Auto \u2a2f Majitel)', () => {
    // arrange
    const str = 'Auto *F* (Auto \u2a2f Majitel)'
    const expected: ExprToken[] = [
      relationToken('Auto'),
      fullOuterJoin('*F*'),
      openingParenthesis('('),
      relationToken('Auto'),
      cartesianProduct('\u2a2f'),
      relationToken('Majitel'),
      closingParenthesis(')'),
    ]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  test('(Auto \u00f7 Majitel)(Jmeno = "Honza")', () => {
    // arrange
    const str = '(Auto \u00f7 Majitel)(Jmeno = "Honza")'
    const expected: ExprToken[] = [
      openingParenthesis('('),
      relationToken('Auto'),
      division('\u00f7'),
      relationToken('Majitel'),
      closingParenthesis(')'),
      selection('(Jmeno = "Honza")'),
    ]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  test('A\u27e8]A[\u27e9A*F*A*L*A*R*A<*A*>A*A\u2a2fA\u222aA\u2229A\\A\u22b2A\u22b3A\u00f7A', () => {
    // arrange
    const str = 'A\u27e8]A[\u27e9A*F*A*L*A*R*A<*A*>A*A\u2a2fA\u222aA\u2229A\\A\u22b2A\u22b3A\u00f7A'
    const expected: ExprToken[] = [
      relationToken('A'),
      leftThetaSemijoin('\u27e8]'),
      relationToken('A'),
      rightThetaSemijoin('[\u27e9'),
      relationToken('A'),
      fullOuterJoin('*F*'),
      relationToken('A'),
      leftOuterJoin('*L*'),
      relationToken('A'),
      rightOuterJoin('*R*'),
      relationToken('A'),
      leftSemijoin('<*'),
      relationToken('A'),
      rightSemijoin('*>'),
      relationToken('A'),
      naturalJoin('*'),
      relationToken('A'),
      cartesianProduct('\u2a2f'),
      relationToken('A'),
      union('\u222a'),
      relationToken('A'),
      intersection('\u2229'),
      relationToken('A'),
      difference('\\'),
      relationToken('A'),
      rightAntijoin('\u22b2'),
      relationToken('A'),
      leftAntijoin('\u22b3'),
      relationToken('A'),
      division('\u00f7'),
      relationToken('A'),
    ]
    // act
    const { tokens } = exprParser.parseTokens(IndexedString.new(str))
    // assert
    assertTokenArray(tokens, expected)
  })

  describe('distinguishes projection and theta join', () => {
    test('Auto[Id]', () => {
      // arrange
      const str = 'Auto[Id]'
      const expected: ExprToken[] = [
        relationToken('Auto'),
        projection('[Id]'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })

    test('Auto[Id = 1]Majitel', () => {
      // arrange
      const str = 'Auto[Id = 1]Majitel'
      const expected: ExprToken[] = [
        relationToken('Auto'),
        thetaJoin('[Id = 1]'),
        relationToken('Majitel'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })

    test('Auto[Id][Id = 1]Majitel[Id][Id]', () => {
      // arrange
      const str = 'Auto[Id][Id = 1]Majitel[Id][Id]'
      const expected: ExprToken[] = [
        relationToken('Auto'),
        projection('[Id]'),
        thetaJoin('[Id = 1]'),
        relationToken('Majitel'),
        projection('[Id]'),
        projection('[Id]'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })

    test('(Auto[Id = 1]Auto)[Id][Id = 1]Majitel[Id][Id]', () => {
      // arrange
      const str = '(Auto[Id = 1]Auto)[Id][Id = 1]Majitel[Id][Id]'
      const expected: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        thetaJoin('[Id = 1]'),
        relationToken('Auto'),
        closingParenthesis(')'),
        projection('[Id]'),
        thetaJoin('[Id = 1]'),
        relationToken('Majitel'),
        projection('[Id]'),
        projection('[Id]'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })
  })

  describe('distinguishes parentheses and selection', () => {
    test('Auto[Id, Majitel](Id = 1)', () => {
      // arrange
      const str = 'Auto[Id, Majitel](Id = 1)'
      const expected: ExprToken[] = [
        relationToken('Auto'),
        projection('[Id, Majitel]'),
        selection('(Id = 1)'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })

    test('Auto[Id, Majitel][theta = join](Auto [theta = join] Majitel(selection))', () => {
      // arrange
      const str = 'Auto[Id, Majitel][theta = join](Auto [theta = join] Majitel(selection))'
      const expected: ExprToken[] = [
        relationToken('Auto'),
        projection('[Id, Majitel]'),
        thetaJoin('[theta = join]'),
        openingParenthesis('('),
        relationToken('Auto'),
        thetaJoin('[theta = join]'),
        relationToken('Majitel'),
        selection('(selection)'),
        closingParenthesis(')'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })

    test('((Auto))(selection)', () => {
      // arrange
      const str = '((Auto))(selection)'
      const expected: ExprToken[] = [
        openingParenthesis('('),
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
        closingParenthesis(')'),
        selection('(selection)'),
      ]
      // act
      const { tokens } = exprParser.parseTokens(IndexedString.new(str))
      // assert
      assertTokenArray(tokens, expected)
    })
  })

  describe('throws when unexpected part', () => {
    test('Auto + Auto', () => {
      // arrange
      const str = 'Auto + Auto'
      // act and assert
      expect(() => exprParser.parseTokens(IndexedString.new(str))).toThrow()
    })

    test('(Auto', () => {
      // arrange
      const str = 'Auto + Auto'
      // act and assert
      expect(() => exprParser.parseTokens(IndexedString.new(str))).toThrow()
    })

    test('((Auto)))', () => {
      // arrange
      const str = 'Auto + Auto'
      // act and assert
      expect(() => exprParser.parseTokens(IndexedString.new(str))).toThrow()
    })
  })
})

describe('assertValidInfixTokens', () => {
  describe('invalid array start (strict throws, not strict returns)', () => {
    test(')', () => {
      // arrange
      const input: ExprToken[] = [
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test(')*Auto', () => {
      // arrange
      const input: ExprToken[] = [
        closingParenthesis(')'),
        naturalJoin('*'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('(Id = 1)', () => {
      // arrange
      const input: ExprToken[] = [
        selection('(Id = 1)'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('(Id = 1)*Auto', () => {
      // arrange
      const input: ExprToken[] = [
        selection('(Id = 1)'),
        naturalJoin('*'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })
  })

  describe('returns without error for valid (both strict and not strict)', () => {
    test('Auto[projection]', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        projection('[projection]'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })

    test('(Auto)', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })

    test('Auto*Auto', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        naturalJoin('*'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })

    test('(Auto)*(Auto)', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
        naturalJoin('*'),
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })

    test('Auto(selection)[projection]', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        projection('(selection)'),
        projection('[projection]'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })

    test('(Auto*Auto)[projection]', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        naturalJoin('*'),
        relationToken('Auto'),
        closingParenthesis(')'),
        projection('[projection]'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })

    test('(Auto[projection])', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        projection('[projection]'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).not.toThrow()
    })
  })

  describe('throws error for invalid adjacent pair (both strict and not strict)', () => {
    test('Auto Auto', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('(Auto) Auto', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto(selection)Auto', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        selection('(selection)'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto (Auto)', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('(Auto) (Auto)', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto(selection)(Auto)', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        selection('(selection)'),
        openingParenthesis('('),
        relationToken('Auto'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto*)', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        naturalJoin('*'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('(*Auto', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        naturalJoin('*'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto**Auto', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        naturalJoin('*'),
        naturalJoin('*'),
        relationToken('Auto'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('([projection])', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        projection('[projection]'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto*[projection]', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        naturalJoin('*'),
        projection('[projection]'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })
  })

  describe('throws error for invalid end (both strict and not strict)', () => {
    test('Auto*(', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        naturalJoin('*'),
        openingParenthesis('('),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('Auto*', () => {
      // arrange
      const input: ExprToken[] = [
        relationToken('Auto'),
        naturalJoin('*'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })

    test('(())', () => {
      // arrange
      const input: ExprToken[] = [
        openingParenthesis('('),
        openingParenthesis('('),
        closingParenthesis(')'),
        closingParenthesis(')'),
      ]
      // assert
      expect(() => exprParser.assertValidInfixTokens(input)).toThrow()
    })
  })
})

describe('fakeValidInfixTokensForWhisper', () => {
  test('*', () => {
    // arrange
    const input: ExprToken[] = [
      naturalJoin('*'),
    ]
    const expected: ExprToken[] = [
      relationToken(''),
      naturalJoin('*'),
      relationToken(''),
    ]
    // act - input is changed inside the function
    exprParser.assertValidInfixTokens(input, false, [])
    // assert
    assertTokenArray(input, expected)
  })

  test('**', () => {
    // arrange
    const input: ExprToken[] = [
      naturalJoin('*'),
      naturalJoin('*'),
    ]
    const expected: ExprToken[] = [
      relationToken(''),
      naturalJoin('*'),
      relationToken(''),
      naturalJoin('*'),
      relationToken(''),
    ]
    // act - input is changed inside the function
    exprParser.assertValidInfixTokens(input, false, [])
    // assert
    assertTokenArray(input, expected)
  })

  test('Car Car', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Car'),
      relationToken('Car'),
    ]
    const expected: ExprToken[] = [
      relationToken('Car'),
      naturalJoin('*'),
      relationToken('Car'),
    ]
    // act - input is changed inside the function
    exprParser.assertValidInfixTokens(input, false, [])
    // assert
    assertTokenArray(input, expected)
  })

  test('<> Car', () => {
    // arrange
    const input: ExprToken[] = [
      rename('<>'),
      relationToken('Car'),
    ]
    const expected: ExprToken[] = [
      relationToken(''),
      rename('<>'),
      naturalJoin('*'),
      relationToken('Car'),
    ]
    // act - input is changed inside the function
    exprParser.assertValidInfixTokens(input, false, [])
    // assert
    assertTokenArray(input, expected)
  })

  test('()', () => {
    // arrange
    const input: ExprToken[] = [
      openingParenthesis('('),
      closingParenthesis(')'),
    ]
    const expected: ExprToken[] = [
      openingParenthesis('('),
      relationToken(''),
      closingParenthesis(')'),
    ]
    // act - input is changed inside the function
    exprParser.assertValidInfixTokens(input, false, [])
    // assert
    assertTokenArray(input, expected)
  })

  test('()()', () => {
    // arrange
    const input: ExprToken[] = [
      openingParenthesis('('),
      closingParenthesis(')'),
      openingParenthesis('('),
      closingParenthesis(')'),
    ]
    const expected: ExprToken[] = [
      openingParenthesis('('),
      relationToken(''),
      closingParenthesis(')'),
      naturalJoin('*'),
      openingParenthesis('('),
      relationToken(''),
      closingParenthesis(')'),
    ]
    // act - input is changed inside the function
    exprParser.assertValidInfixTokens(input, false, [])
    // assert
    assertTokenArray(input, expected)
  })
})

describe('toRPN', () => {
  test('Auto', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('Auto(selection)', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      selection('(selection)'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      selection('(selection)'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('Auto(selection)[projection]', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      selection('(selection)'),
      projection('[projection]'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      selection('(selection)'),
      projection('[projection]'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('Auto*Majitel', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      naturalJoin('*'),
      relationToken('Majitel'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      naturalJoin('*'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('Auto*Majitel*Majitel', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      naturalJoin('*'),
      relationToken('Majitel'),
      naturalJoin('*'),
      relationToken('Majitel'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      naturalJoin('*'),
      relationToken('Majitel'),
      naturalJoin('*'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('Auto\\Majitel*Majitel', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      difference('\\'),
      relationToken('Majitel'),
      naturalJoin('*'),
      relationToken('Majitel'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      relationToken('Majitel'),
      naturalJoin('*'),
      difference('\\'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('Auto\\(Majitel*Majitel)', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      difference('\\'),
      openingParenthesis('('),
      relationToken('Majitel'),
      naturalJoin('*'),
      relationToken('Majitel'),
      closingParenthesis(')'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      relationToken('Majitel'),
      naturalJoin('*'),
      difference('\\'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('(Auto\\Majitel)*Majitel', () => {
    // arrange
    const input: ExprToken[] = [
      openingParenthesis('('),
      relationToken('Auto'),
      difference('\\'),
      relationToken('Majitel'),
      closingParenthesis(')'),
      naturalJoin('*'),
      relationToken('Majitel'),
    ]
    const expected: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      difference('\\'),
      relationToken('Majitel'),
      naturalJoin('*'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })

  test('A*B\\C', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('A'),
      naturalJoin('*'),
      relationToken('B'),
      difference('\\'),
      relationToken('C'),
    ]
    const expected: ExprToken[] = [
      relationToken('A'),
      relationToken('B'),
      naturalJoin('*'),
      relationToken('C'),
      difference('\\'),
    ]
    // act
    const actual: ExprToken[] = exprParser.toRPN(input)
    // assert
    assertTokenArray(actual, expected)
  })
})

describe('rpnToRATree', () => {
  test('Auto', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
    ]
    const expected: RATreeNode = new RelationNode(auto)
    // act
    const actual: RATreeNode = exprParser.rpnToRATree(input, true)
    // assert
    expect(actual.printInLine()).toStrictEqual(expected.printInLine())
  })

  test('Auto*Majitel', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      naturalJoin('*'),
    ]
    const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
            new RelationNode(auto),
            new RelationNode(majitel)
    )
    // act
    const actual: RATreeNode = exprParser.rpnToRATree(input, true)
    // assert
    expect(actual.printInLine()).toStrictEqual(expected.printInLine())
  })

  test('(Auto*Majitel)*Auto', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      relationToken('Majitel'),
      naturalJoin('*'),
      relationToken('Auto'),
      naturalJoin('*'),
    ]
    const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
            new NaturalJoinNode(NaturalJoinType.natural,
                new RelationNode(auto),
                new RelationNode(majitel)
            ),
            new RelationNode(auto)
    )
    // act
    const actual: RATreeNode = exprParser.rpnToRATree(input, true)
    // assert
    expect(actual.printInLine()).toStrictEqual(expected.printInLine())
  })

  test('Auto(Id = 1)[Id]', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      selection('(Id = 1)'),
      projection('[Id]'),
    ]
    const expected: RATreeNode = new ProjectionNode(IndexedString.new('[Id]'),
            new SelectionNode(IndexedString.new('(Id = 1)'),
                new RelationNode(auto), true))
    // act
    const actual: RATreeNode = exprParser.rpnToRATree(input, true)
    // assert
    expect(actual.printInLine()).toStrictEqual(expected.printInLine())
  })

  test('Auto(Id = 1)[Id]*Majitel(Id = 1)[Id]', () => {
    // arrange
    const input: ExprToken[] = [
      relationToken('Auto'),
      selection('(Id = 1)'),
      projection('[Id]'),
      relationToken('Majitel'),
      selection('(Id = 1)'),
      projection('[Id]'),
      naturalJoin('*'),
    ]
    const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
            new ProjectionNode(IndexedString.new('[Id]'),
                new SelectionNode(IndexedString.new('(Id = 1)'),
                    new RelationNode(auto), true)),
            new ProjectionNode(IndexedString.new('[Id]'),
                new SelectionNode(IndexedString.new('(Id = 1)'),
                    new RelationNode(majitel), true))
    )
    // act
    const actual: RATreeNode = exprParser.rpnToRATree(input, true)
    // assert
    expect(actual.printInLine()).toStrictEqual(expected.printInLine())
  })
})

describe('parse and indexedParse', () => {
  describe('valid expression parsed correctly', () => {
    test('Auto', () => {
      const input = 'Auto'
      const expected: RATreeNode = new RelationNode(auto)

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto\t[Kola]', () => {
      const input = 'Auto\t[Kola]'
      const expected: RATreeNode = new ProjectionNode(IndexedString.new('[Kola]'),
                new RelationNode(auto))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto< Kola -> PocetKol >', () => {
      const input = 'Auto< Kola -> PocetKol >'
      const expected: RATreeNode = new RenameNode(IndexedString.new('< Kola -> PocetKol >'),
                new RelationNode(auto))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto[Kola\t\n]< Kola -> PocetKol >', () => {
      const input = 'Auto[Kola\t\n]< Kola -> PocetKol >'
      const expected: RATreeNode = new RenameNode(IndexedString.new('< Kola -> PocetKol >'),
                new ProjectionNode(IndexedString.new('[Kola\t\n]'),
                    new RelationNode(auto)))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto\n\t*\nMajitel', () => {
      const input = 'Auto\n\t*\nMajitel'
      const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto[Kola]*Majitel< Id -> MajitelId >', () => {
      const input = 'Auto[Kola]*Majitel< Id -> MajitelId >'
      const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
                new ProjectionNode(IndexedString.new('[Kola]'),
                    new RelationNode(auto)),
                new RenameNode(IndexedString.new('< Id -> MajitelId >'),
                    new RelationNode(majitel)))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto <* Majitel', () => {
      const input = 'Auto <* Majitel'
      const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.leftSemi,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto *> Majitel', () => {
      const input = 'Auto *> Majitel'
      const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.rightSemi,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto \u22b3 Majitel', () => {
      const input = 'Auto \u22b3 Majitel'
      const expected: RATreeNode = new AntijoinNode(AntijoinType.left,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto \u22b2 Majitel', () => {
      const input = 'Auto \u22b2 Majitel'
      const expected: RATreeNode = new AntijoinNode(AntijoinType.right,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto \u00f7 Majitel', () => {
      const input = 'Auto \u00f7 Majitel'
      const expected: RATreeNode = new DivisionNode(
                new RelationNode(auto),
                new RelationNode(majitel), undefined)

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto *L* Majitel', () => {
      const input = 'Auto *L* Majitel'
      const expected: RATreeNode = new OuterJoinNode(OuterJoinType.left,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto *R* Majitel', () => {
      const input = 'Auto *R* Majitel'
      const expected: RATreeNode = new OuterJoinNode(OuterJoinType.right,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto *F* Majitel', () => {
      const input = 'Auto *F* Majitel'
      const expected: RATreeNode = new OuterJoinNode(OuterJoinType.full,
                new RelationNode(auto),
                new RelationNode(majitel))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto\n\t*\nMajitel< Id->Majitel > *Auto(Name == "Skoda \\"dobra :)\\"")', () => {
      const input = 'Auto\n\t*\nMajitel< Id->Majitel > *Auto(Name == "Skoda \\"dobra :)\\"")'
      const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
                new NaturalJoinNode(NaturalJoinType.natural,
                    new RelationNode(auto),
                    new RenameNode(IndexedString.new('< Id->Majitel >'),
                        new RelationNode(majitel))),
                new SelectionNode(IndexedString.new('(Name == "Skoda \\"dobra :)\\"")'),
                    new RelationNode(auto), true))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto(Id == 1)', () => {
      const input = 'Auto(Id == 1)'
      const expected: RATreeNode
                = new SelectionNode(IndexedString.new('(Id == 1)'),
                    new RelationNode(auto), true)

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })

    test('Auto*(Auto*Auto)', () => {
      const input = 'Auto*(Auto*Auto)'
      const expected: RATreeNode
                = new NaturalJoinNode(NaturalJoinType.natural,
                    new RelationNode(auto),
                    new NaturalJoinNode(NaturalJoinType.natural,
                        new RelationNode(auto),
                        new RelationNode(auto)))

      const actualIndexed: RATreeNode = exprParser.parse(input)
      expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine())
    })
  })
})
