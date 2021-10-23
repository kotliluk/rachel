/**
 * Specifies supported column types in the application. When changed, update the keywords.ts file.
 */

/**
 * Supported string names of types of columns for a relational schema.
 * @typedef SupportedColumnType
 * @category Relation
 * @public
 */
export type SupportedColumnType = 'string' | 'number' | 'boolean'

/**
 * Possible types of the content of columns (null values included).
 * @typedef ColumnContent
 * @category Relation
 * @public
 */
export type ColumnContent = string | number | boolean | null

/**
 * Returns true if the given obj is string with value SupportedColumnType value.
 * @param obj checked object {@type any}
 * @return whether the given obj is string with value SupportedColumnType value {@type boolean}
 * @category Relation
 * @public
 */
export function isSupportedColumnType (obj: any): boolean {
  if (typeof obj !== 'string') {
    return false
  }
  return obj === 'string' || obj === 'number' || obj === 'boolean'
}
