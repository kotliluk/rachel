import {ComparingOperatorType} from "../vetree/comparingOperator";
import {ColumnContent, SupportedColumnType} from "../relation/columnType";
import {IndexedString} from "../tools/indexedString";

/**
 * Precedence value for all token types.
 */
const precedenceNot: number = 50;
const precedenceMulDiv: number = 30;
const precedencePlusMinus: number = 25;
const precedenceComparison: number = 20;
const precedenceAnd: number = 10;
const precedenceOr: number = 5;

/**
 * Tokens used for parsing of string expression to BooleanEvaluating tree.
 */
export abstract class ValueToken {
    protected constructor(public readonly str: string | IndexedString) {}

    /**
     * Gets token start and end index in the text (if the token has IndexedString representation) or undefined.
     */
    public getRange(): {start: number, end: number} | undefined {
        return this.str instanceof IndexedString ? this.str.getNonNaNRange() : undefined;
    }
}

export abstract class OperatorToken extends ValueToken {
    protected constructor(str: string | IndexedString, readonly precedence: number) {
        super(str);
    }
}

export class LogicalNotToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedenceNot);
    }
}

export class LogicalAndToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedenceAnd);
    }
}

export class LogicalOrToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedenceOr);
    }
}

export class ComputingMultiplicationToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedenceMulDiv);
    }
}

export class ComputingDivisionToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedenceMulDiv);
    }
}

export class ComputingPlusToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedencePlusMinus);
    }
}

export class ComputingMinusToken extends OperatorToken {
    constructor(operator: string | IndexedString) {
        super(operator, precedencePlusMinus);
    }
}

export class ComparingToken extends OperatorToken {
    constructor(readonly type: ComparingOperatorType, operator: string | IndexedString) {
        super(operator, precedenceComparison);
    }
}

export abstract class ParenthesisToken extends ValueToken {
    protected constructor(operator: string | IndexedString) {
        super(operator);
    }
}

export class OpeningParentheses extends ParenthesisToken {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(operator: string | IndexedString) {
        super(operator);
    }
}

export class ClosingParentheses extends ParenthesisToken {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(operator: string | IndexedString) {
        super(operator);
    }
}

export class LiteralToken extends ValueToken {
    constructor(str: string | IndexedString, readonly value: ColumnContent, readonly type: SupportedColumnType | "null") {
        super(str);
    }
}

export class ReferenceToken extends ValueToken {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor(columnName: string | IndexedString) {
        super(columnName);
    }
}