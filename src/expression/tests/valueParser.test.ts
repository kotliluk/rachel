import { ValueParser } from '../valueParser'
import {
  ClosingParentheses,
  ComparingToken,
  ComputingDivisionToken,
  ComputingMinusToken,
  ComputingMultiplicationToken,
  ComputingPlusToken,
  LiteralToken,
  LogicalAndToken,
  LogicalNotToken,
  LogicalOrToken,
  OpeningParentheses,
  ReferenceToken,
  ValueToken,
} from '../valueTokens'
import { ComparingOperator, ComparingOperatorType } from '../../vetree/comparingOperator'
import { ComputingOperator } from '../../vetree/computingOperator'
import { LiteralValue } from '../../vetree/literalValue'
import { LogicalOperator } from '../../vetree/logicalOperator'
import { ReferenceValue } from '../../vetree/referenceValue'
import { VETreeNode } from '../../vetree/veTreeNode'
import { IndexedString } from '../../types/indexedString'
import { ColumnContent } from '../../relation/columnType'

/* TESTING TOKENS */

function closingParentheses (str: string) {
  return new ClosingParentheses(IndexedString.new(str))
}

function openingParentheses (str: string) {
  return new OpeningParentheses(IndexedString.new(str))
}

function comparingToken (type: ComparingOperatorType, str: string) {
  return new ComparingToken(type, IndexedString.new(str))
}

function computingDivisionToken (str: string) {
  return new ComputingDivisionToken(IndexedString.new(str))
}

function computingMinusToken (str: string) {
  return new ComputingMinusToken(IndexedString.new(str))
}

function computingMultiplicationToken (str: string) {
  return new ComputingMultiplicationToken(IndexedString.new(str))
}

function computingPlusToken (str: string) {
  return new ComputingPlusToken(IndexedString.new(str))
}

function literalToken (str: string, value: ColumnContent, type: 'string' | 'number' | 'boolean' | 'null') {
  return new LiteralToken(IndexedString.new(str), value, type)
}

function logicalAndToken (str: string) {
  return new LogicalAndToken(IndexedString.new(str))
}

function logicalNotToken (str: string) {
  return new LogicalNotToken(IndexedString.new(str))
}

function logicalOrToken (str: string) {
  return new LogicalOrToken(IndexedString.new(str))
}

function referenceToken (str: string) {
  return new ReferenceToken(IndexedString.new(str))
}

/**
 * Asserts equality of string representations of tokens in given arrays.
 */
function assertTokenArray (actual: ValueToken[], expected: ValueToken[]) {
  expect(actual.length).toBe(expected.length)
  actual.forEach((a, i) => {
    expect(a.str.toString()).toStrictEqual(expected[i].str.toString())
  })
}

