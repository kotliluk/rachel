import Relation from "../../relation/relation";
import {
    UnaryOperatorToken,
    BinaryOperatorToken,
    ClosingParentheses,
    OpeningParentheses,
    ExprToken,
    RelationToken
} from "../exprTokens";
import {ExprParser} from "../exprParser";
import RATreeNode from "../../ratree/raTreeNode";
import RelationNode from "../../ratree/relationNode";
import ProjectionNode from "../../ratree/projectionNode";
import SelectionNode from "../../ratree/selectionNode";
import RenameNode from "../../ratree/renameNode";
import NaturalJoinNode, {NaturalJoinType} from "../../ratree/naturalJoinNode";
import AntijoinNode, {AntijoinType} from "../../ratree/antijoinNode";
import DivisionNode from "../../ratree/divisionNode";
import OuterJoinNode, {OuterJoinType} from "../../ratree/outerJoinNode";

enum AssertType {
    NOT_THROW,
    THROW_STRICT,
    THROW_NOT_STRICT
}

const relations: Map<string, Relation> = new Map<string, Relation>();
const auto: Relation = new Relation("Auto");
auto.addColumn("Id", "number");
auto.addColumn("Majitel", "number");
auto.addColumn("Kola", "number");
auto.addColumn("Motor", "string");
auto.addColumn("Vyrobce", "string");
auto.addColumn("Barva", "string");
relations.set("Auto", auto);
const majitel: Relation = new Relation("Majitel");
majitel.addColumn("Id", "number");
majitel.addColumn("Jmeno", "string");
majitel.addColumn("Prijmeni", "string");
majitel.addColumn("Bydliste", "string");
relations.set("Majitel", majitel);
const exprParser: ExprParser = new ExprParser(relations, true);

