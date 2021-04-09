import {BinaryNodeClass} from "../ratree/binaryNode";
import {getRange, IndexedString} from "../tools/indexedString";
import {UnaryNodeClass} from "../ratree/unaryNode";

/**
 * Abstract parent class for all RATokens.
 */
export abstract class ExprToken {
    protected constructor(public readonly str: string | IndexedString) {
    }

    /**
     * Gets token start and end index in the text (if the token has IndexedString representation) or undefined.
     */
    public getRange(): {start: number, end: number} | undefined {
        return getRange(this.str);
    }
}

/**
 * Parentheses.
 */
export abstract class ParenthesisToken extends ExprToken {}

export class OpeningParentheses extends ParenthesisToken {
    public constructor(str: string | IndexedString) {
        super(str);
    }
}

export class ClosingParentheses extends ParenthesisToken {
    public constructor(str: string | IndexedString) {
        super(str);
    }
}

/**
 * Relation reference.
 */
export class RelationToken extends ExprToken {
    public constructor(name: string | IndexedString) {
        super(name);
    }
}

/**
 * Unary operators.
 */
export class UnaryOperatorToken extends ExprToken {

    public static selection(selection: string | IndexedString) {
        return new UnaryOperatorToken(selection, "selection");
    }

    public static projection(projection: string | IndexedString) {
        return new UnaryOperatorToken(projection, "projection");
    }

    public static rename(rename: string | IndexedString) {
        return new UnaryOperatorToken(rename, "rename");
    }

    private constructor(str: string | IndexedString, public readonly type: UnaryNodeClass) {
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

    static naturalJoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, naturalPrecedence, "natural join");
    }

    static cartesianProduct(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, cartesianPrecedence, "cartesian product");
    }

    static union(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, unionPrecedence, "union");
    }

    static intersection(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, intersectionPrecedence, "intersection");
    }

    static difference(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, differencePrecedence, "difference");
    }

    static leftSemijoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, semiPrecedence, "left semijoin");
    }

    static rightSemijoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, semiPrecedence, "right semijoin");
    }

    static leftAntijoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, antiPrecedence, "left antijoin");
    }

    static rightAntijoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, antiPrecedence, "right antijoin");
    }

    static thetaJoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, thetaPrecedence, "theta join");
    }

    static leftThetaSemijoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, thetaSemiPrecedence, "left theta semijoin");
    }

    static rightThetaSemijoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, thetaSemiPrecedence, "right theta semijoin");
    }

    static fullOuterJoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, outerPrecedence, "full outer join");
    }

    static leftOuterJoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, outerPrecedence, "left outer join");
    }

    static rightOuterJoin(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, outerPrecedence, "right outer join");
    }

    static division(str: string | IndexedString): BinaryOperatorToken {
        return new BinaryOperatorToken(str, divisionPrecedence, "division");
    }

    private constructor(str: string | IndexedString, public readonly precedence: number, public readonly type: BinaryNodeClass) {
        super(str);
    }
}