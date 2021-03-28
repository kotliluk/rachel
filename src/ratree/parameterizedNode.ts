/**
 * Describes nodes with an additional parameter (selection, rename, projection, theta join, theta semijoin).
 */
export interface ParameterizedNode {
    getParameter(): string;
}