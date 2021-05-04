import React, {Component} from 'react';
import {Relation}  from '../relation/relation';
import RATreeNode from "../ratree/raTreeNode";
import {ExpressionSection} from "./expressionSection";
import {ResultSection} from "./resultSection";
import {ExpressionStoreManager} from "../expression/expressionStoreManager";
import {ManagementSection} from "./managementSection";
import {CsvValueSeparator} from "../types/csvSupport";
import {ProjectStoreManager} from "../project/projectStoreManager";
import {language, LanguageDef, SupportedLanguage} from "../language/language";
import {LocalStorage} from "../utils/localStorage";
import {BatchProcessor} from "../batch/batchProcessor";
import {Expression} from "../expression/expression";
import {RelationsSection} from "./relationsSection";
import {StoredRelation} from "../relation/storedRelation";
import {SupportedColumnType} from "../relation/columnType";
import {RelationStoreManager} from "../relation/relationStoreManager";
import {Mail} from "../utils/mail";
import {POSTMAIL_ACCESS_TOKEN} from "../postMailAccessToken";
import {copyProject, Project} from "../project/project";
import {getSamples} from "../project/samples";

/**
 * Props of MainScreen component.
 * @public
 */
interface MainScreenProps {}

interface MainScreenState {
    samples: { name: string, project: Project }[],

    loadedRelations: Map<string, Relation>,
    storedRelations: StoredRelation[],
    selectedRelation: number,

    expressions: Expression[],
    selectedExpression: number,

    evaluationTreeRoot: RATreeNode | null,
    evaluatedExpressionName: string,

    nullValuesSupport: boolean,
    csvValueSeparator: CsvValueSeparator,
    language: LanguageDef,
    darkTheme: boolean
}

/**
 * Main component of Rachel web page. It wraps all page sections and passes messages between them.
 * Accepts {@link MainScreenProps} props.
 *
 * @public
 */
export class MainScreen extends Component<MainScreenProps, MainScreenState> {

    private readonly expressionSectionRef: React.RefObject<ExpressionSection>;

    constructor(props: MainScreenProps) {
        super(props);

        // sets body template by settings from local storage
        document.body.classList.toggle('body-dark', LocalStorage.getDarkMode());
        document.body.classList.toggle('body-light', !LocalStorage.getDarkMode());

        const initRelationData = {
            name: "Relation",
            columnNames: ["Column1", "Column2", "Column3"],
            columnTypes: ["number", "string", "boolean"],
            rows: [
                ['', '', '']
            ],
            columnCount: 3,
            rowCount: 1
        };

        this.state = {
            samples: getSamples(),

            loadedRelations: new Map<string, Relation>(),
            storedRelations: [ StoredRelation.fromData(initRelationData, true) ],
            selectedRelation: 0,

            expressions: [ {name: "Expression 1", text: ""} ],
            selectedExpression: 0,

            evaluationTreeRoot: null,
            evaluatedExpressionName: "",

            nullValuesSupport: true,
            csvValueSeparator: LocalStorage.getCsvValueSeparator(),
            language: language(),
            darkTheme: LocalStorage.getDarkMode()
        }
        this.expressionSectionRef = React.createRef();
    }

    /**
     * Reports an error to the author of the application via email.
     *
     * @param err unexpected error
     */
    private reportUnexpectedError = (err: Error): void => {
        const postMail: Mail = new Mail(POSTMAIL_ACCESS_TOKEN);
        let body: string = "Unexpected error " + err.name + " in Rachel application." +
            "\n\nMessage:\n" + err.message +
            "\n\nDate:\n" + new Date().toString() +
            "\n\nStack trace:\n" + err.stack +

            "\n\nLoaded relations: ----------------------------\n" +
            [...this.state.loadedRelations.values()].map(relation => {
                return relation.getName() + "\n" + relation.contentString();
            }).join("\n\n") +

            "\n\nStored relations: ----------------------------" +
            "\nSelected relation (1-index): " + (this.state.selectedRelation + 1) + "\n\n" +
            this.state.storedRelations.map(rel => StoredRelation.format(rel)).join("\n\n") +

            "\n\nExpressions: ----------------------------" +
            "\nSelected expression (1-index): " + (this.state.selectedExpression + 1) + "\n\n" +
            this.state.expressions.map(expr => expr.text).join("\n\n###\n\n") +

            "\n\nEvaluation tree:\n" + this.state.evaluationTreeRoot?.printInLine() +

            "\n\nOther state: ----------------------------" +
            "\ncsvValueSeparator: " + this.state.csvValueSeparator +
            "\nlanguage:          " + this.state.language +
            "\nnullValuesSupport: " + this.state.nullValuesSupport +
            "\ndarkTheme:         " + this.state.darkTheme;

        postMail.send("Rachel application unexpected error", body);
        console.error('Unexpected error: ' + err.stack);
    }