describe("parseTokens", () => {
    test("Auto", () => {
        // arrange
        const str: string = "Auto";
        const expected: ExprToken[] = [new RelationToken("Auto")];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto * Majitel", () => {
        // arrange
        const str: string = "Auto * Majitel";
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel")
        ];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto(Id = 1)", () => {
        // arrange
        const str: string = "Auto(Id = 1)";
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(Id = 1)")
        ];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto(Id = 1)<Id -> AutoId>", () => {
        // arrange
        const str: string = "Auto(Id = 1)<Id -> AutoId>";
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(Id = 1)"),
            UnaryOperatorToken.rename("<Id -> AutoId>")
        ];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto *F* (Auto \u2a2f Majitel)", () => {
        // arrange
        const str: string = "Auto *F* (Auto \u2a2f Majitel)";
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            BinaryOperatorToken.fullOuterJoin('*F*'),
            new OpeningParentheses('('),
            new RelationToken("Auto"),
            BinaryOperatorToken.cartesianProduct('\u2a2f'),
            new RelationToken("Majitel"),
            new ClosingParentheses(')')
        ];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test('(Auto \u00f7 Majitel)(Jmeno = "Honza")', () => {
        // arrange
        const str: string = '(Auto \u00f7 Majitel)(Jmeno = "Honza")';
        const expected: ExprToken[] = [
            new OpeningParentheses('('),
            new RelationToken("Auto"),
            BinaryOperatorToken.division('\u00f7'),
            new RelationToken("Majitel"),
            new ClosingParentheses(')'),
            UnaryOperatorToken.selection("(Jmeno = \"Honza\")")
        ];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test('A<}A{>A*F*A*L*A*R*A<*A*>A*A\u2a2fA\u222aA\u2229A\\A\u22b2A\u22b3A\u00f7A', () => {
        // arrange
        const str: string = 'A<}A{>A*F*A*L*A*R*A<*A*>A*A\u2a2fA\u222aA\u2229A\\A\u22b2A\u22b3A\u00f7A';
        const expected: ExprToken[] = [
            new RelationToken("A"),
            BinaryOperatorToken.leftThetaSemijoin('<}'),
            new RelationToken("A"),
            BinaryOperatorToken.rightThetaSemijoin('{>'),
            new RelationToken("A"),
            BinaryOperatorToken.fullOuterJoin('*F*'),
            new RelationToken("A"),
            BinaryOperatorToken.leftOuterJoin('*L*'),
            new RelationToken("A"),
            BinaryOperatorToken.rightOuterJoin('*R*'),
            new RelationToken("A"),
            BinaryOperatorToken.leftSemijoin('<*'),
            new RelationToken("A"),
            BinaryOperatorToken.rightSemijoin('*>'),
            new RelationToken("A"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("A"),
            BinaryOperatorToken.cartesianProduct('\u2a2f'),
            new RelationToken("A"),
            BinaryOperatorToken.union('\u222a'),
            new RelationToken("A"),
            BinaryOperatorToken.intersection('\u2229'),
            new RelationToken("A"),
            BinaryOperatorToken.difference('\\'),
            new RelationToken("A"),
            BinaryOperatorToken.rightAntijoin('\u22b2'),
            new RelationToken("A"),
            BinaryOperatorToken.leftAntijoin('\u22b3'),
            new RelationToken("A"),
            BinaryOperatorToken.division('\u00f7'),
            new RelationToken("A")
        ];
        // act
        const actual: ExprToken[] = exprParser.parseTokens(str);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    /*describe("distinguishes projection and theta join", () => {
        test("Auto[Id]", () => {
            // arrange
            const str: string = 'Auto[Id]';
            const expected: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("[Id]")
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });

        test("Auto[Id]Majitel", () => {
            // arrange
            const str: string = 'Auto[Id]Majitel';
            const expected: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.thetaJoin("[Id]"),
                new RelationToken("Majitel")
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });

        test("Auto[Id][Id]Majitel[Id][Id]", () => {
            // arrange
            const str: string = 'Auto[Id][Id]Majitel[Id][Id]';
            const expected: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("[Id]"),
                BinaryOperatorToken.thetaJoin("[Id]"),
                new RelationToken("Majitel"),
                UnaryOperatorToken.projection("[Id]"),
                UnaryOperatorToken.projection("[Id]")
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });

        test("(Auto[Id]Auto)[Id][Id]Majitel[Id][Id]", () => {
            // arrange
            const str: string = '(Auto[Id]Auto)[Id][Id]Majitel[Id][Id]';
            const expected: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                BinaryOperatorToken.thetaJoin("[Id]"),
                new RelationToken("Auto"),
                new ClosingParentheses(')'),
                UnaryOperatorToken.projection("[Id]"),
                BinaryOperatorToken.thetaJoin("[Id]"),
                new RelationToken("Majitel"),
                UnaryOperatorToken.projection("[Id]"),
                UnaryOperatorToken.projection("[Id]")
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });
    });*/

    describe("distinguishes parentheses and selection", () => {
        test("Auto[Id, Majitel](Id = 1)", () => {
            // arrange
            const str: string = 'Auto[Id, Majitel](Id = 1)';
            const expected: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("[Id, Majitel]"),
                UnaryOperatorToken.selection("(Id = 1)")
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });

        test("Auto[Id, Majitel]{theta join}(Auto {theta join} Majitel(selection))", () => {
            // arrange
            const str: string = 'Auto[Id, Majitel]{theta join}(Auto {theta join} Majitel(selection))';
            const expected: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("[Id, Majitel]"),
                BinaryOperatorToken.thetaJoin("{theta join}"),
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                BinaryOperatorToken.thetaJoin("{theta join}"),
                new RelationToken("Majitel"),
                UnaryOperatorToken.selection("(selection)"),
                new ClosingParentheses(')')
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });

        test("((Auto))(selection)", () => {
            // arrange
            const str: string = '((Auto))(selection)';
            const expected: ExprToken[] = [
                new OpeningParentheses('('),
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')'),
                new ClosingParentheses(')'),
                UnaryOperatorToken.selection("(selection)")
            ];
            // act
            const actual: ExprToken[] = exprParser.parseTokens(str);
            // assert
            expect(actual).toStrictEqual(expected);
        });
    });

    describe("throws when unexpected part", () => {
        test("Auto + Auto", () => {
            // arrange
            const str: string = "Auto + Auto";
            // act and assert
            expect(() => exprParser.parseTokens(str));
        });

        test("(Auto", () => {
            // arrange
            const str: string = "Auto + Auto";
            // act and assert
            expect(() => exprParser.parseTokens(str));
        });

        test("((Auto)))", () => {
            // arrange
            const str: string = "Auto + Auto";
            // act and assert
            expect(() => exprParser.parseTokens(str));
        });
    });
});

describe("assertValidInfixTokens", () => {
    describe("invalid array start (strict throws, not strict returns)", () => {
        test(")", () => {
            // arrange
            const input: ExprToken[] = [
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test(")*Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new ClosingParentheses(')'),
                BinaryOperatorToken.naturalJoin("*"),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("(Id = 1)", () => {
            // arrange
            const input: ExprToken[] = [
                UnaryOperatorToken.selection("(Id = 1)")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("(Id = 1)*Auto", () => {
            // arrange
            const input: ExprToken[] = [
                UnaryOperatorToken.selection("(Id = 1)"),
                BinaryOperatorToken.naturalJoin("*"),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });
    });

    describe("returns without error for valid (both strict and not strict)", () => {
        test("Auto[projection]", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("[projection]")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });

        test("(Auto)", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });

        test("Auto*Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*'),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });

        test("(Auto)*(Auto)", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')'),
                BinaryOperatorToken.naturalJoin('*'),
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });

        test("Auto(selection)[projection]", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("(selection)"),
                UnaryOperatorToken.projection("[projection]")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });

        test("(Auto*Auto)[projection]", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*'),
                new RelationToken("Auto"),
                new ClosingParentheses(')'),
                UnaryOperatorToken.projection("[projection]")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });

        test("(Auto[projection])", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                UnaryOperatorToken.projection("[projection]"),
                new ClosingParentheses(')'),
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).not.toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).not.toThrow();
        });
    });

    describe("throws error for invalid adjacent pair (both strict and not strict)", () => {
        test("Auto Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("(Auto) Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')'),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto(selection)Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.selection("(selection)"),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto (Auto)", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("(Auto) (Auto)", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')'),
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto(selection)(Auto)", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                UnaryOperatorToken.selection("(selection)"),
                new OpeningParentheses('('),
                new RelationToken("Auto"),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto*)", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*'),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("(*Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                BinaryOperatorToken.naturalJoin('*'),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto**Auto", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*'),
                BinaryOperatorToken.naturalJoin('*'),
                new RelationToken("Auto")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("([projection])", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                UnaryOperatorToken.projection("[projection]"),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto*[projection]", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*'),
                UnaryOperatorToken.projection("[projection]")
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });
    });

    describe("throws error for invalid end (both strict and not strict)", () => {
        test("Auto*(", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*'),
                new OpeningParentheses('(')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("Auto*", () => {
            // arrange
            const input: ExprToken[] = [
                new RelationToken("Auto"),
                BinaryOperatorToken.naturalJoin('*')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });

        test("(())", () => {
            // arrange
            const input: ExprToken[] = [
                new OpeningParentheses('('),
                new OpeningParentheses('('),
                new ClosingParentheses(')'),
                new ClosingParentheses(')')
            ];
            // assert
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_NOT_STRICT, [])).toThrow();
            expect(() => exprParser.assertValidInfixTokens(input, AssertType.THROW_STRICT, [])).toThrow();
        });
    });
});

describe("fakeValidInfixTokensForWhisper", () => {
    test("*", () => {
        // arrange
        const input: ExprToken[] = [
            BinaryOperatorToken.naturalJoin("*")
        ];
        const expected: ExprToken[] = [
            new RelationToken(""),
            BinaryOperatorToken.naturalJoin("*"),
            new RelationToken("")
        ];
        // act - input is changed inside the function
        exprParser.assertValidInfixTokens(input, AssertType.NOT_THROW, []);
        // assert
        expect(input).toStrictEqual(expected);
    });

    test("**", () => {
        // arrange
        const input: ExprToken[] = [
            BinaryOperatorToken.naturalJoin("*"),
            BinaryOperatorToken.naturalJoin("*")
        ];
        const expected: ExprToken[] = [
            new RelationToken(""),
            BinaryOperatorToken.naturalJoin("*"),
            new RelationToken(""),
            BinaryOperatorToken.naturalJoin("*"),
            new RelationToken("")
        ];
        // act - input is changed inside the function
        exprParser.assertValidInfixTokens(input, AssertType.NOT_THROW, []);
        // assert
        expect(input).toStrictEqual(expected);
    });

    test("Car Car", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Car"),
            new RelationToken("Car")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Car"),
            BinaryOperatorToken.naturalJoin("*"),
            new RelationToken("Car")
        ];
        // act - input is changed inside the function
        exprParser.assertValidInfixTokens(input, AssertType.NOT_THROW, []);
        // assert
        expect(input).toStrictEqual(expected);
    });

    test("<> Car", () => {
        // arrange
        const input: ExprToken[] = [
            UnaryOperatorToken.rename("<>"),
            new RelationToken("Car")
        ];
        const expected: ExprToken[] = [
            new RelationToken(""),
            UnaryOperatorToken.rename("<>"),
            BinaryOperatorToken.naturalJoin("*"),
            new RelationToken("Car")
        ];
        // act - input is changed inside the function
        exprParser.assertValidInfixTokens(input, AssertType.NOT_THROW, []);
        // assert
        expect(input).toStrictEqual(expected);
    });

    test("()", () => {
        // arrange
        const input: ExprToken[] = [
            new OpeningParentheses("("),
            new ClosingParentheses(")")
        ];
        const expected: ExprToken[] = [
            new OpeningParentheses("("),
            new RelationToken(""),
            new ClosingParentheses(")")
        ];
        // act - input is changed inside the function
        exprParser.assertValidInfixTokens(input, AssertType.NOT_THROW, []);
        // assert
        expect(input).toStrictEqual(expected);
    });

    test("()()", () => {
        // arrange
        const input: ExprToken[] = [
            new OpeningParentheses("("),
            new ClosingParentheses(")"),
            new OpeningParentheses("("),
            new ClosingParentheses(")")
        ];
        const expected: ExprToken[] = [
            new OpeningParentheses("("),
            new RelationToken(""),
            new ClosingParentheses(")"),
            BinaryOperatorToken.naturalJoin("*"),
            new OpeningParentheses("("),
            new RelationToken(""),
            new ClosingParentheses(")")
        ];
        // act - input is changed inside the function
        exprParser.assertValidInfixTokens(input, AssertType.NOT_THROW, []);
        // assert
        expect(input).toStrictEqual(expected);
    });
});

