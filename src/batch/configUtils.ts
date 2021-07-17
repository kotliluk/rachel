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
      return `Expected ${count}, found ${x}`;
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
          return `Expected ${countValue}, found ${x}`;
        });
      }
      else if (field === "$gte") {
        comparators.push((x: number) => {
          if (x >= countValue) {
            return "";
          }
          return `Expected greater or equal to ${countValue}, found ${x}`;
        });
      }
      else if (field === "$gt") {
        comparators.push((x: number) => {
          if (x > countValue) {
            return "";
          }
          return `Expected greater than ${countValue}, found ${x}`;
        });
      }
      else if (field === "$lte") {
        comparators.push((x: number) => {
          if (x <= countValue) {
            return "";
          }
          return `Expected less or equal to ${countValue}, found ${x}`;
        });
      }
      else if (field === "$lt") {
        comparators.push((x: number) => {
          if (x < countValue) {
            return "";
          }
          return `Expected less than ${countValue}, found ${x}`;
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
 * Creates a OperationsCounter function with the given operations to indicate (returns +1 for present operations, 0 for
 * absent ones).
 *
 * @param ops operations to be searched for, expected to be a string or an array of string, each string must be supported
 * operation type
 * @return created indicator or undefined if ops is invalid
 */
export const createOperationsIndicator = (ops: any): OperationsCounter | undefined => {
  if (typeof ops === "string") {
    if (OperationsTypes.indexOf(ops) === -1) {
      console.warn("Invalid value of operations field: " + ops);
      return undefined;
    }
    // @ts-ignore
    return (x: OperationsCount) => Math.sign(x[ops]);
  }
  else if (Array.isArray(ops)) {
    if (ops.some(op => OperationsTypes.indexOf(op) === -1)) {
      console.warn("Invalid value of operation in operations field: " + ops);
      return undefined;
    }
    const _ops = [...ops];
    // @ts-ignore
    return (x: OperationsCount) => _ops.reduce<number>((prev, cur) => prev + Math.sign(x[cur]), 0);
  }
  console.warn("Invalid operations field");
  return undefined;
}

export const getDescription = (ruleDef: any): string => {
  return ruleDef.description ? ` (${ruleDef.description})` : "";
}

/**
 * Creates an OperationRule for total count of given operations.
 *
 * @param ruleDef definition of the rule. Expected to contain "count" (number/count object) field. If the optional "unique" (boolean)
 * field is true, the created rule counts occurrences of operations as 0/1. If the "description" (string) is set, it is
 * appended to the returning error description.
 * @param ops operations to count
 */
export const createCountOperationRule = (ruleDef: any, ops: string[]): OperationRule | undefined => {
  const unique = ruleDef.unique === true;
  const comparator = createCountComparator(ruleDef.count);
  const counter = unique ? createOperationsIndicator(ops) : createOperationsCounter(ops);
  if (comparator !== undefined && counter !== undefined) {
    return (x: OperationsCount) => {
      const result = comparator(counter(x));
      if (result === "") {
        return "OK";
      }
      return `${unique ? 'Unique count' : 'Count'} of operations "${ops.join(', ')}": ${result}${getDescription(ruleDef)}`;
    };
  }
}

/**
 * Creates an OperationRule for counts of each from given operations.
 *
 * @param ruleDef definition of the rule. Expected to contain "each" (number/count object) field. If the "description" (string) is set, it is
 * appended to the returning error description.
 * @param ops operations to count
 */
export const createEachOperationRule = (ruleDef: any, ops: string[]): OperationRule | undefined => {
  const subRules: OperationRule[] = [];
  // @ts-ignore
  ops.forEach((op: string) => {
    const comparator = createCountComparator(ruleDef.each);
    const counter = createOperationsCounter(op);
    if (comparator !== undefined && counter !== undefined) {
      const subRule = (x: OperationsCount) => {
        const result = comparator(counter(x));
        if (result === "") {
          return "OK";
        }
        return `${op}: ${result}`;
      };
      subRules.push(subRule);
    }
  });
  if (subRules.length > 0) {
    return (x: OperationsCount) => {
      const errors = subRules.map(sr => sr(x)).filter(msg => msg !== "OK").join(',\n - ');
      if (errors === "") {
        return "OK";
      }
      return `Count of each operation "${ops.join(', ')}"${getDescription(ruleDef)}:\n - ${errors}`;
    };
  }
}

/**
 * Creates a TableRule.
 *
 * @param ruleDef definition of the rule. Expected to contain "tables" (number/count object) field. If the "description" (string) is set, it is
 * appended to the returning error description.
 */
export const createTableRule = (ruleDef: any): TableRule | undefined => {
  const comparator = createCountComparator(ruleDef.tables);
  if (comparator !== undefined) {
    return (x: number) => {
      const result = comparator(x);
      if (result === "") {
        return "OK";
      }
      return `Count of tables: ${result}${getDescription(ruleDef)}`;
    };
  }
}

/**
 * Creates a QueryRule.
 *
 * @param ruleDef definition of the rule. Expected to contain "queries" (number/count object) field. If the "description" (string) is set, it is
 * appended to the returning error description.
 */
export const createQueryRule = (ruleDef: any): QueryRule | undefined => {
  const comparator = createCountComparator(ruleDef.queries);
  if (comparator !== undefined) {
    return (x: number) => {
      const result = comparator(x);
      if (result === "") {
        return "OK";
      }
      return `Count of queries: ${result}${getDescription(ruleDef)}`;
    };
  }
}

/**
 * Modifies given name of source project to report name.
 */
export type ReportNameModifier = (name: string) => string;

const removeExtension = (name: string) => {
  const lastDotIndex = name.lastIndexOf('.');
  return (lastDotIndex > -1 ? name.slice(0, lastDotIndex) : name);
};

export const identityReportNameModifier = (name: string) => {
  return removeExtension(name) + '.txt';
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
  let modifier = removeExtension;

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
