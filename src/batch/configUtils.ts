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
export type CountComparator = (x: number) => string;

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
    return (x: number) => {
      if (x === count) {
        return "";
      }
      return `Expected ${count}, received ${x}`;
    };
  }
  // case of "count": { "$eq": 5 }, etc.
  if (typeof count === "object") {
    const comparators: CountComparator[] = [];
    for (const field in count) {
      const countValue = count[field];
      if (typeof countValue !== "number") {
        console.warn(field + " parameter of count field is not a number");
        return undefined;
      }
      if (field === "$eq") {
        comparators.push((x: number) => {
          if (x === countValue) {
            return "";
          }
          return `Expected ${countValue}, received ${x}`;
        });
      }
      else if (field === "$gte") {
        comparators.push((x: number) => {
          if (x >= countValue) {
            return "";
          }
          return `Expected greater or equal to ${countValue}, received ${x}`;
        });
      }
      else if (field === "$gt") {
        comparators.push((x: number) => {
          if (x > countValue) {
            return "";
          }
          return `Expected greater than ${countValue}, received ${x}`;
        });
      }
      else if (field === "$lte") {
        comparators.push((x: number) => {
          if (x <= countValue) {
            return "";
          }
          return `Expected less or equal to ${countValue}, received ${x}`;
        });
      }
      else if (field === "$lt") {
        comparators.push((x: number) => {
          if (x < countValue) {
            return "";
          }
          return `Expected less than ${countValue}, received ${x}`;
        });
      }
    }
    if (comparators.length === 0) {
      console.warn("Count objects has no valid parameters")
      return undefined;
    }
    return (x: number) => comparators.map(comparator => comparator(x)).filter(msg => msg !== "").join(' + ');
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

/**
 * Modifies given name of source project to report name.
 */
export type ReportNameModifier = (name: string) => string;

export const identityReportNameModifier = (name: string) => {
  const lastDotIndex = name.lastIndexOf('.');
  return lastDotIndex > -1 ? name.slice(0, lastDotIndex) : name;
};

/**
 * Creates ReportNameModifier which given path parts joined with given joiner.
 * The config can specified the following fields:
 * * usePathParts if the array is empty, all path parts are used
 * * joinPathParts if the string is undefined, original path joiners are kept
 * * prefix string to prepend to the name
 * * suffix string to append to the name
 */
export const createReportNameModifier = (config: any): ReportNameModifier => {
  let modifier = identityReportNameModifier;
  
  let usePathParts: number[] = [];
  let joinPathParts: string | undefined = undefined;
  let prefix: string = "";
  let suffix: string = "";
  
  for (const fieldName in config) {
    const field = config[fieldName];
    if (fieldName === "usePathParts" && Array.isArray(field) && field.every(n => typeof n === "number")) {
      usePathParts = field;
      continue;
    }
    if (fieldName === "joinPathParts" && typeof field === "string") {
      joinPathParts = field;
      continue;
    }
    if (fieldName === "prefix" && typeof field === "string") {
      prefix = field;
      continue;
    }
    if (fieldName === "suffix" && typeof field === "string") {
      suffix = field;
    }
  }

  if (usePathParts.length > 0) {
    const previousModifier = modifier;
    modifier = (name) => {
      const parts = previousModifier(name).split(/[/\\]/g);
      const count = parts.length;
      return parts.filter((part, i) => usePathParts.includes(count - i)).join('/');
    }
  }

  if (joinPathParts !== undefined) {
    const previousModifier = modifier;
    // @ts-ignore
    modifier = (name) => previousModifier(name).replace(/[/\\]/g, joinPathParts);
  }

  return (name) => prefix + modifier(name) + suffix + '.txt';
}