describe("toRPN", () => {
    test("Auto", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto")
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto(selection)", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(selection)")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(selection)")
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto(selection)[projection]", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(selection)"),
            UnaryOperatorToken.projection("[projection]")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(selection)"),
            UnaryOperatorToken.projection("[projection]")
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto*Majitel", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*')
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto*Majitel*Majitel", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*')
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto\\Majitel*Majitel", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            BinaryOperatorToken.difference('\\'),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            BinaryOperatorToken.difference('\\')
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("Auto\\(Majitel*Majitel)", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            BinaryOperatorToken.difference('\\'),
            new OpeningParentheses('('),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel"),
            new ClosingParentheses(')')
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            BinaryOperatorToken.difference('\\')
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("(Auto\\Majitel)*Majitel", () => {
        // arrange
        const input: ExprToken[] = [
            new OpeningParentheses('('),
            new RelationToken("Auto"),
            BinaryOperatorToken.difference('\\'),
            new RelationToken("Majitel"),
            new ClosingParentheses(')'),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Majitel")
        ];
        const expected: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.difference('\\'),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*')
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });

    test("A*B\\C", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("A"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("B"),
            BinaryOperatorToken.difference('\\'),
            new RelationToken("C")
        ];
        const expected: ExprToken[] = [
            new RelationToken("A"),
            new RelationToken("B"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("C"),
            BinaryOperatorToken.difference('\\')
        ];
        // act
        const actual: ExprToken[] = exprParser.toRPN(input);
        // assert
        expect(actual).toStrictEqual(expected);
    });
});

