import ValueParser from "../valueParser"
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
    ValueToken
} from "../valueTokens";
import {ComparingOperator, ComparingOperatorType} from "../../vetree/comparingOperator";
import {ComputingOperator} from "../../vetree/computingOperator";
import {LiteralValue} from "../../vetree/literalValue";
import {LogicalOperator} from "../../vetree/logicalOperator";
import {ReferenceValue} from "../../vetree/referenceValue";
import {VETreeNode} from "../../vetree/veTreeNode";
import {IndexedString} from "../../tools/indexedString";

describe('parseTokens', () => {
    describe('parses valid string correctly', () => {
        test('(5 + Column > 10)', () => {
            const str: string = '(5 + Column > 10)';
            const expected: ValueToken[] = [];
            expected.push(new OpeningParentheses('('));
            expected.push(new LiteralToken("5", 5, "number"));
            expected.push(new ComputingPlusToken('+'));
            expected.push(new ReferenceToken('Column'));
            expected.push(new ComparingToken(ComparingOperatorType.more, '>'));
            expected.push(new LiteralToken("10", 10, "number"));
            expected.push(new ClosingParentheses(')'));

            const actual: ValueToken[] = ValueParser.parseTokens(str, true, true);
            expect(actual).toStrictEqual(expected);
        });

        test("!(Column * 3 <= 4.5 && Name == \"Lukas \\\".55\") || Id != null", () => {
            const str: string = "!(Column * 3 <= 4.5 && Name == \"Lukas \\\".55\") || Id != null";
            const expected: ValueToken[] = [];
            expected.push(new LogicalNotToken('!'));
            expected.push(new OpeningParentheses('('));
            expected.push(new ReferenceToken('Column'));
            expected.push(new ComputingMultiplicationToken('*'));
            expected.push(new LiteralToken("3", 3, "number"));
            expected.push(new ComparingToken(ComparingOperatorType.lessOrEqual, '<='));
            expected.push(new LiteralToken("4.5", 4.5, "number"));
            expected.push(new LogicalAndToken('&&'));
            expected.push(new ReferenceToken('Name'));
            expected.push(new ComparingToken(ComparingOperatorType.equal, '=='));
            expected.push(new LiteralToken("Lukas \\\".55", "Lukas \\\".55", "string"));
            expected.push(new ClosingParentheses(')'));
            expected.push(new LogicalOrToken('||'));
            expected.push(new ReferenceToken('Id'));
            expected.push(new ComparingToken(ComparingOperatorType.nonEqual, '!='));
            expected.push(new LiteralToken("null", null, "null"));

            const actual: ValueToken[] = ValueParser.parseTokens(str, true, true);
            expect(actual).toStrictEqual(expected);
        });

        test('!false && Column == 5', () => {
            const str: string = '!false && Column == 5';
            const expected: ValueToken[] = [];
            expected.push(new LogicalNotToken('!'));
            expected.push(new LiteralToken("false", false, "boolean"));
            expected.push(new LogicalAndToken('&&'));
            expected.push(new ReferenceToken('Column'));
            expected.push(new ComparingToken(ComparingOperatorType.equal, '=='));
            expected.push(new LiteralToken("5", 5, "number"));

            const actual: ValueToken[] = ValueParser.parseTokens(str, true, true);
            expect(actual).toStrictEqual(expected);
        });

        test('(Id = )', () => {
            const str: string = '(Id = )';
            const expected: ValueToken[] = [];
            expected.push(new OpeningParentheses('('));
            expected.push(new ReferenceToken('Id'));
            expected.push(new ComparingToken(ComparingOperatorType.equal, '='));
            expected.push(new ClosingParentheses(')'));

            const actual: ValueToken[] = ValueParser.parseTokens(str, true, true);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe('parses valid indexed string correctly', () => {
        test('(5 + Column > 10)', () => {
            const str: string = '(5 + Column > 10)';
            const expected: ValueToken[] = [];
            expected.push(new OpeningParentheses(IndexedString.new('(', NaN)));
            expected.push(new LiteralToken(IndexedString.new("5", NaN), 5, "number"));
            expected.push(new ComputingPlusToken(IndexedString.new('+', NaN)));
            expected.push(new ReferenceToken(IndexedString.new('Column', NaN)));
            expected.push(new ComparingToken(ComparingOperatorType.more, IndexedString.new('>', NaN)));
            expected.push(new LiteralToken(IndexedString.new("10", NaN), 10, "number"));
            expected.push(new ClosingParentheses(IndexedString.new(')', NaN)));

            const actual: ValueToken[] = ValueParser.parseTokens(IndexedString.new(str, NaN), true, true);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe('invalid string throws error', () => {
        test('(Column < 5.5.)', () => {
            const str: string = '(Column < 5.5.)';
            expect(() => ValueParser.parseTokens(str, true, true)).toThrow();
        });

        test('(Column < 5.5 && ?)', () => {
            const str: string = '(Column < 5.5 && ?)';
            expect(() => ValueParser.parseTokens(str, true, true)).toThrow();
        });
    });
});

describe('simplify', () => {
    test('!!true => true', () => {
        const input: ValueToken[] = [];
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LiteralToken('true', true, 'boolean'));
        const expected: ValueToken[] = [];
        expected.push(new LiteralToken('true', true, 'boolean'));

        const actual: ValueToken[] = ValueParser.simplify(input);
        expect(actual).toStrictEqual(expected);
    });

    test('!!!true => !true', () => {
        const input: ValueToken[] = [];
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LiteralToken('true', true, 'boolean'));
        const expected: ValueToken[] = [];
        expected.push(new LogicalNotToken('!'));
        expected.push(new LiteralToken('true', true, 'boolean'));

        const actual: ValueToken[] = ValueParser.simplify(input);
        expect(actual).toStrictEqual(expected);
    });

    test('!!!!true => true', () => {
        const input: ValueToken[] = [];
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LiteralToken('true', true, 'boolean'));
        const expected: ValueToken[] = [];
        expected.push(new LiteralToken('true', true, 'boolean'));

        const actual: ValueToken[] = ValueParser.simplify(input);
        expect(actual).toStrictEqual(expected);
    });

    test('!a && (b || !!c) => !a && (b || c)', () => {
        const input: ValueToken[] = [];
        input.push(new LogicalNotToken('!'));
        input.push(new ReferenceToken('a'));
        input.push(new LogicalAndToken('&&'));
        input.push(new OpeningParentheses('('));
        input.push(new ReferenceToken('b'));
        input.push(new LogicalOrToken('||'));
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalNotToken('!'));
        input.push(new LogicalAndToken('c'));
        input.push(new ClosingParentheses(')'));
        const expected: ValueToken[] = [];
        expected.push(new LogicalNotToken('!'));
        expected.push(new ReferenceToken('a'));
        expected.push(new LogicalAndToken('&&'));
        expected.push(new OpeningParentheses('('));
        expected.push(new ReferenceToken('b'));
        expected.push(new LogicalOrToken('||'));
        expected.push(new LogicalAndToken('c'));
        expected.push(new ClosingParentheses(')'));

        const actual: ValueToken[] = ValueParser.simplify(input);
        expect(actual).toStrictEqual(expected);
    });
});

describe('toRPN', () => {
    describe('transforms valid token array correctly', () => {
        test('5 + 4', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("4", 4, "number"));
            const expected: ValueToken[] = [];
            expected.push(new LiteralToken("5", 5, "number"));
            expected.push(new LiteralToken("4", 4, "number"));
            expected.push(new ComputingPlusToken('+'));

            const actual: ValueToken[] = ValueParser.toRPN(input);
            expect(actual).toStrictEqual(expected);
        });

        test('5 + 4 * 2', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("4", 4, "number"));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("2", 2, "number"));
            const expected: ValueToken[] = [];
            expected.push(new LiteralToken("5", 5, "number"));
            expected.push(new LiteralToken("4", 4, "number"));
            expected.push(new LiteralToken("2", 2, "number"));
            expected.push(new ComputingMultiplicationToken('*'));
            expected.push(new ComputingPlusToken('+'));

            const actual: ValueToken[] = ValueParser.toRPN(input);
            expect(actual).toStrictEqual(expected);
        });

        test('(5 + 4) * 2', () => {
            const input: ValueToken[] = [];
            input.push(new OpeningParentheses('('));
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("4", 4, "number"));
            input.push(new ClosingParentheses(')'));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("2", 2, "number"));
            const expected: ValueToken[] = [];
            expected.push(new LiteralToken("5", 5, "number"));
            expected.push(new LiteralToken("4", 4, "number"));
            expected.push(new ComputingPlusToken('+'));
            expected.push(new LiteralToken("2", 2, "number"));
            expected.push(new ComputingMultiplicationToken('*'));

            const actual: ValueToken[] = ValueParser.toRPN(input);
            expect(actual).toStrictEqual(expected);
        });

        test('5 + 3 * 6 - ( 5 / 3 ) + 7', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("6", 6, "number"));
            input.push(new ComputingMinusToken('-'));
            input.push(new OpeningParentheses('('));
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingDivisionToken('/'));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new ClosingParentheses(')'));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("7", 7, "number"));
            const expected: ValueToken[] = [];
            expected.push(new LiteralToken("5", 5, "number"));
            expected.push(new LiteralToken("3", 3, "number"));
            expected.push(new LiteralToken("6", 6, "number"));
            expected.push(new ComputingMultiplicationToken('*'));
            expected.push(new ComputingPlusToken('+'));
            expected.push(new LiteralToken("5", 5, "number"));
            expected.push(new LiteralToken("3", 3, "number"));
            expected.push(new ComputingDivisionToken('/'));
            expected.push(new ComputingMinusToken('-'));
            expected.push(new LiteralToken("7", 7, "number"));
            expected.push(new ComputingPlusToken('+'));

            const actual: ValueToken[] = ValueParser.toRPN(input);
            expect(actual).toStrictEqual(expected);
        });

        test("!(Column * 3 <= 4.5 && Name == \"Lukas \\\".55\") || Id != null", () => {
            const input: ValueToken[] = [];
            input.push(new LogicalNotToken('!'));
            input.push(new OpeningParentheses('('));
            input.push(new ReferenceToken('Column'));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new ComparingToken(ComparingOperatorType.lessOrEqual, '<='));
            input.push(new LiteralToken("4.5", 4.5, "number"));
            input.push(new LogicalAndToken('&&'));
            input.push(new ReferenceToken('Name'));
            input.push(new ComparingToken(ComparingOperatorType.equal, '=='));
            input.push(new LiteralToken("\"Lukas \\\".55\"", "Lukas \\\".55", "string"));
            input.push(new ClosingParentheses(')'));
            input.push(new LogicalOrToken('||'));
            input.push(new ReferenceToken('Id'));
            input.push(new ComparingToken(ComparingOperatorType.nonEqual, '!='));
            input.push(new LiteralToken("null", null, "null"));
            const expected: ValueToken[] = [];
            expected.push(new ReferenceToken('Column'));
            expected.push(new LiteralToken("3", 3, "number"));
            expected.push(new ComputingMultiplicationToken('*'));
            expected.push(new LiteralToken("4.5", 4.5, "number"));
            expected.push(new ComparingToken(ComparingOperatorType.lessOrEqual, '<='));
            expected.push(new ReferenceToken('Name'));
            expected.push(new LiteralToken("\"Lukas \\\".55\"", "Lukas \\\".55", "string"));
            expected.push(new ComparingToken(ComparingOperatorType.equal, '=='));
            expected.push(new LogicalAndToken('&&'));
            expected.push(new LogicalNotToken('!'));
            expected.push(new ReferenceToken('Id'));
            expected.push(new LiteralToken("null", null, "null"));
            expected.push(new ComparingToken(ComparingOperatorType.nonEqual, '!='));
            expected.push(new LogicalOrToken('||'));

            const actual: ValueToken[] = ValueParser.toRPN(input);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe('invalid array throws error', () => {
        test('5 + 4) * 2', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("4", 4, "number"));
            input.push(new ClosingParentheses(')'));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("2", 2, "number"));

            expect(() => ValueParser.toRPN(input)).toThrow();
        });

        test('(5 + 4 * 2', () => {
            const input: ValueToken[] = [];
            input.push(new OpeningParentheses('('));
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("4", 4, "number"));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("2", 2, "number"));

            expect(() => ValueParser.toRPN(input)).toThrow();
        });
    });
});

