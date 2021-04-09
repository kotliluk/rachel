/**
 * Representation of named RA expression.
 */
export interface Expression {
    name: string,
    text: string
}

/**
 * Checks whether the given obj is an Expression.
 *
 * @param obj
 */
export function isExpression(obj: any): boolean {
    if (typeof obj !== "object") {
        return false;
    }
    return ("name" in obj) && (typeof obj.name === "string") && ("text" in obj) && (typeof obj.text === "string");
}

/**
 * Creates a copy of the given expression.
 */
export function copyExpression(exp: Expression): Expression {
    return {name: exp.name, text: exp.text};
}