describe("rpnToRATree", () => {
    test("Auto", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto")
        ];
        const expected: RATreeNode = new RelationNode(auto);
        // act
        const actual: RATreeNode = exprParser.rpnToRATree(input, true);
        // assert
        expect(actual.printInLine()).toStrictEqual(expected.printInLine());
    });

    test("Auto*Majitel", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*')
        ];
        const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
            new RelationNode(auto),
            new RelationNode(majitel)
        )
        // act
        const actual: RATreeNode = exprParser.rpnToRATree(input, true);
        // assert
        expect(actual.printInLine()).toStrictEqual(expected.printInLine());
    });

    test("(Auto*Majitel)*Auto", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            new RelationToken("Majitel"),
            BinaryOperatorToken.naturalJoin('*'),
            new RelationToken("Auto"),
            BinaryOperatorToken.naturalJoin('*')
        ];
        const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
            new NaturalJoinNode(NaturalJoinType.natural,
                new RelationNode(auto),
                new RelationNode(majitel)
            ),
            new RelationNode(auto)
        )
        // act
        const actual: RATreeNode = exprParser.rpnToRATree(input, true);
        // assert
        expect(actual.printInLine()).toStrictEqual(expected.printInLine());
    });

    test("Auto(Id = 1)[Id]", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(Id = 1)"),
            UnaryOperatorToken.projection("[Id]")
        ];
        const expected: RATreeNode = new ProjectionNode("[Id]",
            new SelectionNode("(Id = 1)",
                new RelationNode(auto), true));
        // act
        const actual: RATreeNode = exprParser.rpnToRATree(input, true);
        // assert
        expect(actual.printInLine()).toStrictEqual(expected.printInLine());
    });

    test("Auto(Id = 1)[Id]*Majitel(Id = 1)[Id]", () => {
        // arrange
        const input: ExprToken[] = [
            new RelationToken("Auto"),
            UnaryOperatorToken.selection("(Id = 1)"),
            UnaryOperatorToken.projection("[Id]"),
            new RelationToken("Majitel"),
            UnaryOperatorToken.selection("(Id = 1)"),
            UnaryOperatorToken.projection("[Id]"),
            BinaryOperatorToken.naturalJoin('*')
        ];
        const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
            new ProjectionNode("[Id]",
                new SelectionNode("(Id = 1)",
                    new RelationNode(auto), true)),
            new ProjectionNode("[Id]",
                new SelectionNode("(Id = 1)",
                    new RelationNode(majitel), true))
        )
        // act
        const actual: RATreeNode = exprParser.rpnToRATree(input, true);
        // assert
        expect(actual.printInLine()).toStrictEqual(expected.printInLine());
    });
});