describe('rpnToVETree', () => {
    describe('transforms valid rpn array correctly', () => {
        test('5 4 + (infix: 5 + 4)', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new LiteralToken("4", 4, "number"));
            input.push(new ComputingPlusToken('+'));
            const expected: VETreeNode = ComputingOperator.add(
                new LiteralValue(5, "number"),
                new LiteralValue(4, "number"),
                undefined
            );

            const actual: VETreeNode = ValueParser.rpnToVETree(input);
            expect(actual).toStrictEqual(expected);
        });

        test('5 3 6 * + 5 3 / - 7 + (infix: 5 + 3 * 6 - ( 5 / 3 ) + 7)', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new LiteralToken("6", 6, "number"));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new ComputingPlusToken('+'));
            input.push(new LiteralToken("5", 5, "number"));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new ComputingDivisionToken('/'));
            input.push(new ComputingMinusToken('-'));
            input.push(new LiteralToken("7", 7, "number"));
            input.push(new ComputingPlusToken('+'));
            const expected: VETreeNode = ComputingOperator.add(
                ComputingOperator.deduct(
                    ComputingOperator.add(
                        new LiteralValue(5, "number"),
                        ComputingOperator.multiply(
                            new LiteralValue(3, "number"),
                            new LiteralValue(6, "number"),
                            undefined
                        ),
                        undefined
                    ),
                    ComputingOperator.divide(
                        new LiteralValue(5, "number"),
                        new LiteralValue(3, "number"),
                        undefined
                    ),
                    undefined
                ),
                new LiteralValue(7, "number"),
                undefined
            );

            const actual: VETreeNode = ValueParser.rpnToVETree(input);
            expect(actual).toStrictEqual(expected);
        });

        test("!(Column * 3 <= 4.5 && Name == \"Lukas \\\".55\") || Id != null", () => {
            const input: ValueToken[] = [];
            input.push(new ReferenceToken('Column'));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("4.5", 4.5, "number"));
            input.push(new ComparingToken(ComparingOperatorType.lessOrEqual, '<='));
            input.push(new ReferenceToken('Name'));
            input.push(new LiteralToken("\"Lukas \\\".55\"", "Lukas \\\".55", "string"));
            input.push(new ComparingToken(ComparingOperatorType.equal, '=='));
            input.push(new LogicalAndToken('&&'));
            input.push(new LogicalNotToken('!'));
            input.push(new ReferenceToken('Id'));
            input.push(new LiteralToken("null", null, "null"));
            input.push(new ComparingToken(ComparingOperatorType.nonEqual, '!='));
            input.push(new LogicalOrToken('||'));
            const expected: VETreeNode = LogicalOperator.or('||',
                LogicalOperator.not('!',
                    LogicalOperator.and('&&',
                        new ComparingOperator(ComparingOperatorType.lessOrEqual, '<=',
                            ComputingOperator.multiply(
                                new ReferenceValue("Column"),
                                new LiteralValue(3, "number"),
                                undefined
                            ),
                            new LiteralValue(4.5, "number")
                        ),
                        ComparingOperator.equal('==',
                            new ReferenceValue("Name"),
                            new LiteralValue("Lukas \\\".55", "string")
                        )
                    )
                ),
                ComparingOperator.nonEqual('!=',
                    new ReferenceValue('Id'),
                    new LiteralValue(null, "null")
                )
            );

            const actual: VETreeNode = ValueParser.rpnToVETree(input);
            expect(actual).toStrictEqual(expected);
        });

        test("!(Column * 3 <= 4.5) && true", () => {
            const input: ValueToken[] = [];
            input.push(new ReferenceToken('Column'));
            input.push(new LiteralToken("3", 3, "number"));
            input.push(new ComputingMultiplicationToken('*'));
            input.push(new LiteralToken("4.5", 4.5, "number"));
            input.push(new ComparingToken(ComparingOperatorType.lessOrEqual, '<='));
            input.push(new LogicalNotToken('!'));
            input.push(new LiteralToken("true", true, "boolean"));
            input.push(new LogicalAndToken('&&'));
            const expected: VETreeNode = LogicalOperator.and('&&',
                LogicalOperator.not('!',
                    new ComparingOperator(ComparingOperatorType.lessOrEqual, '<=',
                        ComputingOperator.multiply(
                            new ReferenceValue("Column"),
                            new LiteralValue(3, "number"),
                            undefined
                        ),
                        new LiteralValue(4.5, "number")
                    )
                ),
                new LiteralValue(true, "boolean")
            );

            const actual: VETreeNode = ValueParser.rpnToVETree(input);
            expect(actual).toStrictEqual(expected);
        });
    });

    describe('invalid rpn array throws error', () => {
        test('2 < 4 + (infix: (< 2) + 4)', () => {
            const input: ValueToken[] = [];
            input.push(new LiteralToken("2", 2, "number"));
            input.push(new ComparingToken(ComparingOperatorType.less, '<'));
            input.push(new LiteralToken("4", 4, "number"));
            input.push(new ComputingPlusToken('+'));

            expect(() => ValueParser.rpnToVETree(input)).toThrow();
        });

        test('Column(Column = 1) (infix: Column Column 1 =)', () => {
            const input: ValueToken[] = [];
            input.push(new ReferenceToken("Column"));
            input.push(new ReferenceToken("Column"));
            input.push(new LiteralToken("1", 1, "number"));
            input.push(new ComparingToken(ComparingOperatorType.equal, '='));

            expect(() => ValueParser.rpnToVETree(input)).toThrow();
        });
    });
});