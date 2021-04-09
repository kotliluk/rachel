import {FileDialog} from "../utils/fileDialog";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import Relation from "../relation/relation";
import RATreeNode from "../ratree/raTreeNode";
import UnaryNode from "../ratree/unaryNode";
import ProjectionNode from "../ratree/projectionNode";
import RenameNode from "../ratree/renameNode";
import SelectionNode from "../ratree/selectionNode";
import BinaryNode from "../ratree/binaryNode";
import AntijoinNode from "../ratree/antijoinNode";
import CartesianProductNode from "../ratree/cartesianProductNode";
import DivisionNode from "../ratree/divisionNode";
import OuterJoinNode from "../ratree/outerJoinNode";
import NaturalJoinNode, {NaturalJoinType} from "../ratree/naturalJoinNode";
import SetOperationNode from "../ratree/setOperationNode";
import {formatDate} from "../utils/dateUtils";
import ThetaJoinNode, {ThetaJoinType} from "../ratree/thetaJoinNode";
import {isProjectObject, Project} from "../project/project";
import {ExprParser} from "../expression/exprParser";
import {StoredRelation, StoredRelationData} from "../relation/storedRelation";
import {Expression} from "../expression/expression";
import {MessageBox} from "../components/messageBox";

/**
 * Class for processing multiple input .txt files with expressions.
 */
export class BatchProcessor {

