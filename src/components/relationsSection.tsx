import React from "react";
import Relation from "../relation/relation";
import {TooltipButton} from "./tooltipButton";
import {SupportedColumnType} from "../relation/columnType";
import EditRelationTable from "./editRelationTable";
import {StoredRelation} from "../relation/storedRelation";
import {TextInput} from "./textInput";
import {isForbiddenRelationName} from "../utils/keywords";
import StringUtils from "../utils/stringUtils";
import {MessageBox} from "./messageBox";
import {LanguageDef} from "../language/language";

interface RelationsSectionProps {
    // all stored relations
    storedRelations: StoredRelation[],
    // index of the current selected relation
    storedRelationIndex: number,

    // all currently loaded relations in the application
    loadedRelations: Relation[],

    // handler of change of the name of the current selected relation
    onRelationNameChange: (newName: string) => void,
    // handler of change of the name of the column at given index in the current selected relation
    onColumnNameChange: (columnName: string, columnIndex: number) => void,
    // handler of change of the type of the column at given index in the current selected relation
    onColumnTypeChange: (columnType: SupportedColumnType, columnIndex: number) => void,
    // handler of change of the row input at given column/row index in the current selected relation
    onRowInputChange: (input: string, columnIndex: number, rowIndex: number) => void,
    // handler of adding a new row in the current selected relation
    onNewRow: (onDone: () => void) => void,
    // handler of adding a new column in the current selected relation
    onNewColumn: (onDone: () => void) => void,
    // handler of deleting the row on given index
    onDeleteRow: (rowIndex: number) => void,
    // handler of deleting the column on given index
    onDeleteColumn: (columnIndex: number) => void,

    // handler of selecting a different relation as current
    onSelectDifferentRelation: (newIndex: number) => void,
    // handler of creating a new relation
    onNewRelation: () => void,
    // handler of loading the current selected relation into the application
    onLoadRelation: (onDone: (msg: string) => void) => void,
    // handler of deleting the current stored relation
    onDeleteStoredRelation: () => void,

    onRevertRelation: () => void,

    // handler of loading all valid relations into the application
    onLoadAllRelations: (onDone: (msg: string) => void) => void,
    // handler of deleting the loaded relations
    onDeleteLoadedRelations: (onDone: (msg: string) => void) => void,
    // handler of saving the stored relations into the files
    onExportRelations: (onDone: (msg: string) => void) => void,
    // handler of loading new relations from files
    onImportRelations: (onDone: (msg: string) => void) => void,

    // whether to support null values
    nullValuesSupport: boolean,
    // current application language
    language: LanguageDef
}

interface RelationsSectionState {
    sectionClicked: boolean
}

/**
 * Section to type the RA expression. It contains textarea for relations definition and control buttons.
 */
export class RelationsSection extends React.Component<RelationsSectionProps, RelationsSectionState> {

