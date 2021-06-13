import {FileDialog} from "../utils/fileDialog";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {Relation} from "../relation/relation";
import {formatDate} from "../utils/dateUtils";
import {isProjectObject, Project} from "../project/project";
import {ExprParser} from "../expression/exprParser";
import {StoredRelation, StoredRelationData} from "../relation/storedRelation";
import {Expression} from "../expression/expression";
import {MessageBox} from "../components/messageBox";
import {
    addOperations,
    binaryOperations,
    OperationsCount,
    operationsOfTree,
    totalOperations,
    unaryOperations,
    zeroOperations
} from "./operationsCount";
import {createCountComparator, createOperationsCounter, OperationRule} from "./configUtils";

/**
 * Class for processing multiple input .rachel project files and generating their reports.
 * @category Batch
 * @public
 */
export class BatchProcessor {

    private static operationRules: OperationRule[] = [];

    /**
     * Opens file dialog and loads configuration from a JSON file.
     *
     * @public
     */
    public static config(): void {
        FileDialog.openFile(".json").then(file => {
            if (file.text === null) {
                MessageBox.error('No content read from the configuration file ' + file.name);
                console.warn('No content read from the configuration file ' + file.name);
            }
            else if (file.name.match(/\.json$/)) {
                BatchProcessor.operationRules = [];
                try {
                    const config = JSON.parse(file.text);
                    let loaded = 0;
                    let skipped = 0;
                    for (const ruleName in config) {
                        const rule = config[ruleName]
                        console.log(`${ruleName}: ${rule}`);
                        if (BatchProcessor.createRule(ruleName, rule)) {
                            ++loaded;
                        }
                        else {
                            ++skipped;
                        }
                    }
                    MessageBox.message(loaded + ' rules loaded from the configuration file, ' + skipped + ' skipped');
                    console.log(loaded + ' rules loaded from the configuration file, ' + skipped + ' skipped');
                }
                catch (e) {
                    MessageBox.error('Invalid configuration file ' + file.name + ': ' + e);
                    console.warn('Invalid configuration file ' + file.name + ': ' + e);
                }
            }
            else {
                MessageBox.error('Unsupported type of the configuration file ' + file.name);
                console.warn('Unsupported type of the configuration file ' + file.name);
            }
        });
    }

    /**
     * Creates individual rule object and adds it in BatchProcessor rules array.
     *
     * @param ruleName name of the rule
     * @param ruleDef rule definition from the configuration JSON file
     * @return true if the rule was created successfully
     */
    private static createRule(ruleName: string, ruleDef: object): boolean {
        const fields: string[] = [];
        for (const field in ruleDef) {
            fields.push(field);
        }
        // every rule must have a count field
        if (fields.indexOf("count") === -1) {
            console.log("Rule " + ruleName + " does not have a specified count.")
            return false;
        }
        // @ts-ignore
        const description = ruleDef.description ? ": " + ruleDef.description : "";
        // case of an operation rule
        if (fields.indexOf("operations") > -1) {
            // @ts-ignore
            const comparator = createCountComparator(ruleDef.count);
            if (comparator === undefined) {
                return false;
            }
            // @ts-ignore
            const counter = createOperationsCounter(ruleDef.operations);
            if (counter === undefined) {
                return false;
            }
            const rule = (x: OperationsCount) => comparator(counter(x)) ? "OK" : "ERROR " + ruleName + description;
            BatchProcessor.operationRules.push(rule);
            return true;
        }
        return false;
    }