    /**
     * Overwrites the current project data with the given one.
     *
     * @param project
     */
    private loadProject = (project: Project): void => {
        this.setState({
            loadedRelations: new Map<string, Relation>(),
            storedRelations: project.relations.map(r => StoredRelation.fromData(r, project.nullValuesSupport)),
            selectedRelation: 0,
            expressions: project.expressions,
            nullValuesSupport: project.nullValuesSupport,
            selectedExpression: 0,
            evaluationTreeRoot: null,
            evaluatedExpressionName: ""
        }, () => {
            console.log("Project loaded.");
            this.updateExpressionsErrors();
        });
    }

    /**
     * Adds number after the given name if it already exists in stored relation.
     */
    private ensureUniqueRelationName = (name: string): string => {
        if (this.state.storedRelations.map(sr => sr.getName()).indexOf(name) > -1) {
            for (let i = 2; true; ++i) {
                if (this.state.storedRelations.map(sr => sr.getName()).indexOf(name + i) === -1) {
                    name += i;
                    break;
                }
            }
        }
        return name;
    }

    /****************************************** MANAGEMENT SECTION HANDLERS ******************************************/

    /**
     * Processes multiple selected files with expressions by the user and saves the reports of the evaluation in textual
     * files.
     */
    private handleBatch = () => {
        BatchProcessor.process('rachel-eval-results');
    }

    /**
     * Opens a file dialog and lets the user choose a .rachel (JSON) file with project to load.
     */
    private handleLoadProject = (): void => {
        ProjectStoreManager.load().then(this.loadProject).catch(console.warn);
    }

    /**
     * Saves the project relation to the .rachel (JSON) file.
     */
    private handleSaveProject = (): void => {
        try {
            ProjectStoreManager.save({
                relations: this.state.storedRelations.map(sr => sr.toDataObject()),
                expressions: this.state.expressions,
                nullValuesSupport: this.state.nullValuesSupport
                }, "project");
            console.log("Project saved.");
        }
        catch (err) {
            console.warn("Project saving failed: " + err.message);
        }
    }

    /**
     * Handles loading a sample project.
     */
    private handleLoadSampleProject = (sample: Project): void => {
        this.loadProject(copyProject(sample));
    }

    /**
     * Changes the support of the null values in relations.
     *
     * @param nullValuesSupport new support of the null values in relations
     */
    private handleNullValuesSupportChange = (nullValuesSupport: boolean): void => {
        this.state.storedRelations.forEach(sr => sr.setNullValuesSupport(nullValuesSupport));
        // null values change can change validity of the relations, therefore set as not actual
        this.setState({nullValuesSupport: nullValuesSupport}, this.updateExpressionsErrors);
    }

    /**
     * Changes the value separator used in generated CSV files.
     *
     * @param csvValueSeparator new value separator used in generated CSV files
     */
    private handleCsvValueSeparatorChange = (csvValueSeparator: CsvValueSeparator): void => {
        LocalStorage.setCsvValueSeparator(csvValueSeparator);
        this.setState({csvValueSeparator: csvValueSeparator});
    }

    /**
     * Changes the language of the application.
     *
     * @param lang new language of the application
     */
    private handleLanguageChange = (lang: SupportedLanguage): void => {
        LocalStorage.setLanguage(lang);
        // updates language of errors in stored relations
        this.state.storedRelations.forEach(r => r.recomputeErrors());
        this.setState({language: language()});
    }

