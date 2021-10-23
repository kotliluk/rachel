import { ColumnContent, SupportedColumnType } from './columnType'
import { isEqual } from 'lodash'
import { ErrorFactory } from '../error/errorFactory'
import { language } from '../language/language'

/**
 * Row stores a set of column values in a formal {@link Relation} representation.
 *
 * @category Relation
 * @public
 */
export class Row {

  private readonly types = new Map<string, SupportedColumnType>()
  private readonly values = new Map<string, ColumnContent>()
  private finished: boolean

  /**
     * Creates a new row with given columns. Given column set is final, no more column can be added.
     * Given column values are set to null. They can be set to a new value by addColumn function, as long as the row
     * is not set finished.
     *
     * @param columns set of columns in a row {@type Map<String, SupportedColumnType>}
     * @public
     */
  constructor (columns: Map<string, SupportedColumnType>) {
    // adds empty columns
    columns.forEach((value, name) => {
      this.values.set(name, null)
    })
    this.types = columns
    this.finished = false
  }

  /**
     * Returns whether the row is finished and no more column change is possible.
     *
     * @return true if the row is finished {@type boolean}
     * @public
     */
  isFinished (): boolean {
    return this.finished
  }

  /**
     * Sets the row as finished, no more changes in column values are possible.
     * @public
     */
  finish (): void {
    this.finished = true
  }

  /**
     * Gets names of all columns in a row.
     *
     * @return set of all column names {@type IterableIterator<String>}
     * @public
     */
  getColumnNames (): IterableIterator<string> {
    return this.types.keys()
  }

  /**
     * Adds a value to the row. If the addition succeeded, returns true. It can fail, if the row is finished,
     * if there is no column of the given name or if there is a column with the name, but different type.
     *
     * @param name name of the column {@type string}
     * @param value new value of the column {@type ColumnContent}
     * @return true if addition succeeded {@type boolean}
     * @public
     */
  addValue (name: string, value: ColumnContent): boolean {
    // finished row or not present column
    if (this.finished || !this.types.has(name)) {
      return false
    }
    const givenType = typeof value
    // null can be set all column types
    if (value !== null && givenType !== this.types.get(name)) {
      return false
    }
    this.values.set(name, value)
    return true
  }

  /**
     * Gets the value (possibly null) of the column with the given name. If there is no column with this name, undefined is returned.
     *
     * @param name name of the column {@type string}
     * @return value of the column or undefined if there is no such column {@type ColumnContent?}
     * @public
     */
  getValue (name: string): ColumnContent | undefined {
    return this.values.get(name)
  }

  /**
     * Returns the type of the given column or undefined if the column is absent.
     *
     * @param name name of the column {@type string}
     * @return the type of the column {@type SupportedColumnType?}
     * @public
     */
  getType (name: string): SupportedColumnType | undefined {
    return this.types.get(name)
  }

  /**
     * Gets types of all columns.
     *
     * @return map of columns {@type Map<String, SupportedColumnType>}
     * @public
     */
  getTypes (): Map<string, SupportedColumnType> {
    return this.types
  }

  /**
     * Gets values of all columns.
     *
     * @return map of columns {@type Map<String, ColumnContent>}
     * @public
     */
  getValues (): Map<string, ColumnContent> {
    return this.values
  }

  /**
     * Returns values of all columns ordered by given array of column names. OrderedColumns are expected to be from the
     * relation that contains the row. The returned values are converted to string type. String column values are
     * changed to printing representation - escaped '\\' and '"' are returned without the escape '\\'.
     *
     * @param orderedColumns order of columns to be returned {@type string[]}
     * @return ordered array of values {@type string[]}
     * @public
     */
  getOrderedPrintValues (orderedColumns: string[]): string[] {
    const ret: string[] = []
    orderedColumns.forEach(column => {
      const value = this.values.get(column)
      const type = this.types.get(column)
      // should be handled before call
      if (value === undefined || type === undefined) {
        throw ErrorFactory.codeError(language().codeErrors.row_absentColumn, column, [...this.types.values()].join(', '))
      }
      if (type === 'string') {
        const str = String(value).replace(/\\"/g, '"').replace(/\\\\/g, '\\')
        ret.push(str)
      } else {
        ret.push(String(value))
      }
    })
    return ret
  }

  /**
     * Custom equals function.
     *
     * @param other object to compare to {@type any}
     * @return whether this and given object has the same values and types
     * @public
     */
  equals (other: Object): boolean {
    if (other instanceof Row) {
      return isEqual(this.types, other.types) && isEqual(this.values, other.values)
    }
    return false
  }
}
