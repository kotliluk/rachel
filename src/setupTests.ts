// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like: expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import 'jest-chain';
import {StoredRelation} from "./relation/storedRelation";
import {isDeepStrictEqual} from "util";
import {Pair} from "./types/pair";
import {IndexedString} from "./types/indexedString";


declare global {
  namespace jest {
    /**
     * For general testing.
     */
    interface Matchers<R> {
      toContainStrict(item: any): R;
    }
    /**
     * For StoredRelation testing.
     */
    interface Matchers<R> {
      toHaveName(name: string): R;
      toHaveColumnNames(columnNames: string[]): R;
      toHaveColumnTypes(columnTypes: string[]): R;
      toHaveRows(rows: string[][]): R;
    }
    /**
     * For Pair<IndexedString> testing.
     */
    interface Matchers<R> {
      toHaveParts(first: string, second: string): R;
    }
  }
}

expect.extend({
  toContainStrict(array: any[], item: any) {
    const pass = array.reduce((contains, curr) => contains || isDeepStrictEqual(curr, item), false);
    return {
      pass,
      message: () => pass ? "" : "Array does not contain expected item: " + JSON.stringify(item),
    };
  },
});

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