    /**
     * Changes the dark/light mode of the application.
     *
     * @param darkTheme true if dark theme is on
     */
    private handleDarkModeChange = (darkTheme: boolean) => {
        LocalStorage.setDarkMode(darkTheme);
        this.setState({darkTheme: darkTheme});
        document.body.classList.toggle( 'body-dark', darkTheme);
        document.body.classList.toggle( 'body-light', !darkTheme);
    }

    /******************************************* RELATION SECTION HANDLERS *******************************************/

    private handleRelationNameChange = (name: string): void => {
        this.setState(state => {
            const storedRelations = state.storedRelations;
            storedRelations[this.state.selectedRelation].setName(name);
            return {storedRelations: storedRelations};
        });
    }

    private handleRelationColumnNameChange = (columnName: string, columnIndex: number): void => {
        this.setState(state => {
            const storedRelations = state.storedRelations;
            storedRelations[this.state.selectedRelation].setColumnName(columnName, columnIndex);
            return {storedRelations: storedRelations};
        });
    }

    private handleRelationColumnTypeChange = (columnType: SupportedColumnType, columnIndex: number): void => {
        this.setState(state => {
            const storedRelations = state.storedRelations;
            storedRelations[this.state.selectedRelation].setColumnType(columnType, columnIndex);
            return {storedRelations: storedRelations};
        });
    }

    private handleRelationRowInputChange = (input: string, columnIndex: number, rowIndex: number): void => {
        this.setState(state => {
            const storedRelations = state.storedRelations;
            storedRelations[this.state.selectedRelation].setRowInput(input, rowIndex, columnIndex);
            return {storedRelations: storedRelations};
        });
    }

    private handleRelationNewRow = (onDone: () => void): void => {
        this.state.storedRelations[this.state.selectedRelation].addNewRow();
        // forces update
        this.setState({}, onDone);
    }

    private handleRelationNewColumn = (onDone: () => void): void => {
        this.state.storedRelations[this.state.selectedRelation].addNewColumn();
        // forces update
        this.setState({}, onDone);
    }

    private handleRelationDeleteRow = (rowIndex: number): void => {
        this.state.storedRelations[this.state.selectedRelation].deleteRow(rowIndex);
        // forces update
        this.setState({});
    }

    private handleRelationDeleteColumn = (columnIndex: number): void => {
        this.state.storedRelations[this.state.selectedRelation].deleteColumn(columnIndex);
        // forces update
        this.setState({});
    }

    /**
     * Selects a new relation from the relations list as the current one.
     */
    private handleSelectDifferentRelation = (newIndex: number): void => {
        this.setState({selectedRelation: newIndex});
    }

    /**
     * Moves a relation from the given "from" index to the given "to" index.
     */
    private handleDragRelation = (from: number, to: number): void => {
        // dragging left
        if (from > to) {
            const before = this.state.storedRelations.slice(0, to);
            const moved = this.state.storedRelations.slice(to, from);
            const fromValue = this.state.storedRelations[from];
            const after = this.state.storedRelations.slice(from + 1);
            const newArray = [...before, fromValue, ...moved, ...after];
            this.setState({storedRelations: newArray, selectedRelation: to});
        }
        // dragging right
        else if (from < to) {
            const before = this.state.storedRelations.slice(0, from);
            const fromValue = this.state.storedRelations[from];
            const moved = this.state.storedRelations.slice(from + 1, to + 1);
            const after = this.state.storedRelations.slice(to + 1);
            const newArray = [...before, ...moved, fromValue, ...after];
            this.setState({storedRelations: newArray, selectedRelation: to});
        }
    }

    /**
     * Creates a new empty relation and adds it in the relation list.
     */
    private handleCreateNewRelation = (): void => {
        // inserts a new empty relation in the array
        const newIndex: number = this.state.selectedRelation + 1;
        let name: string = this.ensureUniqueRelationName("NewRelation");
        this.state.storedRelations.splice(newIndex, 0, StoredRelation.new(name, this.state.nullValuesSupport));
        this.setState({selectedRelation: newIndex});
    }

