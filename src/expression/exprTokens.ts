import {BinaryNodeClass} from "../ratree/binaryNode";
import {IndexedString} from "../types/indexedString";
import {UnaryNodeClass} from "../ratree/unaryNode";
import {StartEndPair} from "../types/startEndPair";

/**
 * Abstract parent class for all RATokens.
 */
export abstract class ExprToken {
    protected constructor(public readonly str: IndexedString) {
    }

    /**
     * Gets token start and end index in the text (if the token has IndexedString representation) or undefined.
     */
    public getRange(): StartEndPair | undefined {
        return this.str.getRange();
    }
}

/**
 * Parentheses.
 */
export abstract class ParenthesisToken extends ExprToken {}

export class OpeningParenthesis extends ParenthesisToken {
    public constructor(str: IndexedString) {
        super(str);
    }
}

export class ClosingParenthesis extends ParenthesisToken {
    public constructor(str: IndexedString) {
        super(str);
    }
}

/**
 * Relation reference.
 */
export class RelationToken extends ExprToken {
    public constructor(name: IndexedString) {
        super(name);
    }
}

/**
 * Unary operators.
 */
export class UnaryOperatorToken extends ExprToken {

    public static selection(selection: IndexedString) {
        return new UnaryOperatorToken(selection, "selection");
    }

    public static projection(projection: IndexedString) {
        return new UnaryOperatorToken(projection, "projection");
    }

    public static rename(rename: IndexedString) {
        return new UnaryOperatorToken(rename, "rename");
    }

    private constructor(str: IndexedString, public readonly type: UnaryNodeClass) {
        super(str);
    }
}

/**
 * Precedence values for binary operators (highest to lowest). As there is no fixed precedence order for RA and set
 * operation, we chose the following.
 */
const precedenceLevelA: number = 10;
const cartesianPrecedence: number = precedenceLevelA;
const naturalPrecedence: number = precedenceLevelA;
const thetaPrecedence: number = precedenceLevelA;

const precedenceLevelB: number = precedenceLevelA - 1;
const semiPrecedence: number = precedenceLevelB;
const antiPrecedence: number = precedenceLevelB;
const thetaSemiPrecedence: number = precedenceLevelB;

const precedenceLevelC: number = precedenceLevelB - 1;
const outerPrecedence: number = precedenceLevelC;

const precedenceLevelD: number = precedenceLevelC - 1;
const divisionPrecedence: number = precedenceLevelD;

const precedenceLevelE: number = precedenceLevelD - 1;
const intersectionPrecedence: number = precedenceLevelE;

const precedenceLevelF: number = precedenceLevelE - 1;
const differencePrecedence: number = precedenceLevelF;

const precedenceLevelG: number = precedenceLevelF - 1;
const unionPrecedence: number = precedenceLevelG;

/**
 * Binary operators.
 */
export class BinaryOperatorToken extends ExprToken {

    static naturalJoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, naturalPrecedence, "natural join");
    }

    static cartesianProduct(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, cartesianPrecedence, "cartesian product");
    }

    static union(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, unionPrecedence, "union");
    }

    static intersection(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, intersectionPrecedence, "intersection");
    }

    static difference(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, differencePrecedence, "difference");
    }

    static leftSemijoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, semiPrecedence, "left semijoin");
    }

    static rightSemijoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, semiPrecedence, "right semijoin");
    }

    static leftAntijoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, antiPrecedence, "left antijoin");
    }

    static rightAntijoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, antiPrecedence, "right antijoin");
    }

    static thetaJoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, thetaPrecedence, "theta join");
    }

    static leftThetaSemijoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, thetaSemiPrecedence, "left theta semijoin");
    }

    static rightThetaSemijoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, thetaSemiPrecedence, "right theta semijoin");
    }

    static fullOuterJoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, outerPrecedence, "full outer join");
    }

    static leftOuterJoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, outerPrecedence, "left outer join");
    }

    static rightOuterJoin(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, outerPrecedence, "right outer join");
    }

    static division(str: IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, divisionPrecedence, "division");
    }

    private constructor(str: IndexedString, public readonly precedence: number, public readonly type: BinaryNodeClass) {
        super(str);
    }
}