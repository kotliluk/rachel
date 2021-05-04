/**
 * Representation of named relational algebra expression.
 * @public
 */
export interface Expression {
    /**
     * name of the expression
     * @type string
     * @public
     */
    name: string,
    /**
     * text of the expression
     * @type string
     * @public
     */
    text: string
}

/**
 * Checks whether the given obj is an {@link Expression}.
 *
 * @param obj object to check {@type any}
 * @return whether the given obj is an Expression {@type boolean}
 * @public
 */
export function isExpression(obj: any): boolean {
    if (typeof obj !== "object") {
        return false;
    }
    return ("name" in obj) && (typeof obj.name === "string") && ("text" in obj) && (typeof obj.text === "string");
}

/**
 * Creates a copy of the given expression.
 *
 * @param exp Expression to copy {@type Expression}
 * @return deep copied expression {@type Expression}
 * @public
 */
export function copyExpression(exp: Expression): Expression {
    return {name: exp.name, text: exp.text};
}