    /**
     * Deletes the current relation from the relations list (or clears it if it is the last relation in the list).
     */
    private handleDeleteRelation = (): void => {
        // if there is the last relation, only clears it
        if (this.state.storedRelations.length === 1) {
            this.setState({storedRelations: [StoredRelation.new("Relation", this.state.nullValuesSupport)]});
            return;
        }
        const selected: number = this.state.selectedRelation;
        this.state.storedRelations.splice(selected, 1);
        if (selected === this.state.storedRelations.length) {
            this.setState({selectedRelation: selected - 1}, this.updateExpressionsErrors);
        }
        else {
            // forces update
            this.setState({}, this.updateExpressionsErrors);
        }
    }

    /**
     * Reverts the current selected stored relation to its last loaded state.
     */
    private handleRevertRelation = (): void => {
        this.setState(state => {
            const storedRelations = state.storedRelations;
            storedRelations[this.state.selectedRelation].revert();
            return {storedRelations};
        });
    }

    /**
     * Removes all relations loaded in the application.
     */
    private handleRemoveLoadedRelations = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        const previous = this.state.loadedRelations.size;
        this.state.loadedRelations.clear();
        this.state.storedRelations.forEach(sr => sr.setActual(false));
        onDone(previous + lang.deleteLoadedRelations);
        // forces update
        this.setState({}, this.updateExpressionsErrors);
    }

    /**
     * Saves the relations list in a textual file.
     *
     * @param onDone
     */
    private handleExportRelations = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        try {
            RelationStoreManager.save(this.state.storedRelations, "relations", this.state.csvValueSeparator);
            onDone(this.state.storedRelations.length + lang.relationsExportOK);
        }
        catch (err) {
            onDone(lang.relationsExportErr + err);
        }
    }

    /**
     * Loads the relations list from the textual file selected by the user.
     *
     * @param onDone
     */
    private handleImportRelations = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        RelationStoreManager.load(this.state.nullValuesSupport).then(info => {
            const countBefore: number = this.state.storedRelations.length;
            // loads relations to application
            info.relations.forEach(relation => {
                const name = this.ensureUniqueRelationName(relation.getName());
                relation.setName(name);
                this.state.storedRelations.push(relation);
            });
            if (info.relations.length > 0) {
                // shows first loaded relation
                this.setState({selectedRelation: countBefore});
            }
            onDone(info.relations.length + lang.relationsImport[0] + info.skipped + lang.relationsImport[1])
        });
    }

    private handleLoadRelation = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        const currRelation: StoredRelation = this.state.storedRelations[this.state.selectedRelation];
        currRelation.setActual(true);
        this.state.loadedRelations.set(currRelation.getName(), currRelation.createRelation());
        const msgPart2: string = this.state.loadedRelations.size === 0 ? lang.loadedRelationsTotalNo :
            this.state.loadedRelations.size + lang.loadedRelationsTotalSome + [...this.state.loadedRelations.keys()].join(', ') + ".";
        onDone(lang.loadRelationNew + "\n" + msgPart2);
        // forces update
        this.setState({}, this.updateExpressionsErrors);
    }

    private handleLoadAllRelations = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        let loaded: number = 0;
        let skipped: number = 0;
        this.state.storedRelations.forEach(sr => {
            if (sr.isValid()) {
                sr.setActual(true);
                this.state.loadedRelations.set(sr.getName(), sr.createRelation());
                ++loaded;
            }
            else {
                ++skipped;
            }
        });
        const msgPart2: string = this.state.loadedRelations.size === 0 ? lang.loadedRelationsTotalNo :
            this.state.loadedRelations.size + lang.loadedRelationsTotalSome + [...this.state.loadedRelations.keys()].join(', ') + ".";
        onDone(loaded + lang.loadAllRelationsNew[0] + skipped + lang.loadAllRelationsNew[1] + "\n" + msgPart2);
        // forces update
        this.setState({}, this.updateExpressionsErrors);
    }

    /****************************************** EXPRESSION SECTION HANDLERS ******************************************/

    private updateExpressionsErrors = (): void => {
        const expressionSection = this.expressionSectionRef.current;
        if (expressionSection !== null) {
            expressionSection.updateErrorsAndParentheses();
        }
    }

    /**
     * Saves evaluation tree for the evaluated RA expression.
     */
    private handleExprEval = (tree: RATreeNode): void => {
        this.setState({
            evaluationTreeRoot: tree,
            evaluatedExpressionName: this.state.expressions[this.state.selectedExpression].name
        });
    }

    /**
     * Updates the text of the current expression and sets it as not actual.
     */
    private handleExprTextChange = (name: string, text: string): void => {
        this.setState(state => {
            let expressions: Expression[] = state.expressions;
            expressions[state.selectedExpression] = {name: name, text: text};
            return { expressions: expressions }
        });
    }

    /**
     * Selects a new expression from the expression list as the current one.
     */
    private handleSelectDifferentExpression = (newIndex: number): void => {
        this.setState({ selectedExpression: newIndex }, this.updateExpressionsErrors);
    }

    /**
     * Moves a expression from the given "from" index to the given "to" index.
     */
    private handleDragExpression = (from: number, to: number): void => {
        // dragging left
        if (from > to) {
            const before = this.state.expressions.slice(0, to);
            const moved = this.state.expressions.slice(to, from);
            const fromValue = this.state.expressions[from];
            const after = this.state.expressions.slice(from + 1);
            const newArray = [...before, fromValue, ...moved, ...after];
            this.setState({expressions: newArray, selectedExpression: to});
        }
        // dragging right
        else if (from < to) {
            const before = this.state.expressions.slice(0, from);
            const fromValue = this.state.expressions[from];
            const moved = this.state.expressions.slice(from + 1, to + 1);
            const after = this.state.expressions.slice(to + 1);
            const newArray = [...before, ...moved, fromValue, ...after];
            this.setState({expressions: newArray, selectedExpression: to});
        }
    }

    /**
     * Creates a new empty expression and adds it in the expression list.
     */
    private handleCreateNewExpression = (): void => {
        // inserts a new empty expression in the array
        const newIndex: number = this.state.selectedExpression + 1;
        this.state.expressions.splice(newIndex, 0, {name: "New expression", text: ""});
        this.setState({selectedExpression: newIndex});
    }

    /**
     * Deletes the current expression from the expression list (or clears it if it is the last expression in the list).
     */
    private handleDeleteExpression = (onDone: () => void): void => {
        // if there is the last expression, only clears it
        if (this.state.expressions.length === 1) {
            return this.handleExprTextChange("Expression 1", "");
        }
        const selected: number = this.state.selectedExpression;
        this.state.expressions.splice(selected, 1);
        if (selected === this.state.expressions.length) {
            this.setState({selectedExpression: selected - 1}, onDone);
        }
        else {
            // forces update
            this.setState({}, onDone);
        }
    }

    /**
     * Saves the expression list in a textual file.
     *
     * @param onDone
     */
    private handleExportExpressions = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        try {
            ExpressionStoreManager.save(this.state.expressions, 'expressions');
            onDone(lang.expressionsExportOK);
        }
        catch (err) {
            onDone(lang.expressionsExportErr + err.message);
        }
    }

    /**
     * Loads the expression list from the textual file selected by the user.
     *
     * @param onDone
     */
    private handleImportExpressions = (onDone: (msg: string) => void): void => {
        const lang = this.state.language.userMessages;
        ExpressionStoreManager.load().then(info => {
            this.state.expressions.push(...info.expressions);
            this.setState({});
            onDone(info.expressions.length + lang.expressionsImport[0] + info.loadedFiles + lang.expressionsImport[1] +
                + info.skippedExpressions + lang.expressionsImport[2] + info.skippedFiles + lang.expressionsImport[3]);
        });
    }

    /******************************************** RESULT SECTION HANDLERS ********************************************/

    /**
     * Adds the given relation to defined relations.
     *
     * @return message and its color (red for errors, black for information)
     */
    private addResultRelation = (relation: Relation): void => {
        const name = this.ensureUniqueRelationName("Evaluated");
        const storedRelation = StoredRelation.fromRelation(name, relation, this.state.nullValuesSupport);
        this.state.storedRelations.push(storedRelation);
        this.setState({selectedRelation: this.state.storedRelations.length - 1});
    }

    /***************************************************** RENDER *****************************************************/

    public render() {
        let resultSection = null;
        if (this.state.evaluationTreeRoot !== null) {
            resultSection = (
                <ResultSection
                    evaluationTreeRoot={this.state.evaluationTreeRoot}
                    expressionName={this.state.evaluatedExpressionName}

                    onAddResult={this.addResultRelation}
                    onUnexpectedError={this.reportUnexpectedError}

                    csvValueSeparator={this.state.csvValueSeparator}
                    darkTheme={this.state.darkTheme}
                    language={this.state.language}
                />
            );
        }

        return (
            <main>
                <ManagementSection
                    onBatch={this.handleBatch}
                    onLoadProject={this.handleLoadProject}
                    onSaveProject={this.handleSaveProject}
                    onLoadSample={this.handleLoadSampleProject}

                    csvValueSeparator={this.state.csvValueSeparator}
                    language={this.state.language}
                    nullValuesSupport={this.state.nullValuesSupport}
                    darkTheme={this.state.darkTheme}

                    onCsvValueSeparatorChange={this.handleCsvValueSeparatorChange}
                    onLanguageChange={this.handleLanguageChange}
                    onNullValuesSupportChange={this.handleNullValuesSupportChange}
                    onDarkModeChange={this.handleDarkModeChange}
                />

                <RelationsSection
                    storedRelations={this.state.storedRelations}
                    storedRelationIndex={this.state.selectedRelation}

                    loadedRelations={[...this.state.loadedRelations.values()]}

                    onRelationNameChange={this.handleRelationNameChange}
                    onColumnNameChange={this.handleRelationColumnNameChange}
                    onColumnTypeChange={this.handleRelationColumnTypeChange}
                    onRowInputChange={this.handleRelationRowInputChange}
                    onNewRow={this.handleRelationNewRow}
                    onNewColumn={this.handleRelationNewColumn}
                    onDeleteRow={this.handleRelationDeleteRow}
                    onDeleteColumn={this.handleRelationDeleteColumn}

                    onSelectDifferentRelation={this.handleSelectDifferentRelation}
                    onDragRelation={this.handleDragRelation}
                    onNewRelation={this.handleCreateNewRelation}
                    onLoadRelation={this.handleLoadRelation}
                    onDeleteStoredRelation={this.handleDeleteRelation}
                    onRevertRelation={this.handleRevertRelation}

                    onLoadAllRelations={this.handleLoadAllRelations}
                    onRemoveLoadedRelations={this.handleRemoveLoadedRelations}
                    onExportRelations={this.handleExportRelations}
                    onImportRelations={this.handleImportRelations}

                    nullValuesSupport={this.state.nullValuesSupport}
                    language={this.state.language}
                />

                <ExpressionSection
                    ref={this.expressionSectionRef}

                    expressions={this.state.expressions}
                    currentExpressionIndex={this.state.selectedExpression}
                    relations={this.state.loadedRelations}

                    onChange={this.handleExprTextChange}
                    onEval={this.handleExprEval}

                    onSelectDifferentExpression={this.handleSelectDifferentExpression}
                    onDragExpression={this.handleDragExpression}
                    onNewExpression={this.handleCreateNewExpression}
                    onDeleteExpression={this.handleDeleteExpression}
                    onExportExpressions={this.handleExportExpressions}
                    onImportExpressions={this.handleImportExpressions}

                    onUnexpectedError={this.reportUnexpectedError}
                    nullValuesSupport={this.state.nullValuesSupport}
                    darkTheme={this.state.darkTheme}
                    language={this.state.language}
                />

                {resultSection}
            </main>
        );
    }
}