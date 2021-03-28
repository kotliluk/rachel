import {Expression, isExpression} from "../expression/expression";
import {isStoredRelationData, StoredRelationData} from "../relation/storedRelation";

/**
 * Project interface to store information about project relations and expressions relation.
 * Does not store custom settings about saving file types etc.
 */
export interface Project {
    relations: StoredRelationData[],
    expressions: Expression[],
    nullValuesSupport: boolean
}

/**
 * Checks whether the given value is Project (i.e., has all required fields of required types).
 *
 * @param obj value to be checked
 * @return "OK" string if the given obj is Project or string description of found error in the structure
 */
export function isProjectObject(obj: any): string {
    if (typeof obj !== "object") {
        return 'The file cannot be parsed to an object.';
    }
    if (!("relations" in obj) || !Array.isArray(obj.relations) || obj.relations.length === 0 ||
        obj.relations.some((o: any) => !isStoredRelationData(o))) {
        return 'The file must contain the field "relations: StoredRelationData[]" of length at least one';
    }
    if (!("expressions" in obj) || !Array.isArray(obj.expressions) || obj.expressions.length === 0 ||
        obj.expressions.some((o: any) => !isExpression(o))) {
        return 'The file must contain the field "expressions: Expression[]" of length at least one';
    }
    if (!("nullValuesSupport" in obj) || typeof obj.nullValuesSupport !== "boolean") {
        return 'The file must contain the field "nullValuesSupport: boolean"';
    }
    return 'OK';
}