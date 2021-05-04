import {RATreeNode} from "./raTreeNode";
import {UnaryNode} from "./unaryNode";
import {BinaryNode} from "./binaryNode";
import {IndexedString} from "../types/indexedString";
import {StartEndPair} from "../types/startEndPair";

/**
 * Finds the root in the given tree with the given index with respect to depth first search. Root has index 0.
 *
 * @param root root of the searched tree {@type RATreeNode}
 * @param index index to be found {@type number}
 * @return found root with given index or null if not found {@type RATreeNode?}
 * @public
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
 * @param root root of the tree to compute the depth for {@type RATreeNode}
 * @return tree depth {@type number}
 * @public
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
 * Returns true if the given cursor position is in the given range, it is not inside quotes, and the character at the
 * cursor position is present (i.e., was not removed as comment).
 * Note: given range is expected to be computed from given string.
 *
 * @param cursor index of the cursor {@type number}
 * @param range range of the string {@type StartEndPair?}
 * @param str string to search in {@type IndexedString}
 * @return true if the given cursor position is in the given range, it is not inside quotes, and the character at the
 * cursor position is present {@type boolean}
 * @public
 */
export function isInRangeAndNotInQuotes(cursor: number, range: StartEndPair | undefined, str: IndexedString): boolean {
    if (range !== undefined && range.start < cursor && cursor <= range.end) {
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
                // when the cursor was reached, returns true, if it is not in quotes and the position is present (was not removed as comment)
                return !insideQuotes && str.getChars().some(c => c.index === cursor - 1);
            }
        }
        console.warn("isInRangeAndNotInQuotes outside range");
    }
    return false;
}