    /**
     * Opens file dialog and processes project files selected by the user. For each .rachel file creates a textual evaluation
     * report.
     *
     * @param filename name of the downloaded zip file - individual reports has names derived from their original files {@type string}
     * @public
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
                const zip: JSZip = JSZip();
                reports.forEach(report => {
                    zip.file(report.name, report.text);
                })
                zip.generateAsync({type: "blob"}).then(content => {
                    saveAs(content, filename + ".zip");
                    console.log("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
                    MessageBox.message("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
                }).catch(err => {
                    MessageBox.error("Batch results saving error: " + err.message);
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
            name: file.name.slice(0, -7) + '-eval-report.txt',
            text: BatchProcessor.reportHeader(exprCount, errors, ops, project.nullValuesSupport) +
                  BatchProcessor.formatRelations(project.relations) +
                  sectionLine + "\n\nQUERIES (" + exprCount + ")\n\n" +
                  reports.map(r => r.text).join('')
        };
    }

    /**
     * Creates Relation representation for given StoredRelationData array.
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
            catch (ignored) {}
        });
        return map;
    }

    /**
     * Processes the given expression in the context of the given parser. Returns a formatted expression and its result
     * (or error), a count of used RA operations and 0/1 error indicator.
     */
    private static processExpression = (expr: Expression, parser: ExprParser): {text: string, counts: OperationsCount, error: number} => {
        try {
            const evaluationTree = parser.parse(expr.text);
            const counts: OperationsCount = operationsOfTree(evaluationTree);
            const relation: Relation = evaluationTree.getResult();
            return {
                text: contentLine + '\n' + expr.name + '\n\n' + expr.text + '\n\n' + relation.contentString() + '\n\n\n',
                counts: counts,
                error: 0
            };
        }
        catch (err) {
            return {
                text: contentLine + '\n' + expr.name + '\n\n' + expr.text + '\n\nERROR: ' + err.message + '\n\n\n',
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
     * @param ops count of operations
     * @param nullValuesSupport whether null values are supported
     */
    private static reportHeader = (expressions: number, errors: number, ops: OperationsCount, nullValuesSupport: boolean): string => {
        const total: number = totalOperations(ops);
        const binary: number = binaryOperations(ops);
        const unary: number = unaryOperations(ops);
        const ruleErrors: string[] = BatchProcessor.operationRules.map(rule => rule(ops)).filter(msg => msg !== "OK");
        return sectionLine + '\n\nRachel project report from ' + formatDate(new Date()) + '\n\n' + sectionLine + '\n\n' +
            'Expressions: ' + expressions + '    Invalid expressions: ' + errors + '\n\n' +
            (ruleErrors.length === 0 ? 'All rules OK' : 'Rule errors:\n' + ruleErrors.join('\n')) + '\n\n' +
            'Used operations (' + total + ' in total: ' + binary + ' binary, ' + unary + ' unary):\n' +
            '    Selection: ' + ops.selection + '\n' +
            '    Projection: ' + ops.projection + '\n' +
            '    Rename: ' + ops.rename + '\n\n' +
            '    Set Operations: ' + ops.setOperation + '\n\n' +
            '    Natural join: ' + ops.natural + '\n' +
            '    Cartesian product: ' + ops.cartesian + '\n' +
            '    Semijoin: ' + ops.semijoin + '\n' +
            '    Antijoin: ' + ops.antijoin + '\n' +
            '    Theta Join: ' + ops.thetaJoin + '\n' +
            '    Theta Semijoin: ' + ops.thetaSemijoin + '\n\n' +
            '    Outer Join: ' + ops.outerJoin + '\n\n' +
            '    Division: ' + ops.division + '\n\n' +
            'Null values ' + (nullValuesSupport ? 'ALLOWED.\n\n' : 'FORBIDDEN.\n\n');
    }

    /**
     * Returns formatted string for the given StoredRelationsData array.
     */
    private static formatRelations = (storedData: StoredRelationData[]): string => {
        const inlines = storedData.map(data => {
            return data.name + "(" + data.columnNames.join(", ") + ")\n"
        }).join('');
        return sectionLine + "\n\nTABLES (" + storedData.length + ")\n\n" + inlines + "\n" +
            storedData.map(data => contentLine + "\n" + data.name + '\n\n' + StoredRelation.format(data)).join('');
    }
}

const sectionLine: string = "################################################################################";
const contentLine: string = "--------------------------------------------------------------------------------";