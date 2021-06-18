import {OperationsCount, OperationsTypes} from "./operationsCount";

/**
 * Rule for operations count. Should return "OK" when it is held, "ERROR ruleName: ruleDescription" if not.
 */
export type OperationRule = (ops: OperationsCount) => string;

/**
 * Rule for tables count. Should return "OK" when it is held, "ERROR ruleName: ruleDescription" if not.
 */
export type TableRule = (tables: number) => string;

/**
 * Rule for queries count. Should return "OK" when it is held, "ERROR ruleName: ruleDescription" if not.
 */
export type QueryRule = (tables: number) => string;

/**
 * Compares the given number to the predefined value.
 */
export type CountComparator = (x: number) => boolean;

/**
 * Creates a CountComparator function with the given count.
 *
 * @param count values to be compared to, expected to be a number or an object with any of the following fields:
 * "$eq", "$gte", "$gt", "$lte", "$lt".
 * @return created comparator or undefined if count is invalid
 */
export const createCountComparator = (count: any): CountComparator | undefined => {
  // case of "count": 5, etc.
  if (typeof count === "number") {
    return (x: number) => x === count;
  }
  // case of "count": { "$eq": 5 }, etc.
  if (typeof count === "object") {
    const comparators: CountComparator[] = [];
    for (const field in count) {
      if (typeof count[field] !== "number") {
        console.warn(field + " parameter of count field is not a number");
        return undefined;
      }
      if (field === "$eq") {
        comparators.push((x: number) => x === count[field]);
      }
      else if (field === "$gte") {
        comparators.push((x: number) => x >= count[field]);
      }
      else if (field === "$gt") {
        comparators.push((x: number) => x > count[field]);
      }
      else if (field === "$lte") {
        comparators.push((x: number) => x <= count[field]);
      }
      else if (field === "$lt") {
        comparators.push((x: number) => x < count[field]);
      }
    }
    if (comparators.length === 0) {
      console.warn("Count objects has no valid parameters")
      return undefined;
    }
    return (x: number) => comparators.every(comparator => comparator(x));
  }
  console.warn("Count field is not a number nor object");
  return undefined;
}

/**
 * Sums predefined subset of operations.
 */
export type OperationsCounter = (x: OperationsCount) => number;

/**
 * Creates a OperationsCounter function with the given operations to count.
 *
 * @param ops operations to be counted, expected to be a string or an array of string, each string must be supported
 * operation type
 * @return created counter or undefined if ops is invalid
 */
export const createOperationsCounter = (ops: any): OperationsCounter | undefined => {
  if (typeof ops === "string") {
    if (OperationsTypes.indexOf(ops) === -1) {
      console.warn("Invalid value of operations field: " + ops);
      return undefined;
    }
    // @ts-ignore
    return (x: OperationsCount) => x[ops];
  }
  else if (Array.isArray(ops)) {
    if (ops.some(op => OperationsTypes.indexOf(op) === -1)) {
      console.warn("Invalid value of operation in operations field: " + ops);
      return undefined;
    }
    const _ops = [...ops];
    // @ts-ignore
    return (x: OperationsCount) => _ops.reduce<number>((prev, cur) => prev + x[cur], 0);
  }
  console.warn("Invalid operations field");
  return undefined;
}