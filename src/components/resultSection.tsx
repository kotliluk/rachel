import React from "react";
// @ts-ignore - type declaration is not needed for its short usage
import downloadSVG from "export-svg-with-styles";
import {Relation}  from "../relation/relation";
import {ResultRelationTable} from "./resultRelationTable";
import {TooltipButton} from "./tooltipButton";
import RATreeNode from "../ratree/raTreeNode";
import {CsvValueSeparator} from "../types/csvSupport";
import {evalTreeSVGId, EvaluationTree} from "./evaluationTree";
import {depthSearch} from "../ratree/raTreeTools";
import {ErrorFactory} from "../error/errorFactory";
import {RelationStoreManager} from "../relation/relationStoreManager";
import {StoredRelation} from "../relation/storedRelation";
import "./css/resultSection.css"
import {language, LanguageDef} from "../language/language";

/**
 * Props of ResultSection component.
 * @public
 */
interface ResultSectionProps {
    /**
     * the root of the current evaluation tree to display
     * @type RATreeNode
     * @public
     */
    evaluationTreeRoot: RATreeNode,
    /**
     * name of the evaluated expression
     * @type String
     * @public
     */
    expressionName: string,
    /**
     * handler of adding the given relation to defined relations
     * @type Function
     * @public
     */
    onAddResult: (relation: Relation) => void,
    /**
     * handler of unexpected errors
     * @type Function
     * @public
     */
    onUnexpectedError: (e: Error) => void,
    /**
     * current selected value separator in csv files
     * @type CsvValueSeparator
     * @public
     */
    csvValueSeparator: CsvValueSeparator,
    /**
     * true if dark theme should be applied
     * @type Boolean
     * @public
     */
    darkTheme: boolean,
    /**
     * current application language
     * @type LanguageDef
     * @public
     */
    language: LanguageDef
}

interface ResultSectionState {
    selectedIndex: number
}

/**
 * Section to show the evaluation result. It contains a table with a result and text input and buttons to save it.
 * The component is hidden if given resultRelation is null.
 * Accepts {@link ResultSectionProps} props.
 *
 * @public
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
                this.props.onUnexpectedError(ErrorFactory.codeError(language().codeErrors.resultSection_nodeIndexNotFound));
                return null;
            }
        }
        try {
            return currentNode.getResult();
        }
        catch (err) {
            // errors should be handled in expression section
            this.props.onUnexpectedError(ErrorFactory.codeError(language().codeErrors.resultSection_evalError, err.message));
            return null;
        }
    }

    private handleSelectedNodeChange = (index: number): void => {
        this.setState({selectedIndex: index});
    }

    /**
     * Saves the displayed evaluation tree as png picture.
     */
    private exportEvalTreeAsPng = (): void => {
        const svg = document.getElementById(evalTreeSVGId);
        if (svg !== null) {
            const rect = svg.getBoundingClientRect();
            const options = {
                width: rect.width * 3,
                height: rect.height * 3,
                svg: svg,
                filename: this.props.expressionName + " - evaluation tree.png"
            }
            downloadSVG(options);
        }
    }

    /**
     * Saves the current selected relation to a file.
     */
    private exportRelation = (): void => {
        if (this.getCurrentRelation() === null) {
            this.props.onUnexpectedError(ErrorFactory.codeError(language().codeErrors.resultSection_nullRelationToSave));
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
    private addRelation = (): void => {
        if (this.getCurrentRelation() === null) {
            this.props.onUnexpectedError(
                ErrorFactory.codeError(language().codeErrors.resultSection_nullRelationToAdd)
            );
            return;
        }
        // @ts-ignore
        this.props.onAddResult(this.getCurrentRelation());
    }

    render() {
        const relation = this.getCurrentRelation();
        // does not show null result
        if (relation === null) {
            return null;
        }
        const lang = this.props.language.resultSection;

        const relationType: string = this.state.selectedIndex === 0 ? lang.resultRelationTitle : lang.intermediateRelationTitle;
        const selectedNode: RATreeNode | null = depthSearch(this.props.evaluationTreeRoot, this.state.selectedIndex);
        const tableTitle: string | null = selectedNode === null ? null : selectedNode.printInLine();

        return (
            <section
                ref={this.sectionRef}
                className="page-section result-section">
                <header>
                    <h2>{lang.resultSectionHeader}</h2>
                    <TooltipButton
                        text={lang.exportEvalTreeButton}
                        onClick={this.exportEvalTreeAsPng}
                        tooltip={lang.exportEvalTreeButtonTooltip}
                    />
                </header>

                <p className="upper-p">
                    <strong>{lang.evalTreeTitle + ' ' + this.props.evaluationTreeRoot.printInLine() + ':'}</strong>
                </p>

                <EvaluationTree
                    tree={this.props.evaluationTreeRoot}
                    selected={this.state.selectedIndex}
                    onClick={this.handleSelectedNodeChange}
                    darkTheme={this.props.darkTheme}
                />

                <p className="lower-p"><strong>{relationType} {tableTitle}:</strong></p>

                <menu className="page-section-tab-menu">
                    <TooltipButton
                        text={lang.addButton}
                        onClick={this.addRelation}
                        tooltip={lang.addButtonTooltip}
                    />
                    <TooltipButton
                        text={lang.exportRelationButton}
                        onClick={this.exportRelation}
                        tooltip={lang.exportRelationButtonTooltip}
                    />
                </menu>

                <ResultRelationTable relation={relation} />
            </section>
        );
    }
}