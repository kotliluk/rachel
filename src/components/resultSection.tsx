import React from "react";
import Relation from "../relation/relation";
import {ResultRelationTable} from "./resultRelationTable";
import {TooltipButton} from "./tooltipButton";
import {MessageLabel} from "./messageLabel";
import RASyntaxError from "../error/raSyntaxError";
import RASemanticError from "../error/raSemanticError";
import RATreeNode from "../ratree/raTreeNode";
import {CsvValueSeparatorChar} from "../tools/csvSupport";
import {EvaluationTree} from "./evaluationTree";
import {depthSearch} from "../ratree/raTreeTools";
import {CodeErrorCodes, ErrorFactory} from "../error/errorFactory";
import {RelationStoreManager} from "../relation/relationStoreManager";
import {StoredRelation} from "../relation/storedRelation";

interface ResultSectionProps {
    evaluationTreeRoot: RATreeNode,
    expressionName: string,

    onAddResult: (name: string, relation: Relation, onSuccess: () => void, onError: (msg: string) => void) => void,
    onUnexpectedError: (e: Error) => void,

    csvValueSeparator: CsvValueSeparatorChar
    darkTheme: boolean,
}

interface ResultSectionState {
    sectionClicked: boolean,
    selectedIndex: number,
    relationName: string,
    messageText: string,
    isMessageError: boolean
}

/**
 * Section to show the evaluation result. It contains a table with a result and text input and buttons to save it.
 * The component is hidden if given resultRelation is null.
 *
 * Props:
 * - evaluationTreeRoot: RATreeNode: the root of the current evaluation tree to display
 * - expressionName: string: name of the evaluated expression
 * - onAddResult: (name: string, relation: Relation, onSuccess: () => void, onError: (msg: string) => void) => void:
 * handler of adding the selected relation with given name to defined relations
 * - onUnexpectedError: (e: Error) => void: handler of unexpected errors
 * - csvValueSeparator: csvValueSeparatorType: current selected value separator in csv files
 * - darkTheme: boolean: true if dark theme should be applied
 */
export class ResultSection extends React.Component<ResultSectionProps, ResultSectionState> {

    // reference to this section element
    private readonly sectionRef: React.RefObject<HTMLDivElement>;

