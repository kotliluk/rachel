import '@testing-library/jest-dom/extend-expect';
import 'jest-chain';
import {StoredRelation} from "./relation/storedRelation";
import {isDeepStrictEqual} from "util";
import {Pair} from "./types/pair";
import {IndexedString} from "./types/indexedString";


declare global {
  namespace jest {
    interface Matchers<R> {
      // For general testing
      toContainStrict(item: any): R;
    }
    interface Matchers<R> {
      // For StoredRelation testing
      toHaveName(name: string): R;
      // For StoredRelation testing
      toHaveColumnNames(columnNames: string[]): R;
      // For StoredRelation testing
      toHaveColumnTypes(columnTypes: string[]): R;
      // For StoredRelation testing
      toHaveRows(rows: string[][]): R;
    }
    interface Matchers<R> {
      // For Pair<IndexedString> testing
      toHaveParts(first: string, second: string): R;
    }
  }
}

/**
 * For general testing.
 */
expect.extend({
  toContainStrict(array: any[], item: any) {
    const pass = array.reduce((contains, curr) => contains || isDeepStrictEqual(curr, item), false);
    return {
      pass,
      message: () => pass ? "" : "Array does not contain expected item: " + JSON.stringify(item),
    };
  },
});

/**
 * For StoredRelation testing.
 */
expect.extend({
  toHaveName(relation: StoredRelation, name: string) {
    const actual = relation.getName();
    const pass = actual === name;
    return {
      pass,
      message: () => pass ? "" : "StoredRelation has unexpected name, expected: " + name + ", actual: " + actual,
    };
  },

  toHaveColumnNames(relation: StoredRelation, columnNames: string[]) {
    const actual = relation.getColumnNames();
    const pass = isDeepStrictEqual(actual, columnNames);
    return {
      pass,
      message: () => pass ? "" : "StoredRelation has unexpected column names, expected: " + columnNames + ", actual: " + actual,
    };
  },

  toHaveColumnTypes(relation: StoredRelation, columnTypes: string[]) {
    const actual = relation.getColumnTypes();
    const pass = isDeepStrictEqual(actual, columnTypes);
    return {
      pass,
      message: () => pass ? "" : "StoredRelation has unexpected column types, expected: " + columnTypes + ", actual: " + actual,
    };
  },

  toHaveRows(relation: StoredRelation, rows: string[][]) {
    const actual = relation.getRows();
    const pass = isDeepStrictEqual(actual, rows);
    return {
      pass,
      message: () => pass ? "" : "StoredRelation has unexpected rows, expected: " + rows + ", actual: " + actual,
    };
  }
});

/**
 * For Pair<IndexedString> testing.
 */
expect.extend({
  toHaveParts(pair: Pair<IndexedString>, first: string, second: string) {
    const passFirst = pair.first.toString() === first;
    const passSecond = pair.second.toString() === second;
    return {
      pass: passFirst && passSecond,
      message: () => {
        let ret = "";
        !passFirst && (ret += "Pair has unexpected first member, expected: " + first + ", actual: " + pair.first.toString());
        !passFirst && !passSecond && (ret += "\n");
        !passSecond && (ret += "Pair has unexpected second member, expected: " + second + ", actual: " + pair.second.toString());
        return ret;
      },
    };
  },
});
