import {FileDialog} from "../utils/fileDialog";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import {Relation} from "../relation/relation";
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
import {createCountComparator, createOperationsCounter, OperationRule, QueryRule, TableRule} from "./configUtils";
import {language} from "../language/language";

/**
 * Class for processing multiple input .rachel project files and generating their reports.
 * @category Batch
 * @public
 */
export class BatchProcessor {

  private static loadType: "files" | "zip" = "zip";
  private static resultFilename: string = "rachel-eval-results";
  private static configurationFileName: string | null = null;
  private static operationRules: OperationRule[] = [];
  private static tableRules: TableRule[] = [];
  private static queryRules: QueryRule[] = [];

  /**
   * Opens file dialog and loads configuration from a JSON file.
   *
   * @return promise with string description of the loaded configuration
   * @public
   */
  public static config(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      FileDialog.openFile(".json").then(file => {
        if (file.text === null) {
          return reject('No content read from the configuration file ' + file.name);
        } else if (file.name.match(/\.json$/)) {
          BatchProcessor.configurationFileName = file.name;
          BatchProcessor.operationRules = [];
          BatchProcessor.tableRules = [];
          BatchProcessor.queryRules = [];
          try {
            const config = JSON.parse(file.text);
            let loaded = 0;
            let skipped = 0;
            for (const ruleName in config) {
              const rule = config[ruleName];
              if (BatchProcessor.createRule(ruleName, rule)) {
                ++loaded;
              } else {
                ++skipped;
              }
            }
            return resolve(loaded + ' rules loaded from the configuration file, ' + skipped + ' skipped');
          } catch (e) {
            return reject('Invalid configuration file ' + file.name + ': ' + e);
          }
        } else {
          return reject('Unsupported type of the configuration file ' + file.name);
        }
      });
    });
  }

  /**
   * Returns formatted information about current loaded config file and its rules.
   *
   * @return string information
   */
  public static getConfigInfo(): string {
    if (BatchProcessor.configurationFileName !== null) {
      const msg = language().managementSection.batchConfigInfo;
      return msg[0] + BatchProcessor.configurationFileName + msg[1] +
        (BatchProcessor.operationRules.length + BatchProcessor.tableRules.length + BatchProcessor.queryRules.length) + msg[2];
    }
    return language().managementSection.batchNoConfig;
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
    // @ts-ignore
    const description = ruleDef.description ? ": " + ruleDef.description : "";
    // case of an operation rule
    if (fields.indexOf("operations") > -1) {
      if (fields.indexOf("count") === -1 && fields.indexOf("each") === -1) {
        console.log("Operations rule " + ruleName + " does not have a specified count nor each.");
        return false;
      }
      let created = false;
      // @ts-ignore
      const ops: string[] = Array.isArray(ruleDef.operations) ? ruleDef.operations : [ruleDef.operations];
      // creates one rule for all operations together
      if (fields.indexOf("count") > -1) {
        // @ts-ignore
        const comparator = createCountComparator(ruleDef.count);
        // @ts-ignore
        const counter = createOperationsCounter(ops);
        if (comparator !== undefined && counter !== undefined) {
          const rule = (x: OperationsCount) => comparator(counter(x)) ? "OK" : "ERROR " + ruleName + description;
          BatchProcessor.operationRules.push(rule);
          created = true;
        }
      }
      // creates a rule for each operation in operations field
      if (fields.indexOf("each") > -1) {
        // @ts-ignore
        ops.forEach((op: string) => {
          // @ts-ignore
          const comparator = createCountComparator(ruleDef.each);
          // @ts-ignore
          const counter = createOperationsCounter(op);
          if (comparator !== undefined && counter !== undefined) {
            const rule = (x: OperationsCount) =>
              comparator(counter(x)) ? "OK" : "ERROR " + ruleName + description + " (" + op + ")";
            BatchProcessor.operationRules.push(rule);
            created = true;
          }
        });
      }
      return created;
    }
    // case of a table rule
    else if (fields.indexOf("tables") > -1) {
      // @ts-ignore
      const comparator = createCountComparator(ruleDef.tables);
      if (comparator !== undefined) {
        const rule = (x: number) => comparator(x) ? "OK" : "ERROR " + ruleName + description;
        BatchProcessor.tableRules.push(rule);
        return true;
      }
    }
    // case of a query rule
    else if (fields.indexOf("queries") > -1) {
      // @ts-ignore
      const comparator = createCountComparator(ruleDef.queries);
      if (comparator !== undefined) {
        const rule = (x: number) => comparator(x) ? "OK" : "ERROR " + ruleName + description;
        BatchProcessor.queryRules.push(rule);
        return true;
      }
    }
    return false;
  }

  /**
   * Opens file dialog and processes project files selected by the user.
   * If the configuration is set to use multiple files, lets the user select multiple .rachel files.
   * If the configuration is set to use a zip file, lets the user select one zip file with .rachel files.
   * For each .rachel file creates a textual evaluation report.
   *
   * @public
   */
  public static process(): void {
    if (BatchProcessor.loadType === "files") {
      FileDialog.openFiles(".rachel").then(files => BatchProcessor.processFiles(files));
    } else {
      FileDialog.openZip()
        .then(result => JSZip.loadAsync(result, {createFolders: true}))
        .then(zip => {
          // final array of unzipped files
          const files: { name: string, text: string }[] = [];
          // uses only .rachel files in a ZIP
          const zippedFiles = Object.values(zip.files).filter(file => !file.dir);
          const count = zippedFiles.length;
          zippedFiles.forEach(zippedFile => {
            zippedFile.async("string").then(text => {
              files.push({name: zippedFile.name, text});
              // if all files are unzipped, processes them
              if (files.length === count) {
                BatchProcessor.processFiles(files);
              }
            });
          });
        })
        .catch(_ => {
          console.warn("Error in loading a zip file.");
          MessageBox.error("Error in loading a zip file.");
        });
    }
  }

  /**
   * For each given file creates a report.
   *
   * @param files loaded textual files expected to be .rachel project files
   */
  private static processFiles = (files: { name: string, text: string | null }[]) => {
    console.log(files.length + ' files loaded to BatchProcessor');
    console.time("Batch duration");

    let reports: { name: string, text: string }[] = [];
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
      } else if (file.name.match(/\.rachel$/)) {
        // @ts-ignore - file.text cannot be null now
        reports.push(BatchProcessor.processFile(file));
        processed += 1;
      } else {
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
        saveAs(content, BatchProcessor.resultFilename + ".zip");
        console.log("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
        MessageBox.message("Batch finished: " + processed + " files processed, " + skipped + " skipped.");
      }).catch(err => {
        MessageBox.error("Batch results saving error: " + err.message);
      });
      console.timeEnd("Batch duration");
    }

    processNext(0);
  }

  /**
   * Tries to parse Project object from given file.text. If successful, parses relations in the project, evaluates
   * expressions in the project and generates textual report: header (see reportHeader()),
   * formatted relations (see formatRelations()) and formatted expressions (see processExpression()).
   */
  private static processFile = (file: { name: string, text: string }): { name: string, text: string } => {
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
      text: BatchProcessor.reportHeader(file.name, project.relations.length, exprCount, errors, ops, project.nullValuesSupport) +
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
      } catch (ignored) {
      }
    });
    return map;
  }

  /**
   * Processes the given expression in the context of the given parser. Returns a formatted expression and its result
   * (or error), a count of used RA operations and 0/1 error indicator.
   */
  private static processExpression = (expr: Expression, parser: ExprParser): { text: string, counts: OperationsCount, error: number } => {
    try {
      const evaluationTree = parser.parse(expr.text);
      const counts: OperationsCount = operationsOfTree(evaluationTree);
      const relation: Relation = evaluationTree.getResult();
      return {
        text: contentLine + '\n' + expr.name + '\n\n' + expr.text + '\n\n' + relation.contentString() + '\n\n\n',
        counts: counts,
        error: 0
      };
    } catch (err) {
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
   * @param name name of the processed file
   * @param rels count of relations
   * @param exprs count of expressions
   * @param errs count of errors
   * @param ops count of operations
   * @param nvs whether null values are supported
   */
  private static reportHeader = (name: string, rels: number, exprs: number, errs: number, ops: OperationsCount, nvs: boolean): string => {
    const total: number = totalOperations(ops);
    const binary: number = binaryOperations(ops);
    const unary: number = unaryOperations(ops);
    const ruleErrors: string[] = BatchProcessor.operationRules.map(rule => rule(ops)).filter(msg => msg !== "OK");
    ruleErrors.push(...BatchProcessor.tableRules.map(rule => rule(rels)).filter(msg => msg !== "OK"));
    ruleErrors.push(...BatchProcessor.queryRules.map(rule => rule(exprs)).filter(msg => msg !== "OK"));
    return sectionLine + '\n\nRachel project report from ' + new Date().toLocaleString('cs-CZ') + '\nSource: ' +
      name + '\n\n' + sectionLine + '\n\nQueries: ' + exprs + '    Invalid queries: ' + errs + '\n\n' +
      (ruleErrors.length === 0 ? 'All rules OK' : 'Rule errors:\n' + ruleErrors.join('\n')) + '\n\n' +
      'Used operations (' + total + ' in total: ' + binary + ' binary, ' + unary + ' unary):\n' +
      '    Selection: ' + ops.selection + '\n' +
      '    Projection: ' + ops.projection + '\n' +
      '    Rename: ' + ops.rename + '\n\n' +
      '    Union: ' + ops.union + '\n' +
      '    Intersection: ' + ops.intersection + '\n' +
      '    Difference: ' + ops.difference + '\n\n' +
      '    Natural join: ' + ops.natural + '\n' +
      '    Cartesian product: ' + ops.cartesian + '\n' +
      '    Semijoin: ' + ops.semijoin + '\n' +
      '    Antijoin: ' + ops.antijoin + '\n' +
      '    Theta Join: ' + ops.thetaJoin + '\n' +
      '    Theta Semijoin: ' + ops.thetaSemijoin + '\n\n' +
      '    Outer Join: ' + ops.outerJoin + '\n\n' +
      '    Division: ' + ops.division + '\n\n' +
      'Null values ' + (nvs ? 'ALLOWED.\n\n' : 'FORBIDDEN.\n\n');
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