import React from "react";
import Relation from "../relation/relation";
import {TooltipButton} from "./tooltipButton";
import {MessageLabel} from "./messageLabel";
import {SupportedColumnType} from "../relation/columnType";
import EditRelationTable from "./editRelationTable";
import {StoredRelation} from "../relation/storedRelation";
import {TextInput} from "./textInput";
import {getForbiddenRelationNames} from "../tools/keywords";
import Parser from "../tools/parser";

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
    // true if dark theme should be applied
    darkTheme: boolean
}

interface RelationsSectionState {
    sectionClicked: boolean,
    messageText: string,
    isMessageError: boolean
}

/**
 * Section to type the RA expression. It contains textarea for relations definition and control buttons.
 */
export class RelationsSection extends React.Component<RelationsSectionProps, RelationsSectionState> {

    constructor(props: RelationsSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false,
            messageText: "",
            isMessageError: false
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
        this.showMessage("");
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
            this.props.onLoadRelation(this.showMessage);
        }
        else {
            this.showMessage("Cannot use the invalid relation. Check errors and try again.", true);
        }
    }

    /**
     * Passes the load all relations call to the parent.
     */
    private loadAllRelations = () => {
        this.props.onLoadAllRelations(this.showMessage);
    }

    /**
     * Passes the export stored relations call to the parent.
     */
    private exportRelations = () => {
        this.props.onExportRelations(this.showMessage);
    }

    /**
     * Passes the import stored relations call to the parent.
     */
    private importRelations = () => {
        this.props.onImportRelations(this.showMessage);
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
        this.props.onDeleteLoadedRelations(this.showMessage);
    }

    /**
     * Handles input with Ctrl key pressed from relation table.
     */
    private handleCtrlInput = (event: React.KeyboardEvent) => {
        if (event.key === "Enter") {
            this.props.onLoadRelation(this.showMessage);
        }
    }

    /**
     * Shows the given message.
     *
     * @param msg message to be shown
     * @param isError whether the message is error
     */
    private showMessage = (msg: string, isError: boolean = false) => {
        this.setState({
            messageText: msg,
            isMessageError: isError
        });
    }

    /**
     * Creates menu buttons. If isShowingStored = true, creates button for each stored relation. Otherwise, creates
     * button for each loaded relation. Buttons for stored relations with errors are highlighted.
     */
    private createRelationMenuButtons = () => {
        return this.props.storedRelations.map((rel, i) => {
            const className: string = (this.props.darkTheme ?
                (this.props.storedRelationIndex === i ? "button-clicked-dark" : "button-dark") :
                (this.props.storedRelationIndex === i ? "button-clicked-light" : "button-light"));
            const actuality: string = rel.isActual() ? "" : "*";
            const style = rel.isValid() ? {} : {border: "2px solid red"};
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
        const createButton = (text: string, onClick: () => void, tooltip: string, style?: React.CSSProperties) => {
            return (<TooltipButton
                key={text}
                text={text}
                onClick={onClick}
                className={this.props.darkTheme ? "button-dark" : "button-light"}
                style={style}
                tooltip={tooltip}
                tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
            />);
        }

        // the relation cannot be renamed to forbidden relation names and other currently used relation names
        const forbiddenRelationNames: string[] = this.props.storedRelations
            .filter((sr, i) => i !== this.props.storedRelationIndex)
            .map(sr => sr.getName());
        forbiddenRelationNames.push(...getForbiddenRelationNames());
        const forbiddenNamesFunction = (text: string): boolean => {
            if (forbiddenRelationNames.indexOf(text) > -1) {
                return true;
            }
            return !Parser.isName(text);
        }

        return (
            <section className="page-section">
                <header>
                    <h2>Relations</h2>
                    {createButton("Load all", this.loadAllRelations, "Loads all valid relations into the application")}
                    {createButton("Delete loaded", this.deleteAllLoadedRelations, "Deletes relations loaded in the application")}
                    {createButton("Import", this.importRelations, "Adds new relations from files")}
                    {createButton("Export", this.exportRelations, "Saves stored relations to files")}
                </header>

                <menu className="page-section-tab-menu">
                    {this.createRelationMenuButtons()}
                    <button
                        onClick={this.newRelation}
                        className={this.props.darkTheme ? "button-dark" : "button-light"}
                        style={{minWidth: "0", marginLeft: "10px", padding: "2px 5px 1px 6px"}}>
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

                    darkTheme={this.props.darkTheme}
                />

                <menu className="page-section-management-menu">
                    <TextInput
                        label=""
                        value={this.getCurRel().getName()}
                        buttonText="Rename"
                        onSubmit={this.handleRelationNameChange}
                        forbidden={forbiddenNamesFunction}
                        id="relation-name-input"
                        darkTheme={this.props.darkTheme}
                    />
                    {createButton("Load", this.loadRelation, "Loads the relation into the application")}
                    {createButton("Delete", this.deleteRelation,"Deletes the relation")}
                    {this.getCurRel().canRevert() && createButton("Revert", this.revertRelation,
                        "Reverts to last loaded state (" + this.getCurRel().getRevertName() + ")")}
                </menu>

                <MessageLabel
                    message={this.state.messageText}
                    darkTheme={this.props.darkTheme}
                    style={{marginLeft: "10px", ...(this.state.isMessageError ? {color: "red"} : {})}}
                />
            </section>
        );
    }
}