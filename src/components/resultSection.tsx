import React from "react";
import Relation from "../relation/relation";
import {ResultRelationTable} from "./resultRelationTable";
import {TooltipButton} from "./tooltipButton";
import RATreeNode from "../ratree/raTreeNode";
import {CsvValueSeparatorChar} from "../tools/csvSupport";
import {EvaluationTree} from "./evaluationTree";
import {depthSearch} from "../ratree/raTreeTools";
import {CodeErrorCodes, ErrorFactory} from "../error/errorFactory";
import {RelationStoreManager} from "../relation/relationStoreManager";
import {StoredRelation} from "../relation/storedRelation";
import "./css/resultSection.css"

interface ResultSectionProps {
    // the root of the current evaluation tree to display
    evaluationTreeRoot: RATreeNode,
    // name of the evaluated expression
    expressionName: string,

    // handler of adding the given relation to defined relations
    onAddResult: (relation: Relation) => void,

    // handler of unexpected errors
    onUnexpectedError: (e: Error) => void,

    // current selected value separator in csv files
    csvValueSeparator: CsvValueSeparatorChar
    // true if dark theme should be applied
    darkTheme: boolean,
}

interface ResultSectionState {
    selectedIndex: number
}

/**
 * Section to show the evaluation result. It contains a table with a result and text input and buttons to save it.
 * The component is hidden if given resultRelation is null.
 */
export class ResultSection extends React.Component<ResultSectionProps, ResultSectionState> {

    // reference to this section element
    private readonly sectionRef: React.RefObject<HTMLDivElement>;

    constructor(props: ResultSectionProps) {
        super(props);
        this.state = {
            selectedIndex: 0
        }
        this.sectionRef = React.createRef<HTMLDivElement>();
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
    private exportResultRelation = (): void => {
        if (this.getCurrentRelation() === null) {
            this.props.onUnexpectedError(ErrorFactory.codeError(CodeErrorCodes.resultSection_saveResultRelation_nullRelationToSave));
            return;
        }
        try {
            RelationStoreManager.save(
                [StoredRelation.fromRelation("rachel_result", this.getCurrentRelation() as Relation, true)],
                "rachel_result", this.props.csvValueSeparator);
        }
        catch (err) {
            console.warn("Saving error: " + err, true);
        }
    }

    /**
     * Passes the current selected relation with the given name to the parent.
     */
    private handleAddRelation = (): void => {
        if (this.getCurrentRelation() === null) {
            this.props.onUnexpectedError(ErrorFactory.codeError(CodeErrorCodes.resultSection_handleAddRelation_nullRelationToAdd));
            return;
        }
        // @ts-ignore
        this.props.onAddResult(this.getCurrentRelation());
    }

    render() {
        // does not show null result
        if (this.getCurrentRelation() === null) {
            return null;
        }
        const relationType: string = this.state.selectedIndex === 0 ? "Result" : "Intermediate"
        const selectedNode: RATreeNode | null = depthSearch(this.props.evaluationTreeRoot, this.state.selectedIndex);
        const tableTitle: string | null = selectedNode === null ? null : selectedNode.printInLine();

        return (
            <section
                ref={this.sectionRef}
                className="page-section result-section">
                <header>
                    <h2>Result</h2>
                </header>

                <p className="upper-p">
                    <strong>{'Evaluation tree of ' + this.props.evaluationTreeRoot.printInLine() + ':'}</strong>
                </p>

                <EvaluationTree
                    tree={this.props.evaluationTreeRoot}
                    selected={this.state.selectedIndex}
                    onClick={this.handleSelectedNodeChange}
                    darkTheme={this.props.darkTheme}
                />

                <p className="lower-p"><strong>{relationType} relation {tableTitle}:</strong></p>

                <menu className="page-section-tab-menu">
                    <TooltipButton
                        text="Add"
                        onClick={this.handleAddRelation}
                        className={this.props.darkTheme ? "button-dark" : "button-light"}
                        tooltip={"Adds given relation to stored ones"}
                        tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                    />
                    <TooltipButton
                        text="Export"
                        onClick={this.exportResultRelation}
                        className={this.props.darkTheme ? "button-dark" : "button-light"}
                        tooltip={"Saves given relation to a file"}
                        tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                    />
                </menu>

                <ResultRelationTable
                    relation={this.getCurrentRelation() as Relation}
                    darkTheme={this.props.darkTheme}
                />
            </section>
        );
    }
}