describe('parse and indexedParse', () => {
    describe('valid expression parsed correctly', () => {
        test('Auto', () => {
            const input: string = "Auto";
            const expected: RATreeNode = new RelationNode(auto);

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto\t[Kola]', () => {
            const input: string = "Auto\t[Kola]";
            const expected: RATreeNode = new ProjectionNode("[Kola]",
                new RelationNode(auto));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto< Kola -> PocetKol >', () => {
            const input: string = "Auto< Kola -> PocetKol >";
            const expected: RATreeNode = new RenameNode("< Kola -> PocetKol >",
                new RelationNode(auto));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto[Kola\t\n]< Kola -> PocetKol >', () => {
            const input: string = "Auto[Kola\t\n]< Kola -> PocetKol >";
            const expected: RATreeNode = new RenameNode("< Kola -> PocetKol >",
                new ProjectionNode("[Kola\t\n]",
                    new RelationNode(auto)));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto\n\t*\nMajitel', () => {
            const input: string = "Auto\n\t*\nMajitel";
            const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
                new RelationNode(auto),
                new RelationNode(majitel));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto[Kola]*Majitel< Id -> MajitelId >', () => {
            const input: string = "Auto[Kola]*Majitel< Id -> MajitelId >";
            const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
                new ProjectionNode("[Kola]",
                    new RelationNode(auto)),
                new RenameNode("< Id -> MajitelId >",
                    new RelationNode(majitel)));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto <* Majitel', () => {
            const input: string = "Auto <* Majitel";
            const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.leftSemi,
                new RelationNode(auto),
                new RelationNode(majitel));
            
            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto *> Majitel', () => {
            const input: string = "Auto *> Majitel";
            const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.rightSemi,
                new RelationNode(auto),
                new RelationNode(majitel));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto \u22b3 Majitel', () => {
            const input: string = "Auto \u22b3 Majitel";
            const expected: RATreeNode = new AntijoinNode(AntijoinType.left,
                new RelationNode(auto),
                new RelationNode(majitel));
            
            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto \u22b2 Majitel', () => {
            const input: string = "Auto \u22b2 Majitel";
            const expected: RATreeNode = new AntijoinNode(AntijoinType.right,
                new RelationNode(auto),
                new RelationNode(majitel));
            
            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto \u00f7 Majitel', () => {
            const input: string = "Auto \u00f7 Majitel";
            const expected: RATreeNode = new DivisionNode(
                new RelationNode(auto),
                new RelationNode(majitel));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto *L* Majitel', () => {
            const input: string = "Auto *L* Majitel";
            const expected: RATreeNode = new OuterJoinNode(OuterJoinType.left,
                new RelationNode(auto),
                new RelationNode(majitel));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto *R* Majitel', () => {
            const input: string = "Auto *R* Majitel";
            const expected: RATreeNode = new OuterJoinNode(OuterJoinType.right,
                new RelationNode(auto),
                new RelationNode(majitel));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto *F* Majitel', () => {
            const input: string = "Auto *F* Majitel";
            const expected: RATreeNode = new OuterJoinNode(OuterJoinType.full,
                new RelationNode(auto),
                new RelationNode(majitel));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto\n\t*\nMajitel< Id->Majitel > *Auto(Name == "Skoda \\"dobra :)\\"")', () => {
            const input: string = 'Auto\n\t*\nMajitel< Id->Majitel > *Auto(Name == "Skoda \\"dobra :)\\"")';
            const expected: RATreeNode = new NaturalJoinNode(NaturalJoinType.natural,
                new NaturalJoinNode(NaturalJoinType.natural,
                    new RelationNode(auto),
                    new RenameNode("< Id->Majitel >",
                        new RelationNode(majitel))),
                new SelectionNode('(Name == "Skoda \\"dobra :)\\"")',
                    new RelationNode(auto), true));

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto(Id == 1)', () => {
            const input: string = 'Auto(Id == 1)';
            const expected: RATreeNode =
                new SelectionNode('(Id == 1)',
                    new RelationNode(auto), true);

            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });

        test('Auto*(Auto*Auto)', () => {
            const input: string = 'Auto*(Auto*Auto)';
            const expected: RATreeNode =
                new NaturalJoinNode(NaturalJoinType.natural,
                    new RelationNode(auto),
                    new NaturalJoinNode(NaturalJoinType.natural,
                        new RelationNode(auto),
                        new RelationNode(auto)));
            
            const actual: RATreeNode = exprParser.parse(input);
            const actualIndexed: RATreeNode = exprParser.indexedParse(input);
            expect(actual).toStrictEqual(expected);
            expect(actualIndexed.printInLine()).toStrictEqual(expected.printInLine());
        });
    });
});