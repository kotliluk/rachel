import RATreeNode from "./raTreeNode";
import UnaryNode from "./unaryNode";
import BinaryNode from "./binaryNode";
import {IndexedString} from "../types/indexedString";

/**
 * Finds the root in the given tree with the given index with respect to depth first search. Root has index 0.
 *
 * @param root root of the searched tree
 * @param index index to be found
 * @return found root with given index or null if not found
 */
export function depthSearch(root: RATreeNode, index: number): RATreeNode | null {
    let i: number = 0;
    const findIndexInTree = (node: RATreeNode): RATreeNode | null => {
        // wanted index found
        if (i === index) {
            return node;
        }
        i++;
        if (node instanceof UnaryNode) {
            return findIndexInTree(node.getSubtree());
        }
        if (node instanceof BinaryNode) {
            const leftSearch = findIndexInTree(node.getLeftSubtree());
            if (leftSearch === null) {
                return findIndexInTree(node.getRightSubtree());
            }
            return leftSearch;
        }
        // end of the branch without the result
        return null;
    }
    return findIndexInTree(root);
}

/**
 * Computes depth of the tree. One node has depth 0.
 *
 * @param root root of the tree to compute the depth for
 * @return tree depth
 */
export function getTreeDepth(root: RATreeNode): number {
    if (root instanceof BinaryNode) {
        const left: number = getTreeDepth(root.getLeftSubtree());
        const right: number = getTreeDepth(root.getRightSubtree());
        return Math.max(left, right) + 1;
    }
    if (root instanceof UnaryNode) {
        return getTreeDepth(root.getSubtree()) + 1;
    }
    return 0;
}

/**
 * Returns true, if the given cursor position is in the given range and it is not inside quotes.
 * Note: given range is expected to be computed from given string.
 */
export function isInRangeAndNotInQuotes(cursor: number, range: { start: number, end: number } | undefined, str: string | IndexedString): boolean {
    if (range !== undefined && str instanceof IndexedString && range.start < cursor && cursor <= range.end) {
        const len = range.end - range.start;
        const s = str.toString();
        const cursorIndexInStr = cursor - range.start;
        let insideQuotes: boolean = false;
        let backslashes: number = 0;
        for (let i = 0; i < len; ++i) {
            const curChar = s.charAt(i);
            // quotes found
            if (curChar === '"' && (backslashes % 2) === 0) {
                insideQuotes = !insideQuotes;
            }
            if (insideQuotes && curChar === '\\') {
                ++backslashes;
            }
            else {
                backslashes = 0;
            }
            if (i === cursorIndexInStr - 1) {
                // when the cursor was reached, returns true, when it is not in quotes
                return !insideQuotes;
            }
        }
        console.warn("isInRangeAndNotInQuotes outside range")
    }
    return false;
}