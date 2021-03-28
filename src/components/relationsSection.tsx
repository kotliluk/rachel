import React from "react";
import "./css/relationSection.css"
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

    // handler of loading the current selected relation into the application
    onLoadRelation: (onDone: (msg: string) => void) => void,
    // handler of loading all valid relations into the application
    onLoadAllRelations: (onDone: (msg: string) => void) => void,

    // handler of selecting a different relation as current
    onSelectDifferentRelation: (newIndex: number) => void,
    // handler of creating a new relation
    onNewRelation: () => void,
    // handler of deleting the current stored relation
    onDeleteStoredRelation: () => void,

    // handler of deleting the loaded relation with specific name or all loaded relations if specific = false
    onDeleteLoadedRelation: (specific: string | false, onDone: (msg: string) => void) => void,

    // handler of saving the stored relations into the files
    onExportRelations: (onDone: (msg: string) => void) => void,
    // handler of loading new relations from files
    onImportRelations: (onDone: (msg: string) => void) => void,

    // handler of unexpected errors
    onUnexpectedError: (err: Error) => void,

    // whether to support null values
    nullValuesSupport: boolean,
    // true if dark theme should be applied
    darkTheme: boolean
}

interface RelationsSectionState {
    sectionClicked: boolean,
    contentToShow: "stored" | "loaded",
    loadedRelationIndex: number,
    messageText: string,
    isMessageError: boolean
}

/**
 * Section to type the RA expression. It contains textarea for relations definition and control buttons.
 */
export class RelationsSection extends React.Component<RelationsSectionProps, RelationsSectionState> {

    // reference to this section element
    private readonly sectionRef: React.RefObject<HTMLDivElement>;

