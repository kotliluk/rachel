import React from "react";
import {Relation} from "../relation/relation";
import {TooltipButton} from "./tooltipButton";
import {SupportedColumnType} from "../relation/columnType";
import {EditRelationTable} from "./editRelationTable";
import {StoredRelation} from "../relation/storedRelation";
import {TextInput} from "./textInput";
import {isForbiddenRelationName} from "../utils/keywords";
import {StringUtils} from "../utils/stringUtils";
import {MessageBox} from "./messageBox";
import {LanguageDef} from "../language/language";

/**
 * Props of RelationsSection component.
 * @public
 */
interface RelationsSectionProps {
    /**
     * all stored relations
     * @type StoredRelation[]
     * @public
     */
    storedRelations: StoredRelation[],
    /**
     * index of the current selected relation
     * @type number
     * @public
     */
    storedRelationIndex: number,
    /**
     * all currently loaded relations in the application
     * @type Relation[]
     * @public
     */
    loadedRelations: Relation[],
    /**
     * handler of change of the name of the current selected relation
     * @type function
     * @public
     */
    onRelationNameChange: (newName: string) => void,
    /**
     * handler of change of the name of the column at given index in the current selected relation
     * @type function
     * @public
     */
    onColumnNameChange: (columnName: string, columnIndex: number) => void,
    /**
     * handler of change of the type of the column at given index in the current selected relation
     * @type function
     * @public
     */
    onColumnTypeChange: (columnType: SupportedColumnType, columnIndex: number) => void,
    /**
     * handler of change of the row input at given column/row index in the current selected relation
     * @type function
     * @public
     */
    onRowInputChange: (input: string, columnIndex: number, rowIndex: number) => void,
    /**
     * handler of adding a new row in the current selected relation
     * @type function
     * @public
     */
    onNewRow: (onDone: () => void) => void,
    /**
     * handler of adding a new column in the current selected relation
     * @type function
     * @public
     */
    onNewColumn: (onDone: () => void) => void,
    /**
     * handler of deleting the row on given index
     * @type function
     * @public
     */
    onDeleteRow: (rowIndex: number) => void,
    /**
     * handler of deleting the column on given index
     * @type function
     * @public
     */
    onDeleteColumn: (columnIndex: number) => void,
    /**
     * handler of selecting a different relation as current
     * @type function
     * @public
     */
    onSelectDifferentRelation: (newIndex: number) => void,
    /**
     * handler of moving a relation on a new position using drag and drop
     * @type function
     * @public
     */
    onDragRelation: (from: number, to: number) => void,
    /**
     * handler of creating a new relation
     * @type function
     * @public
     */
    onNewRelation: () => void,
    /**
     * handler of loading the current selected relation into the application
     * @type function
     * @public
     */
    onLoadRelation: (onDone: (msg: string) => void) => void,
    /**
     * handler of deleting the current stored relation
     * @type function
     * @public
     */
    onDeleteStoredRelation: () => void,
    /**
     * handler of reverting the current relation to its last saved (valid) state
     * @type function
     * @public
     */
    onRevertRelation: () => void,
    /**
     * handler of loading all valid relations into the application
     * @type function
     * @public
     */
    onLoadAllRelations: (onDone: (msg: string) => void) => void,
    /**
     * handler of deleting the loaded relations
     * @type function
     * @public
     */
    onRemoveLoadedRelations: (onDone: (msg: string) => void) => void,
    /**
     * handler of saving the stored relations into the files
     * @type function
     * @public
     */
    onExportRelations: (onDone: (msg: string) => void) => void,
    /**
     * handler of loading new relations from files
     * @type function
     * @public
     */
    onImportRelations: (onDone: (msg: string) => void) => void,
    /**
     * whether to support null values
     * @type boolean
     * @public
     */
    nullValuesSupport: boolean,
    /**
     * current application language
     * @type LanguageDef
     * @public
     */
    language: LanguageDef
}

interface RelationsSectionState {
    sectionClicked: boolean
}

/**
 * Section to type the RA expression. It contains textarea for relations definition and control buttons.
 * Accepts {@link RelationsSectionProps} props.
 *
 * @public
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
     * Passes the create new stored relation call to the parent.
     */
    private newRelation = () => {
        this.props.onNewRelation();
    }

    /**
     * Passes the remove loaded relations call to the parent.
     */
    private removeLoadedRelations = () => {
        this.props.onRemoveLoadedRelations(MessageBox.message);
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
                    draggable={true}
                    onDragStart={e => e.dataTransfer.setData("text/plain", String(i))}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => this.handleDragDrop(e, i)}
                >{actuality + rel.getName()}</button>
            );
        });
    }

    /**
     * Requests relation move when the drag ends.
     */
    // @ts-ignore
    private handleDragDrop = (e: DragEvent<HTMLDivElement>, i: number) => {
        const from = Number(e.dataTransfer.getData("text/plain"));
        if (!isNaN(from)) {
            this.props.onDragRelation(from, i);
        }
    }

    public render() {
        const lang = this.props.language.relationSection;

        const createButton = (text: string, onClick: () => void, tooltip: string, style?: React.CSSProperties) => {
            return (<TooltipButton
                key={text}
                text={text}
                onClick={onClick}
                style={style}
                tooltip={tooltip}
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
                    {createButton(lang.removeLoadedButton, this.removeLoadedRelations, lang.removeLoadedButtonTooltip)}
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