    /**
     * Opens file dialog and processes files selected by the user. For each .rachel file creates a textual evaluation
     * report. Files are expected to contain valid project data. Returns promise with string message about process.
     */
    public static process(filename: string): void {
        FileDialog.openFiles(".rachel").then(files => {
            console.log(files.length + ' files loaded to BatchProcessor');
            console.time("Batch duration");

            let reports: {name: string, text: string}[] = [];
            let processed: number = 0;
            let skipped: number = 0;

            /**
             * Processes a file on the given index and calls the processing of the next file.
             * If all files were processed, calls downloadReports().
             */
            const processNext = (i: number) => {
                if (i >= files.length) {
                    return downloadReports();
                }
                const file = files[i];
                if (file.text === null) {
                    reports.push({
                        name: file.name + '-eval-report.txt',
                        text: "ERROR: Source file cannot be loaded."
                    });
                    skipped += 1;
                    console.warn('Null read from ' + file.name);
                }
                else if (file.name.match(/\.rachel$/)) {
                    // @ts-ignore - file.text cannot be null now
                    reports.push(BatchProcessor.processFile(file));
                    processed += 1;
                }
                else {
                    reports.push({
                        name: file.name + '-eval-report.txt',
                        text: "ERROR: Source file is not a .rachel file, but: " + file.name
                    });
                    skipped += 1;
                    console.warn('Unsupported filetype: ' + file.name);
                }
                MessageBox.message("Batch in progress... " + (processed + skipped) + "/" + files.length);
                setTimeout(() => processNext(i + 1), 0);
            }

            /**
             * Downloads created reports.
             */
            const downloadReports = () => {
                if (reports.length === 0) {
                    MessageBox.message("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
                }
                const zip: JSZip = JSZip();
                reports.forEach(report => {
                    zip.file(report.name, report.text);
                })
                zip.generateAsync({type: "blob"}).then(content => {
                    saveAs(content, filename + ".zip");
                    console.log("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
                    MessageBox.message("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
                }).catch(err => {
                    MessageBox.error("Results saving error: " + err.message);
                });
                console.timeEnd("Batch duration");
            }

            processNext(0);
        });
    }

    /**
     * Tries to parse Project object from given file.text. If successful, parses relations in the project, evaluates
     * expressions in the project and generates textual report: header (see reportHeader()),
     * formatted relations (see formatRelations()) and formatted expressions (see processExpression()).
     */
    private static processFile = (file: {name: string, text: string}): {name: string, text: string} => {
        const project: Project = JSON.parse(file.text);
        const status = isProjectObject(project);
        if (status !== "OK") {
            return {name: file.name.slice(0, -4) + '-eval-report.txt', text: "Invalid JSON file: " + status};
        }
        const relations: Map<string, Relation> = BatchProcessor.parseRelations(project.relations, project.nullValuesSupport);
        const exprParser: ExprParser = new ExprParser(relations, project.nullValuesSupport);

        const exprCount: number = project.expressions.length;
        const reports = project.expressions.map(e => BatchProcessor.processExpression(e, exprParser));
        const ops: OperationsCount = addOperations(...reports.map(r => r.counts));
        const errors: number = reports.reduce((agg, report) => agg + report.error, 0);

        return {
            name: file.name.slice(0, -5) + '-eval-report.txt',
            text: BatchProcessor.reportHeader(exprCount, errors, ops, project.nullValuesSupport) +
                  BatchProcessor.formatRelations(project.relations) +
                  reports.map(r => r.text).join('')
        };
    }

    /**
     * Creates full Relation representation for given StoredRelationData array.
     */
    private static parseRelations(storedData: StoredRelationData[], nullValuesSupport: boolean): Map<string, Relation> {
        const map: Map<string, Relation> = new Map();
        storedData.forEach(data => {
            try {
                const storedRelation: StoredRelation = StoredRelation.fromData(data, nullValuesSupport);
                if (storedRelation.isValid()) {
                    map.set(storedRelation.getName(), storedRelation.createRelation());
                }
            }
            catch (err) {
                console.log("Definition of relation " + data.name + " has errors, skipping.");
            }
        })
        return map;
    }

    /**
     * Processes given expression in context of given parser. Returns formatted expression and its result (or error),
     * count of used RA operations and 0/1 error indicator.
     */
    private static processExpression = (expr: Expression, parser: ExprParser): {text: string, counts: OperationsCount, error: number} => {
        try {
            const evaluationTree = parser.parse(expr.text);
            const counts: OperationsCount = operationsOfTree(evaluationTree);
            const relation: Relation = evaluationTree.getResult();
            return {
                text: '### ' + expr.name + ' ###\n\n' + expr.text + '\n\n# Result #\n\n' + relation.contentString() + '\n\n',
                counts: counts,
                error: 0
            };
        }
        catch (err) {
            return {
                text: '### ' + expr.name + ' ###\n\n' + expr.text + '\n\n# Error #\n\n' + err.message + '\n\n',
                counts: zeroOperations(),
                error: 1
            };
        }
    }

    /**
     * Creates the header of the report. The header contains the time of the report, count of expressions and errors,
     * count of used operations and null values support info.
     *
     * @param expressions count of expressions
     * @param errors count of errors
     * @param operations count of operations
     * @param nullValuesSupport
     */
    private static reportHeader = (expressions: number, errors: number, operations: OperationsCount, nullValuesSupport: boolean): string => {
        const total: number = totalOperations(operations);
        const binary: number = binaryOperations(operations);
        const unary: number = unaryOperations(operations);
        return 'Rachel project report from ' + formatDate(new Date()) + '\n\n' +
            'Expressions: ' + expressions + '    Errors: ' + errors + '\n\n' +
            'Used operations (' + total + ' in total: ' + binary + ' binary, ' + unary + ' unary):\n' +
            '    Antijoin: ' + operations.antijoin + '\n' +
            '    Cartesian product: ' + operations.cartesian + '\n' +
            '    Division: ' + operations.division + '\n' +
            '    Natural join: ' + operations.natural + '\n' +
            '    Outer Join: ' + operations.outerJoin + '\n' +
            '    Projection: ' + operations.projection + '\n' +
            '    Rename: ' + operations.rename + '\n' +
            '    Selection: ' + operations.selection + '\n' +
            '    Semijoin: ' + operations.semijoin + '\n' +
            '    Set Operations: ' + operations.setOperation + '\n' +
            '    Theta Join: ' + operations.thetaJoin + '\n' +
            '    Theta Semijoin: ' + operations.thetaSemijoin + '\n\n' +
            (nullValuesSupport ? 'Null values ALLOWED.\n\n' : 'Null values FORBIDDEN.\n\n');
    }

    /**
     * Returns formatted string for given StoredRelationsData array.
     */
    private static formatRelations = (storedData: StoredRelationData[]): string => {
        return "### Defined relations ###\n\n" + storedData.map(data => {
            return '# ' + data.name + ' #\n' +
                data.columnNames.join(', ') + '\n' +
                data.columnTypes.join(', ') + '\n' +
                data.rows.map(row => row.join(', ')).join('\n') + '\n\n';
        }).join('');
    }
}

/**
 * Counts of all supported relational algebra operations.
 */
interface OperationsCount {
    antijoin: number,
    cartesian: number,
    division: number,
    natural: number,
    outerJoin: number,
    projection: number,
    rename: number,
    selection: number,
    semijoin: number,
    setOperation: number,
    thetaJoin: number,
    thetaSemijoin: number,
}

/**
 * @return zero count of all operations
 */
function zeroOperations(): OperationsCount {
    return addOperations();
}

/**
 * @return adds given OperationsCounts together
 */
function addOperations(...counts: OperationsCount[]): OperationsCount {
    return {
        antijoin: counts.reduce((agg, count) => agg + count.antijoin, 0),
        cartesian: counts.reduce((agg, count) => agg + count.cartesian, 0),
        division: counts.reduce((agg, count) => agg + count.division, 0),
        natural: counts.reduce((agg, count) => agg + count.natural, 0),
        outerJoin: counts.reduce((agg, count) => agg + count.outerJoin, 0),
        projection: counts.reduce((agg, count) => agg + count.projection, 0),
        rename: counts.reduce((agg, count) => agg + count.rename, 0),
        selection: counts.reduce((agg, count) => agg + count.selection, 0),
        semijoin: counts.reduce((agg, count) => agg + count.semijoin, 0),
        setOperation: counts.reduce((agg, count) => agg + count.setOperation, 0),
        thetaJoin: counts.reduce((agg, count) => agg + count.thetaJoin, 0),
        thetaSemijoin: counts.reduce((agg, count) => agg + count.thetaSemijoin, 0),
    }
}

/**
 * @return sum of all operation counts
 */
function totalOperations(o: OperationsCount): number {
    return binaryOperations(o) + unaryOperations(o);
}

/**
 * @return sum of all binary operation counts
 */
function binaryOperations(o: OperationsCount): number {
    return o.antijoin + o.cartesian + o.division + o.natural + o.outerJoin + o.semijoin + o.setOperation + o.thetaJoin + o.thetaSemijoin;
}

/**
 * @return sum of all unary operation counts
 */
function unaryOperations(o: OperationsCount): number {
    return o.projection + o.rename + o.selection;
}

/**
 * @return counts all operations used in the given tree.
 */
function operationsOfTree(tree: RATreeNode): OperationsCount {
    if (tree instanceof UnaryNode) {
        return addOperations(operationOfUnaryNode(tree), operationsOfTree(tree.getSubtree()));
    }
    if (tree instanceof BinaryNode) {
        return addOperations(operationOfBinaryNode(tree), operationsOfTree(tree.getLeftSubtree()), operationsOfTree(tree.getRightSubtree()));
    }
    // no subtree - relation node
    return zeroOperations();
}

/**
 * @return OperationsCount with one given unary operation count set to 1, other 0
 */
function operationOfUnaryNode(node: UnaryNode): OperationsCount {
    let ret: OperationsCount = zeroOperations();
    if (node instanceof ProjectionNode) {
        ret.projection = 1;
        return ret;
    }
    if (node instanceof RenameNode) {
        ret.rename = 1;
        return ret;
    }
    if (node instanceof SelectionNode) {
        ret.selection = 1;
        return ret;
    }
    return ret;
}

/**
 * @return OperationsCount with one given binary operation count set to 1, other 0
 */
function operationOfBinaryNode(node: BinaryNode): OperationsCount {
    let ret: OperationsCount = zeroOperations();
    if (node instanceof AntijoinNode) {
        ret.antijoin = 1;
        return ret;
    }
    if (node instanceof CartesianProductNode) {
        ret.cartesian = 1;
        return ret;
    }
    if (node instanceof DivisionNode) {
        ret.division = 1;
        return ret;
    }
    if (node instanceof OuterJoinNode) {
        ret.outerJoin = 1;
        return ret;
    }
    if (node instanceof NaturalJoinNode) {
        if (node.getType() === NaturalJoinType.natural) {
            ret.natural = 1;
        }
        else {
            ret.semijoin = 1;
        }
        return ret;
    }
    if (node instanceof SetOperationNode) {
        ret.setOperation = 1;
        return ret;
    }
    if (node instanceof ThetaJoinNode) {
        if (node.getType() === ThetaJoinType.full) {
            ret.thetaJoin = 1;
        }
        else {
            ret.thetaSemijoin = 1;
        }
        return ret;
    }
    return ret;
}