    constructor(props: RelationsSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false,
            contentToShow: "stored",
            loadedRelationIndex: 0,
            messageText: "",
            isMessageError: false
        }
        this.sectionRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        // adds listeners for loading on Ctrl+Enter
        const section = this.sectionRef.current;
        if (section !== null) {
            section.addEventListener("click", () => {
                this.setState({sectionClicked: true});
            }, true); // useCapture = true for overwriting the window listener
        }
        window.addEventListener("click", () => {
            this.setState({sectionClicked: false});
        }, true); // useCapture = true for overwriting by section listener
        window.addEventListener("keydown", (event) => {
            if (this.state.sectionClicked && event.ctrlKey) {
                if (event.key === "Enter" && this.isShowingStored()) {
                    this.loadRelation();
                    event.preventDefault();
                }
                else if (event.shiftKey && event.key.toLowerCase() === "a" && this.isShowingStored()) {
                    this.newRelation();
                    event.preventDefault();
                }
                else if (event.shiftKey && event.key.toLowerCase() === "d") {
                    this.deleteRelation();
                    event.preventDefault();
                }
            }
        });
    }

    /**
     * Returns true if the relation section now displays stored relations.
     */
    private isShowingStored = (): boolean => {
        return this.state.contentToShow === "stored";
    }

    /**
     * Returns selected stored relation if isShowingStored = true. Otherwise, returns selected loaded relation
     * changed to StoredRelation type.
     */
    private getCurRel = (): StoredRelation => {
        if (this.isShowingStored()) {
            return this.props.storedRelations[this.props.storedRelationIndex];
        }
        else {
            const loadedRelation: Relation = [...this.props.loadedRelations.values()][this.state.loadedRelationIndex];
            return StoredRelation.fromRelation(loadedRelation.name, loadedRelation, this.props.nullValuesSupport);
        }
    }

    /**
     * Changes content to display between stored and loaded relations.
     */
    private changeContentToShow = (): void => {
        if (this.isShowingStored()) {
            if (this.props.loadedRelations.length === 0) {
                this.showMessage("No relations loaded in the application at the moment.");
            }
            else {
                this.setState({
                    contentToShow: "loaded",
                    loadedRelationIndex: 0
                });
            }
        }
        else {
            this.setState({
                contentToShow: "stored"
            });
        }
    }

    /**
     * Passes change to the parent element if isShowingStored = true. Otherwise, changes the state.loadedRelationIndex.
     */
    private handleSelectDifferentRelation(index: number): void {
        if (this.isShowingStored()) {
            this.props.onSelectDifferentRelation(index);
            this.showMessage("");
        }
        else {
            this.setState({loadedRelationIndex: index});
        }
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
     * If isShowingStored = true, passes the call to delete current selected stored relation.
     * If isShowingStored = false, passes the call to delete current selected loaded relation.
     */
    private deleteRelation = () => {
        if (this.isShowingStored()) {
            this.props.onDeleteStoredRelation();
        }
        else {
            const nameToDelete: string = this.props.loadedRelations[this.state.loadedRelationIndex].getName();
            let upgrade = {};
            // if there is only one loaded relation, content to show is needed to be changed to stored after deleting
            if (this.props.loadedRelations.length <= 1) {
                upgrade = {contentToShow: "stored"};
            }
            // if the last relation in the menu list is selected
            else if (this.state.loadedRelationIndex === this.props.loadedRelations.length - 1) {
                upgrade = {loadedRelationIndex: this.state.loadedRelationIndex - 1};
            }
            this.setState(upgrade, () => this.props.onDeleteLoadedRelation(nameToDelete, this.showMessage));
        }
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
        // does not show loaded relations after deleting them
        this.setState({contentToShow: "stored"}, () => this.props.onDeleteLoadedRelation(false, this.showMessage));
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
        if (this.isShowingStored()) {
            return this.props.storedRelations.map((rel, i) => {
                const className: string = (this.props.darkTheme ?
                    (this.props.storedRelationIndex === i ? "button-clicked-dark" : "button-dark") :
                    (this.props.storedRelationIndex === i ? "button-clicked-light" : "button-light"));
                const actuality: string = rel.isActual() ? "" : " *";
                const actualityTooltip: string = rel.isActual() ? " (loaded)" : " (NOT loaded)";
                const width: string = (96 / this.props.storedRelations.length) + "%";
                const style = rel.isValid() ? {width: width} : {width: width, border: "2px solid red"};
                return (<TooltipButton
                    key={i}
                    text={rel.getName() + actuality}
                    onClick={() => this.handleSelectDifferentRelation(i)}
                    className={className}
                    style={style}
                    tooltip={rel.getName() + actualityTooltip}
                    tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                />);
            });
        }
        else {
            return this.props.loadedRelations.map((rel, i) => {
                const className: string = (this.props.darkTheme ?
                    (this.state.loadedRelationIndex === i ? "button-clicked-dark" : "button-dark") :
                    (this.state.loadedRelationIndex === i ? "button-clicked-light" : "button-light"));
                return (<TooltipButton
                    key={i}
                    text={rel.getName()}
                    onClick={() => this.handleSelectDifferentRelation(i)}
                    className={className}
                    style={{width: (96 / this.props.loadedRelations.length) + "%"}}
                    tooltip={rel.getName() + " (current version loaded)"}
                    tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                />);
            });
        }
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

        let sectionClassName = "relation-section ";
        if (this.state.sectionClicked) {
            sectionClassName += this.props.darkTheme ? "section-border-dark-clicked" : "section-border-light-clicked";
        }
        else {
            sectionClassName += this.props.darkTheme ? "section-border-dark" : "section-border-light";
        }
        return (
            <section
                ref={this.sectionRef}
                className={sectionClassName}>
                <div className="relations-names-menu">
                    {this.createRelationMenuButtons()}
                </div>

                <EditRelationTable
                    relation={this.getCurRel()}
                    editable={this.isShowingStored()}

                    onColumnNameChange={this.props.onColumnNameChange}
                    onColumnTypeChange={this.props.onColumnTypeChange}
                    onRowInputChange={this.props.onRowInputChange}
                    onNewRow={this.props.onNewRow}
                    onNewColumn={this.props.onNewColumn}
                    onDeleteRow={this.props.onDeleteRow}
                    onDeleteColumn={this.props.onDeleteColumn}

                    darkTheme={this.props.darkTheme}
                />

                <div className="relations-management-menu">
                    <div className="relations-management-menu-left">
                        <TextInput
                            label=""
                            value={this.getCurRel().getName()}
                            buttonText="Rename"
                            onSubmit={this.handleRelationNameChange}
                            forbidden={forbiddenNamesFunction}
                            id="relation-name-input"
                            darkTheme={this.props.darkTheme}
                            style={this.isShowingStored() ? {} : {visibility: "hidden"}}
                        />
                    </div>

                    <div className="relations-management-menu-right">
                        {createButton("Load", this.loadRelation, "Loads the relation into the application",
                            this.isShowingStored() ? undefined : {visibility: "hidden"})}
                        {createButton("Load all", this.loadAllRelations, "Loads all valid relations into the application",
                            this.isShowingStored() ? {marginRight: "20px"} : {visibility: "hidden"})}
                        {createButton("New", this.newRelation, "Creates a new relation",
                            this.isShowingStored() ? {} : {visibility: "hidden"})}
                        {createButton("Delete",
                            this.deleteRelation,
                            this.isShowingStored() ? "Deletes current selected stored relation" :
                                                            "Deletes current selected loaded relation",
                            {marginRight: "20px"})}
                        {createButton(this.isShowingStored() ? "Show loaded" : "Show stored",
                            this.changeContentToShow,
                            this.isShowingStored() ? "Shows relations currently loaded in the application" :
                                                            "Shows relations currently stored for editing"
                        )}
                        {createButton("Delete loaded", this.deleteAllLoadedRelations,
                            "Deletes relations loaded in the application", {marginRight: "20px"})}
                        {createButton("Import", this.importRelations, "Adds new relations from files")}
                        {createButton("Export", this.exportRelations, "Saves stored relations to files")}
                    </div>
                </div>

                <MessageLabel
                    message={this.state.messageText}
                    darkTheme={this.props.darkTheme}
                    error={this.state.isMessageError}
                />

                <div style={{clear: "both"}}/>
            </section>
        );
    }
}