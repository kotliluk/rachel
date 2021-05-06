import {IndexedString} from "../types/indexedString";

/**
 * Lowercase reserved keywords which cannot be used for column names. They are:
 * - Null value: null
 * - Boolean values: true, false
 * - Empty string: ""
 */
const forbiddenColumnNames: string[] = ["null", "true", "false", ""];

/**
 * Reserved keywords which cannot be used for relation names. They are:
 * - First characters of outer joins: F, L, R
 * - Empty string: ""
 */
const forbiddenRelationNames: string[] = ["F", "L", "R", ""];

/**
 * Returns lowercase reserved keywords which cannot be used for column names. They are:
 * - Null value: null
 * - Boolean values: true, false
 * - Empty string: ""
 *
 * @return lowercase reserved column-keywords {@type string[]}
 * @public
 */
export function getForbiddenColumnNames(): string[] {
    return forbiddenColumnNames;
}

/**
 * Returns reserved keywords which cannot be used for relation names. They are:
 * - First characters of outer joins: F, L, R, f, l, r
 * - Empty string: ""
 *
 * @return lowercase reserved relation-keywords {@type string[]}
 * @public
 */
export function getForbiddenRelationNames(): string[] {
    return forbiddenRelationNames;
}

/**
 * Returns true if the given string is forbidden as a column name.
 *
 * @param str string to check {@type (string | IndexedString)}
 * @return true if the given string is forbidden as a column name {@type boolean}
 * @public
 */
export function isForbiddenColumnName(str: string | IndexedString): boolean {
    return forbiddenColumnNames.indexOf(str.toString().toLowerCase()) > -1;
}

/**
 * Returns true if the given string is forbidden as a relation name.
 *
 * @param str string to check {@type (string | IndexedString)}
 * @return true if the given string is forbidden as a relation name {@type boolean}
 * @public
 */
export function isForbiddenRelationName(str: string | IndexedString): boolean {
    // does not use to lower because forbidden names are upper
    return forbiddenRelationNames.indexOf(str.toString()) > -1;
}