    constructor(props: ResultSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false,
            selectedIndex: 0,
            relationName: 'ResultRelation',
            messageText: "",
            isMessageError: false
        }
        this.sectionRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        const section = this.sectionRef.current;
        if (section !== null) {
            section.addEventListener("click", () => {
                this.setState({sectionClicked: true});
            }, true); // useCapture = true for overwriting the window listener
        }
        window.addEventListener("click", () => {
            this.setState({sectionClicked: false});
        }, true); // useCapture = true for overwriting by section listener
    }

    componentDidUpdate(prevProps: Readonly<ResultSectionProps>) {
        if (prevProps.evaluationTreeRoot !== this.props.evaluationTreeRoot) {
            this.setState({selectedIndex: 0});
        }
    }

    /**
     * Gets the result relation for the current selected node.
     */
    private getCurrentRelation = (): Relation | null => {
        let currentNode: RATreeNode | null = depthSearch(this.props.evaluationTreeRoot, this.state.selectedIndex);
        if (currentNode === null) {
            currentNode = depthSearch(this.props.evaluationTreeRoot, 0);
            if (currentNode === null) {
                this.props.onUnexpectedError(ErrorFactory.codeError(CodeErrorCodes.resultSection_getCurrentRelation_nodeIndexNotFound));
                return null;
            }
        }
        try {
            return currentNode.getResult();
        }
        catch (err) {
            // errors should be handled in expression section
            this.props.onUnexpectedError(ErrorFactory.codeError(CodeErrorCodes.resultSection_getCurrentRelation_evalError, err.message));
            return null;
        }
    }

    private handleSelectedNodeChange = (index: number): void => {
        this.setState({selectedIndex: index});
    }

    /**
     * Saves the current selected relation to a file.
     */
    private saveResultRelation = (): void => {
        if (this.getCurrentRelation() === null) {
            this.showError(ErrorFactory.codeError(CodeErrorCodes.resultSection_saveResultRelation_nullRelationToSave));
            return;
        }
        const name: string = this.state.relationName;
        if (name === "") {
            this.showMessage("Relation name cannot be empty.", true);
            return;
        }
        try {
            RelationStoreManager.save([StoredRelation.fromRelation(name, this.getCurrentRelation() as Relation, true)],
                name, this.props.csvValueSeparator);
            this.showMessage("Relation saved to file.", false);
        }
        catch (err) {
            this.showMessage("Saving error: " + err, true);
        }
    }

    /**
     * Updates resultRelationName.
     *
     * @param event event with the new name
     */
    private handleRelationNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({relationName: event.target.value})
    }

    /**
     * Passes the current selected relation with the given name to the parent.
     */
    private handleAddRelation = (): void => {
        if (this.getCurrentRelation() === null) {
            this.showError(ErrorFactory.codeError(CodeErrorCodes.resultSection_handleAddRelation_nullRelationToAdd));
            return;
        }
        // @ts-ignore
        this.props.onAddResult(this.state.relationName, this.getCurrentRelation(),
            () => this.showMessage("Relation \"" + this.state.relationName + "\" was added to definitions."),
            (msg: string) => this.showMessage(msg, true));
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
     * Handles and shows the given error. If the error is not of RASyntaxError or RASemanticError class, it is passed
     * to the parent as unexpected error.
     *
     * @param err the error to handle
     */
    private showError = (err: Error) => {
        // common user's errors
        if (err instanceof RASyntaxError || err instanceof RASemanticError) {
            this.showMessage(err.message, true);
        }
        else {
            this.props.onUnexpectedError(err);
            this.showMessage("UNEXPECTED ERROR: " + err.message + "\n" +
                "Please, report it with your last actions to kotliluk@fel.cvut.cz, thank you!", true);
        }
    }

    render() {
        // does not show null result
        if (this.getCurrentRelation() === null) {
            return null;
        }
        // one place to style buttons
        const createButton = (text: string, onClick: () => void, tooltip: string) => {
            return (
                <TooltipButton
                    text={text}
                    onClick={onClick}
                    className={this.props.darkTheme ? "button-dark" : "button-light"}
                    tooltip={tooltip}
                    tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
            />);
        }
        const selectedNode: RATreeNode | null = depthSearch(this.props.evaluationTreeRoot, this.state.selectedIndex);
        const tableTitle: string | null = selectedNode === null ? null : selectedNode.getResult().getName();

        let sectionClassName = this.props.darkTheme ? "section-border-dark" : "section-border-light";
        if (this.state.sectionClicked) {
            sectionClassName = this.props.darkTheme ? "section-border-dark-clicked" : "section-border-light-clicked";
        }
        return (
            <section
                ref={this.sectionRef}
                className={sectionClassName}>
                <p><strong>{'Evaluation tree of "' + this.props.expressionName + '":'}</strong></p>

                <EvaluationTree
                    tree={this.props.evaluationTreeRoot}
                    selected={this.state.selectedIndex}
                    onClick={this.handleSelectedNodeChange}
                    darkTheme={this.props.darkTheme}
                />

                <p><strong>{tableTitle}:</strong></p>

                <ResultRelationTable
                    relation={this.getCurrentRelation() as Relation}
                    darkTheme={this.props.darkTheme}
                />

                <footer>
                    <input
                        type='text'
                        className={this.props.darkTheme ? 'text-input-dark' : 'text-input-light'}
                        spellCheck={false}
                        value={this.state.relationName}
                        onChange={this.handleRelationNameChange}
                    />
                    {createButton("Add", this.handleAddRelation, "Adds given relation to stored ones")}
                    {createButton("Save", this.saveResultRelation, "Saves given relation to a file")}

                    <MessageLabel
                        message={this.state.messageText}
                        darkTheme={this.props.darkTheme}
                        error={this.state.isMessageError}
                    />
                </footer>
            </section>
        );
    }
}