describe('ValueParser (group: #expression)', () => {
  describe('parseTokens', () => {
    describe('parses valid string correctly', () => {
      test('(5 + Column > 10)', () => {
        const str = '(5 + Column > 10)'
        const expected: ValueToken[] = []
        expected.push(openingParentheses('('))
        expected.push(literalToken('5', 5, 'number'))
        expected.push(computingPlusToken('+'))
        expected.push(referenceToken('Column'))
        expected.push(comparingToken(ComparingOperatorType.more, '>'))
        expected.push(literalToken('10', 10, 'number'))
        expected.push(closingParentheses(')'))

        const actual: ValueToken[] = ValueParser.parseTokens(IndexedString.new(str), true, true)
        assertTokenArray(actual, expected)
      })

      test('!(Column * 3 <= 4.5 && Name == "Lukas \\".55") || Id != null', () => {
        const str = '!(Column * 3 <= 4.5 && Name == "Lukas \\".55") || Id != null'
        const expected: ValueToken[] = []
        expected.push(logicalNotToken('!'))
        expected.push(openingParentheses('('))
        expected.push(referenceToken('Column'))
        expected.push(computingMultiplicationToken('*'))
        expected.push(literalToken('3', 3, 'number'))
        expected.push(comparingToken(ComparingOperatorType.lessOrEqual, '<='))
        expected.push(literalToken('4.5', 4.5, 'number'))
        expected.push(logicalAndToken('&&'))
        expected.push(referenceToken('Name'))
        expected.push(comparingToken(ComparingOperatorType.equal, '=='))
        expected.push(literalToken('Lukas \\".55', 'Lukas \\".55', 'string'))
        expected.push(closingParentheses(')'))
        expected.push(logicalOrToken('||'))
        expected.push(referenceToken('Id'))
        expected.push(comparingToken(ComparingOperatorType.nonEqual, '!='))
        expected.push(literalToken('null', null, 'null'))

        const actual: ValueToken[] = ValueParser.parseTokens(IndexedString.new(str), true, true)
        assertTokenArray(actual, expected)
      })

      test('!false && Column == 5', () => {
        const str = '!false && Column == 5'
        const expected: ValueToken[] = []
        expected.push(logicalNotToken('!'))
        expected.push(literalToken('false', false, 'boolean'))
        expected.push(logicalAndToken('&&'))
        expected.push(referenceToken('Column'))
        expected.push(comparingToken(ComparingOperatorType.equal, '=='))
        expected.push(literalToken('5', 5, 'number'))

        const actual: ValueToken[] = ValueParser.parseTokens(IndexedString.new(str), true, true)
        assertTokenArray(actual, expected)
      })

      test('(Id = )', () => {
        const str = '(Id = )'
        const expected: ValueToken[] = []
        expected.push(openingParentheses('('))
        expected.push(referenceToken('Id'))
        expected.push(comparingToken(ComparingOperatorType.equal, '='))
        expected.push(closingParentheses(')'))

        const actual: ValueToken[] = ValueParser.parseTokens(IndexedString.new(str), true, true)
        assertTokenArray(actual, expected)
      })
    })

    describe('invalid string throws error', () => {
      test('(Column < 5.5.)', () => {
        const str = '(Column < 5.5.)'
        expect(() => ValueParser.parseTokens(IndexedString.new(str), true, true)).toThrow()
      })

      test('(Column < 5.5 && ?)', () => {
        const str = '(Column < 5.5 && ?)'
        expect(() => ValueParser.parseTokens(IndexedString.new(str), true, true)).toThrow()
      })

      test('(Column < 5.5 && A == "string over\nmore lines")', () => {
        const str = '(Column < 5.5 && ?)'
        expect(() => ValueParser.parseTokens(IndexedString.new(str), true, true)).toThrow()
      })
    })
  })

  describe('simplify', () => {
    test('!!true => true', () => {
      const input: ValueToken[] = []
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(literalToken('true', true, 'boolean'))
      const expected: ValueToken[] = []
      expected.push(literalToken('true', true, 'boolean'))

      const actual: ValueToken[] = ValueParser.simplify(input)
      assertTokenArray(actual, expected)
    })

    test('!!!true => !true', () => {
      const input: ValueToken[] = []
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(literalToken('true', true, 'boolean'))
      const expected: ValueToken[] = []
      expected.push(logicalNotToken('!'))
      expected.push(literalToken('true', true, 'boolean'))

      const actual: ValueToken[] = ValueParser.simplify(input)
      assertTokenArray(actual, expected)
    })

    test('!!!!true => true', () => {
      const input: ValueToken[] = []
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(literalToken('true', true, 'boolean'))
      const expected: ValueToken[] = []
      expected.push(literalToken('true', true, 'boolean'))

      const actual: ValueToken[] = ValueParser.simplify(input)
      assertTokenArray(actual, expected)
    })

    test('!a && (b || !!c) => !a && (b || c)', () => {
      const input: ValueToken[] = []
      input.push(logicalNotToken('!'))
      input.push(referenceToken('a'))
      input.push(logicalAndToken('&&'))
      input.push(openingParentheses('('))
      input.push(referenceToken('b'))
      input.push(logicalOrToken('||'))
      input.push(logicalNotToken('!'))
      input.push(logicalNotToken('!'))
      input.push(logicalAndToken('c'))
      input.push(closingParentheses(')'))
      const expected: ValueToken[] = []
      expected.push(logicalNotToken('!'))
      expected.push(referenceToken('a'))
      expected.push(logicalAndToken('&&'))
      expected.push(openingParentheses('('))
      expected.push(referenceToken('b'))
      expected.push(logicalOrToken('||'))
      expected.push(logicalAndToken('c'))
      expected.push(closingParentheses(')'))

      const actual: ValueToken[] = ValueParser.simplify(input)
      assertTokenArray(actual, expected)
    })
  })

  describe('toRPN', () => {
    describe('transforms valid token array correctly', () => {
      test('5 + 4', () => {
        const input: ValueToken[] = []
        input.push(literalToken('5', 5, 'number'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('4', 4, 'number'))
        const expected: ValueToken[] = []
        expected.push(literalToken('5', 5, 'number'))
        expected.push(literalToken('4', 4, 'number'))
        expected.push(computingPlusToken('+'))

        const actual: ValueToken[] = ValueParser.toRPN(input)
        assertTokenArray(actual, expected)
      })

      test('5 + 4 * 2', () => {
        const input: ValueToken[] = []
        input.push(literalToken('5', 5, 'number'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('4', 4, 'number'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('2', 2, 'number'))
        const expected: ValueToken[] = []
        expected.push(literalToken('5', 5, 'number'))
        expected.push(literalToken('4', 4, 'number'))
        expected.push(literalToken('2', 2, 'number'))
        expected.push(computingMultiplicationToken('*'))
        expected.push(computingPlusToken('+'))

        const actual: ValueToken[] = ValueParser.toRPN(input)
        assertTokenArray(actual, expected)
      })

      test('(5 + 4) * 2', () => {
        const input: ValueToken[] = []
        input.push(openingParentheses('('))
        input.push(literalToken('5', 5, 'number'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('4', 4, 'number'))
        input.push(closingParentheses(')'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('2', 2, 'number'))
        const expected: ValueToken[] = []
        expected.push(literalToken('5', 5, 'number'))
        expected.push(literalToken('4', 4, 'number'))
        expected.push(computingPlusToken('+'))
        expected.push(literalToken('2', 2, 'number'))
        expected.push(computingMultiplicationToken('*'))

        const actual: ValueToken[] = ValueParser.toRPN(input)
        assertTokenArray(actual, expected)
      })

      test('5 + 3 * 6 - ( 5 / 3 ) + 7', () => {
        const input: ValueToken[] = []
        input.push(literalToken('5', 5, 'number'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('3', 3, 'number'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('6', 6, 'number'))
        input.push(computingMinusToken('-'))
        input.push(openingParentheses('('))
        input.push(literalToken('5', 5, 'number'))
        input.push(computingDivisionToken('/'))
        input.push(literalToken('3', 3, 'number'))
        input.push(closingParentheses(')'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('7', 7, 'number'))
        const expected: ValueToken[] = []
        expected.push(literalToken('5', 5, 'number'))
        expected.push(literalToken('3', 3, 'number'))
        expected.push(literalToken('6', 6, 'number'))
        expected.push(computingMultiplicationToken('*'))
        expected.push(computingPlusToken('+'))
        expected.push(literalToken('5', 5, 'number'))
        expected.push(literalToken('3', 3, 'number'))
        expected.push(computingDivisionToken('/'))
        expected.push(computingMinusToken('-'))
        expected.push(literalToken('7', 7, 'number'))
        expected.push(computingPlusToken('+'))

        const actual: ValueToken[] = ValueParser.toRPN(input)
        assertTokenArray(actual, expected)
      })

      test('!(Column * 3 <= 4.5 && Name == "Lukas \\".55") || Id != null', () => {
        const input: ValueToken[] = []
        input.push(logicalNotToken('!'))
        input.push(openingParentheses('('))
        input.push(referenceToken('Column'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('3', 3, 'number'))
        input.push(comparingToken(ComparingOperatorType.lessOrEqual, '<='))
        input.push(literalToken('4.5', 4.5, 'number'))
        input.push(logicalAndToken('&&'))
        input.push(referenceToken('Name'))
        input.push(comparingToken(ComparingOperatorType.equal, '=='))
        input.push(literalToken('"Lukas \\".55"', 'Lukas \\".55', 'string'))
        input.push(closingParentheses(')'))
        input.push(logicalOrToken('||'))
        input.push(referenceToken('Id'))
        input.push(comparingToken(ComparingOperatorType.nonEqual, '!='))
        input.push(literalToken('null', null, 'null'))
        const expected: ValueToken[] = []
        expected.push(referenceToken('Column'))
        expected.push(literalToken('3', 3, 'number'))
        expected.push(computingMultiplicationToken('*'))
        expected.push(literalToken('4.5', 4.5, 'number'))
        expected.push(comparingToken(ComparingOperatorType.lessOrEqual, '<='))
        expected.push(referenceToken('Name'))
        expected.push(literalToken('"Lukas \\".55"', 'Lukas \\".55', 'string'))
        expected.push(comparingToken(ComparingOperatorType.equal, '=='))
        expected.push(logicalAndToken('&&'))
        expected.push(logicalNotToken('!'))
        expected.push(referenceToken('Id'))
        expected.push(literalToken('null', null, 'null'))
        expected.push(comparingToken(ComparingOperatorType.nonEqual, '!='))
        expected.push(logicalOrToken('||'))

        const actual: ValueToken[] = ValueParser.toRPN(input)
        assertTokenArray(actual, expected)
      })
    })

    describe('invalid array throws error', () => {
      test('5 + 4) * 2', () => {
        const input: ValueToken[] = []
        input.push(literalToken('5', 5, 'number'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('4', 4, 'number'))
        input.push(closingParentheses(')'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('2', 2, 'number'))

        expect(() => ValueParser.toRPN(input)).toThrow()
      })

      test('(5 + 4 * 2', () => {
        const input: ValueToken[] = []
        input.push(openingParentheses('('))
        input.push(literalToken('5', 5, 'number'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('4', 4, 'number'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('2', 2, 'number'))

        expect(() => ValueParser.toRPN(input)).toThrow()
      })
    })
  })

  describe('rpnToVETree', () => {
    describe('transforms valid rpn array correctly', () => {
      test('5 4 + (infix: 5 + 4)', () => {
        const input: ValueToken[] = []
        input.push(literalToken('5', 5, 'number'))
        input.push(literalToken('4', 4, 'number'))
        input.push(computingPlusToken('+'))
        const expected: VETreeNode = ComputingOperator.add(
          new LiteralValue(5, 'number'),
          new LiteralValue(4, 'number'),
          undefined
        )

        const actual: VETreeNode = ValueParser.rpnToVETree(input)
        expect(actual.toString()).toStrictEqual(expected.toString())
      })

      test('5 3 6 * + 5 3 / - 7 + (infix: 5 + 3 * 6 - ( 5 / 3 ) + 7)', () => {
        const input: ValueToken[] = []
        input.push(literalToken('5', 5, 'number'))
        input.push(literalToken('3', 3, 'number'))
        input.push(literalToken('6', 6, 'number'))
        input.push(computingMultiplicationToken('*'))
        input.push(computingPlusToken('+'))
        input.push(literalToken('5', 5, 'number'))
        input.push(literalToken('3', 3, 'number'))
        input.push(computingDivisionToken('/'))
        input.push(computingMinusToken('-'))
        input.push(literalToken('7', 7, 'number'))
        input.push(computingPlusToken('+'))
        const expected: VETreeNode = ComputingOperator.add(
          ComputingOperator.deduct(
            ComputingOperator.add(
              new LiteralValue(5, 'number'),
              ComputingOperator.multiply(
                new LiteralValue(3, 'number'),
                new LiteralValue(6, 'number'),
                undefined
              ),
              undefined
            ),
            ComputingOperator.divide(
              new LiteralValue(5, 'number'),
              new LiteralValue(3, 'number'),
              undefined
            ),
            undefined
          ),
          new LiteralValue(7, 'number'),
          undefined
        )

        const actual: VETreeNode = ValueParser.rpnToVETree(input)
        expect(actual.toString()).toStrictEqual(expected.toString())
      })

      test('!(Column * 3 <= 4.5 && Name == "Lukas \\".55") || Id != null', () => {
        const input: ValueToken[] = []
        input.push(referenceToken('Column'))
        input.push(literalToken('3', 3, 'number'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('4.5', 4.5, 'number'))
        input.push(comparingToken(ComparingOperatorType.lessOrEqual, '<='))
        input.push(referenceToken('Name'))
        input.push(literalToken('"Lukas \\".55"', 'Lukas \\".55', 'string'))
        input.push(comparingToken(ComparingOperatorType.equal, '=='))
        input.push(logicalAndToken('&&'))
        input.push(logicalNotToken('!'))
        input.push(referenceToken('Id'))
        input.push(literalToken('null', null, 'null'))
        input.push(comparingToken(ComparingOperatorType.nonEqual, '!='))
        input.push(logicalOrToken('||'))
        const expected: VETreeNode = LogicalOperator.or(IndexedString.new('||'),
          LogicalOperator.not(IndexedString.new('!'),
            LogicalOperator.and(IndexedString.new('&&'),
              new ComparingOperator(ComparingOperatorType.lessOrEqual, IndexedString.new('<='),
                ComputingOperator.multiply(
                  new ReferenceValue(IndexedString.new('Column')),
                  new LiteralValue(3, 'number'),
                  undefined
                ),
                new LiteralValue(4.5, 'number')
              ),
              ComparingOperator.equal(IndexedString.new('=='),
                new ReferenceValue(IndexedString.new('Name')),
                new LiteralValue('Lukas \\".55', 'string')
              )
            )
          ),
          ComparingOperator.nonEqual(IndexedString.new('!='),
            new ReferenceValue(IndexedString.new('Id')),
            new LiteralValue(null, 'null')
          )
        )

        const actual: VETreeNode = ValueParser.rpnToVETree(input)
        expect(actual.toString()).toStrictEqual(expected.toString())
      })

      test('!(Column * 3 <= 4.5) && true', () => {
        const input: ValueToken[] = []
        input.push(referenceToken('Column'))
        input.push(literalToken('3', 3, 'number'))
        input.push(computingMultiplicationToken('*'))
        input.push(literalToken('4.5', 4.5, 'number'))
        input.push(comparingToken(ComparingOperatorType.lessOrEqual, '<='))
        input.push(logicalNotToken('!'))
        input.push(literalToken('true', true, 'boolean'))
        input.push(logicalAndToken('&&'))
        const expected: VETreeNode = LogicalOperator.and(IndexedString.new('&&'),
          LogicalOperator.not(IndexedString.new('!'),
            new ComparingOperator(ComparingOperatorType.lessOrEqual, IndexedString.new('<='),
              ComputingOperator.multiply(
                new ReferenceValue(IndexedString.new('Column')),
                new LiteralValue(3, 'number'),
                undefined
              ),
              new LiteralValue(4.5, 'number')
            )
          ),
          new LiteralValue(true, 'boolean')
        )

        const actual: VETreeNode = ValueParser.rpnToVETree(input)
        expect(actual.toString()).toStrictEqual(expected.toString())
      })
    })

    describe('invalid rpn array throws error', () => {
      test('2 < 4 + (infix: (< 2) + 4)', () => {
        const input: ValueToken[] = []
        input.push(literalToken('2', 2, 'number'))
        input.push(comparingToken(ComparingOperatorType.less, '<'))
        input.push(literalToken('4', 4, 'number'))
        input.push(computingPlusToken('+'))

        expect(() => ValueParser.rpnToVETree(input)).toThrow()
      })

      test('Column(Column = 1) (infix: Column Column 1 =)', () => {
        const input: ValueToken[] = []
        input.push(referenceToken('Column'))
        input.push(referenceToken('Column'))
        input.push(literalToken('1', 1, 'number'))
        input.push(comparingToken(ComparingOperatorType.equal, '='))

        expect(() => ValueParser.rpnToVETree(input)).toThrow()
      })
    })
  })
})