    constructor(props: RelationsSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false
        }
    }

    /**
     * Returns selected stored relation.
     */
    private getCurRel = (): StoredRelation => {
        return this.props.storedRelations[this.props.storedRelationIndex];
    }

    /**
     * Passes change to the parent element if isShowingStored = true. Otherwise, changes the state.loadedRelationIndex.
     */
    private handleSelectDifferentRelation(index: number): void {
        this.props.onSelectDifferentRelation(index);
    }

    /**
     * Passes change of the relation name to the parent element.
     */
    private handleRelationNameChange = (name: string) => {
        this.props.onRelationNameChange(name);
    }

    /**
     * Loads the selected relation to the application if there are no errors in it. Otherwise, displays a message to user.
     */
    private loadRelation = () => {
        if (this.getCurRel().isValid()) {
            this.props.onLoadRelation(MessageBox.message);
        }
        else {
            MessageBox.error("Cannot use the invalid relation. Check errors and try again.");
        }
    }

    /**
     * Passes the load all relations call to the parent.
     */
    private loadAllRelations = () => {
        this.props.onLoadAllRelations(MessageBox.message);
    }

    /**
     * Passes the export stored relations call to the parent.
     */
    private exportRelations = () => {
        this.props.onExportRelations(MessageBox.message);
    }

    /**
     * Passes the import stored relations call to the parent.
     */
    private importRelations = () => {
        this.props.onImportRelations(MessageBox.message);
    }

    /**
     * Passes the call to delete current selected stored relation.
     */
    private deleteRelation = () => {
        this.props.onDeleteStoredRelation();
    }

    private revertRelation = () => {
        this.props.onRevertRelation();
    }

    /**
     * Passes the import create new stored relation to the parent.
     */
    private newRelation = () => {
        this.props.onNewRelation();
    }

    /**
     * Passes the delete all loaded relations call to the parent.
     */
    private deleteAllLoadedRelations = () => {
        this.props.onDeleteLoadedRelations(MessageBox.message);
    }

    /**
     * Handles input with Ctrl key pressed from relation table.
     */
    private handleCtrlInput = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            this.loadRelation();
        }
    }

    /**
     * Creates menu buttons. Buttons for relations with errors are highlighted.
     */
    private createRelationMenuButtons = () => {
        return this.props.storedRelations.map((rel, i) => {
            const className: string = (this.props.storedRelationIndex === i ? "button-clicked" : "");
            const actuality: string = rel.isActual() ? "" : "*";
            const style = rel.isValid() ? {} : {border: "2px solid #fd3030"};
            return (
                <button
                    key={i}
                    onClick={() => this.handleSelectDifferentRelation(i)}
                    className={className}
                    style={style}
                >{actuality + rel.getName()}</button>
            );
        });
    }

    public render() {
        const lang = this.props.language.relationSection;

        const createButton = (text: string, onClick: () => void, tooltip: string, style?: React.CSSProperties) => {
            return (<TooltipButton
                key={text}
                text={text}
                onClick={onClick}
                className={""}
                style={style}
                tooltip={tooltip}
                tooltipClassName={"tooltip"}
            />);
        }

        // the relation cannot be renamed to forbidden relation names and other currently used relation names
        const forbiddenRelationNames: string[] = this.props.storedRelations
            .filter((sr, i) => i !== this.props.storedRelationIndex)
            .map(sr => sr.getName());
        const forbiddenNamesFunction = (text: string): boolean => {
            if (forbiddenRelationNames.indexOf(text) > -1) {
                return true;
            }
            return !StringUtils.isName(text) || isForbiddenRelationName(text);
        }

        return (
            <section className="page-section">
                <header>
                    <h2>{lang.relationSectionHeader}</h2>
                    {createButton(lang.loadAllButton, this.loadAllRelations, lang.loadAllButtonTooltip)}
                    {createButton(lang.removeLoadedButton, this.deleteAllLoadedRelations, lang.removeLoadedButtonTooltip)}
                    {createButton(lang.importButton, this.importRelations, lang.importButtonTooltip)}
                    {createButton(lang.exportButton, this.exportRelations, lang.exportButtonTooltip)}
                </header>

                <menu className="page-section-tab-menu">
                    {this.createRelationMenuButtons()}
                    <button onClick={this.newRelation}
                        style={{minWidth: "0", marginLeft: "10px", padding: "2px 6px 1px 6px"}}>
                        <strong>+</strong>
                    </button>
                </menu>

                <EditRelationTable
                    relation={this.getCurRel()}

                    onColumnNameChange={this.props.onColumnNameChange}
                    onColumnTypeChange={this.props.onColumnTypeChange}
                    onRowInputChange={this.props.onRowInputChange}
                    onNewRow={this.props.onNewRow}
                    onNewColumn={this.props.onNewColumn}
                    onDeleteRow={this.props.onDeleteRow}
                    onDeleteColumn={this.props.onDeleteColumn}

                    onCtrlInput={this.handleCtrlInput}
                />

                <menu className="page-section-management-menu">
                    <TooltipButton
                        text={lang.loadButton}
                        onClick={this.loadRelation}
                        className={"action-button"}
                        style={{marginRight: "40px"}}
                        tooltip={lang.loadButtonTooltip}
                        tooltipClassName={"tooltip"}
                    />
                    <TextInput
                        value={this.getCurRel().getName()}
                        buttonText={lang.renameButton}
                        onSubmit={this.handleRelationNameChange}
                        forbidden={forbiddenNamesFunction}
                        id="relation-name-input"
                    />
                    {createButton(lang.deleteButton, this.deleteRelation, lang.deleteButtonTooltip)}
                    {createButton(lang.revertButton, this.revertRelation,
                        lang.revertButtonTooltip + " (" + this.getCurRel().getRevertName() + ")")}
                </menu>
            </section>
        );
    }
}