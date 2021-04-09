import React from "react";
import "./css/expressionSection.css"
import Relation from "../relation/relation";
import {TooltipButton} from "./tooltipButton";
import RASyntaxError from "../error/raSyntaxError";
import RASemanticError from "../error/raSemanticError";
import {XTextArea} from "./xTextArea";
import {ExprParser} from "../expression/exprParser";
import {getStartOfWordBeforeIndex, sortWhispers} from "../utils/whisperUtils";
import {Expression} from "../expression/expression";
import {TextInput} from "./textInput";
import ErrorWithTextRange from "../error/errorWithTextRange";
import RATreeNode from "../ratree/raTreeNode";
import {MessageBox} from "./messageBox";

interface ExpressionSectionProps {
    // available expressions
    expressions: Expression[],
    // index of the current selected expression in the expression list
    currentExpressionIndex: number,

    // loaded relations user as sources for expression evaluation
    relations: Map<string, Relation>,

    // handler of selecting different expression as current
    onSelectDifferentExpression: (newIndex: number) => void,
    // handler of creating the new expression
    onNewExpression: () => void,
    // handler of deleting the current expression
    onDeleteExpression: (onDone: () => void) => void,
    // handler of saving the expressions
    onExportExpressions: (onDone: (msg: string) => void) => void,
    // handler of loading the expressions
    onImportExpressions: (onDone: (msg: string) => void) => void,

    // handler of change in the current selected expression
    onChange: (name: string, text: string) => void,
    // handler of evaluation, it accepts the parsed tree from the expression text
    onEval: (tree: RATreeNode) => void,
    // handler of unexpected errors
    onUnexpectedError: (e: Error) => void,

    // whether to support null values
    nullValuesSupport: boolean,
    // true if dark theme should be applied
    darkTheme: boolean
}

interface ExpressionSectionState {
    sectionClicked: boolean,
    whispers: string[],
    errors: {start: number, end: number, msg: string}[],
    cursorIndex: number
}

interface OpButtonProps {
    // key for React DOM
    key: string,
    // characters to be added on click
    char: string,
    // text to display on the button
    text: string,
    // tooltip ti show on mouse move
    tooltip: string,
    // shift to left of the cursor after adding the characters
    shift: number
}

/**
 * Section to edit, manage, and eval relational algebra expressions.
 */
export class ExpressionSection extends React.Component<ExpressionSectionProps, ExpressionSectionState> {

    private readonly unaryButtons: Array<OpButtonProps> = [
        {key: 'unary_a', char: '()',        text: '()', tooltip: 'Selection',   shift: 1},
        {key: 'unary_b', char: '[]',        text: '[]', tooltip: 'Projection',  shift: 1},
        {key: 'unary_c', char: '< -> >',    text: '<>', tooltip: 'Rename',      shift: 5}
    ];
    private readonly setOperatorsButtons: Array<OpButtonProps> = [
        {key: 'set_a', char: '\u222a',  text: '\u222a', tooltip: 'Union',         shift: 0},
        {key: 'set_b', char: '\u2229',  text: '\u2229', tooltip: 'Intersection',  shift: 0},
        {key: 'set_c', char: '\\',      text: '\\',     tooltip: 'Difference',    shift: 0},
    ];
    private readonly innerJoinsButtons: Array<OpButtonProps> = [
        {key: 'inner_a', char: '*',       text: '*',      tooltip: 'Natural join',            shift: 0},
        {key: 'inner_b', char: '\u2a2f',  text: '\u2a2f', tooltip: 'Cartesian product',       shift: 0},
        {key: 'inner_c', char: '<*',      text: '<*',     tooltip: 'Left semijoin',           shift: 0},
        {key: 'inner_d', char: '*>',      text: '*>',     tooltip: 'Right semijoin',          shift: 0},
        {key: 'inner_e', char: '\u22b3',  text: '\u22b3', tooltip: 'Left antijoin',           shift: 0},
        {key: 'inner_f', char: '\u22b2',  text: '\u22b2', tooltip: 'Right antijoin',          shift: 0},
        {key: 'inner_g', char: '[]',      text: '[]',     tooltip: 'Theta join',              shift: 1},
        {key: 'inner_h', char: '<]',      text: '<]',     tooltip: 'Left theta semijoin',     shift: 1},
        {key: 'inner_i', char: '[>',      text: '[>',     tooltip: 'Right theta semijoin',    shift: 1},
    ];
    private readonly outerJoinsButtons: Array<OpButtonProps> = [
        {key: 'outer_a', char: '*F*', text: '*F*', tooltip: 'Full outer join',  shift: 0},
        {key: 'outer_b', char: '*L*', text: '*L*', tooltip: 'Left outer join',  shift: 0},
        {key: 'outer_c', char: '*R*', text: '*R*', tooltip: 'Right outer join', shift: 0}
    ];
    private readonly divisionButton: Array<OpButtonProps> = [
        {key: 'division', char: '\u00f7',  text: '\u00f7', tooltip: 'Division', shift: 0}
    ];
    private readonly specialButtons: Array<OpButtonProps> = [
        {key: 'special_a', char: '//',  text: '//', tooltip: 'Comment', shift: 0}
    ];

    // reference to child textarea element
    private readonly textAreaRef: React.RefObject<XTextArea>;
    // timestamp of last expression text change
    private lastChange: number = 0;
    // timestamp of last display of whispers and errors
    private lastWhisperAndErrorsUpdate: number = 0;
    // update rate of whispers and errors (in ms)
    private readonly whispersAndErrorsUpdateRate: number = 200;

    constructor(props: ExpressionSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false,
            whispers: [],
            errors: [],
            cursorIndex: 0
        }
        this.textAreaRef = React.createRef<XTextArea>();
        setInterval(() => this.updateWhispersAndErrors(), this.whispersAndErrorsUpdateRate);
    }

    /**
     * Updates displayed errors in the text area input.
     */
    public updateErrors = () => {
        const text = this.getCurExpr().text;
        const exprParser: ExprParser = new ExprParser(this.props.relations, this.props.nullValuesSupport);
        const { errors } = exprParser.fakeParse(text, this.state.cursorIndex);
        this.setState({
            errors: errors.filter(err => err.range !== undefined)
                // @ts-ignore
                .map(err => {return {start: err.range.start, end: err.range.end + 1, msg: err.message}})
        });
    }

    private getCurExpr(): Expression {
        return this.props.expressions[this.props.currentExpressionIndex];
    }

    private handleSelectDifferentExpression(index: number): void {
        this.setState({errors: []});
        this.props.onSelectDifferentExpression(index);
    }

    private evalExpr = (): void => {
        try {
            const exprParser: ExprParser = new ExprParser(this.props.relations, this.props.nullValuesSupport);
            const tree = exprParser.indexedParse(this.props.expressions[this.props.currentExpressionIndex].text);
            tree.eval();
            this.setState({errors: []});
            this.props.onEval(tree);
        }
        catch (err) {
            if (err instanceof ErrorWithTextRange) {
                if (err.range !== undefined) {
                    // change end to also highlight the last char
                    err.range.end += 1;
                    this.setState(state => {
                        const errorRanges = state.errors;
                        // does not push duplicate error range
                        if (errorRanges.every(er => er.start !== err.range.start || er.end !== err.range.end)) {
                            errorRanges.push({...err.range, msg: err.message});
                        }
                        return {errors: errorRanges}
                    });
                }
            }
            this.showError(err);
        }
    }

    private newExpression = (): void => {
        this.props.onNewExpression();
    }

    private deleteExpression = (): void => {
        this.props.onDeleteExpression(this.updateErrors);
    }

    private saveExpressions = (): void => {
        this.props.onExportExpressions(MessageBox.message);
    }

    private loadExpressions = (): void => {
        this.setState({errors: []});
        this.props.onImportExpressions((msg) => {
            MessageBox.message(msg);
            this.updateErrors();
        });
    }

    /**
     * Adds given special string into RA expression at the current cursor position.
     *
     * @param str string to be added
     * @param shift move of the cursor from added string end position (to the beginning)
     */
    private addSpecialString = (str: string, shift: number): void => {
        // @ts-ignore
        const {start, end} = this.textAreaRef.current.getSelection();
        const firstPart: string = this.getCurExpr().text.substring(0, start);
        const secondPart: string = this.getCurExpr().text.substring(end);
        const newPosition: number = firstPart.length + str.length - shift;
        const newStr: string = firstPart + str + secondPart;
        // updates text in textarea
        this.handleExprChange(newStr, newPosition, () => {
            // @ts-ignore - moves cursor to expected position
            this.textAreaRef.current.setSelection(newPosition);
            // @ts-ignore
            this.textAreaRef.current.focus();
        });
    }

    /**
     * Handles change of expression text. Updates text and notifies the parent.
     *
     * @param text
     * @param cursorIndex
     * @param onDone callback after updating the state
     */
    private handleExprChange = (text: string, cursorIndex: number, onDone: () => void = () => {}): void => {
        this.props.onChange(this.getCurExpr().name, text);  // must be called before setState for proper functionality of XTextArea
        this.setState({cursorIndex: cursorIndex}, onDone);
        this.lastChange = Date.now();
    }

    /**
     * Handles input with Ctrl key pressed from textarea.
     */
    private handleCtrlInput = (ev: KeyboardEvent): void => {
        if (ev.key === "Enter") {
            this.evalExpr();
        }
    }

    /**
     * Shows current whispers and errors, if the text area is focused and there was a text change after last update.
     */
    private updateWhispersAndErrors = () => {
        const textArea = this.textAreaRef.current;
        if (textArea !== null && textArea.isFocused() && this.lastChange > this.lastWhisperAndErrorsUpdate) {
            const text = this.getCurExpr().text;
            const exprParser: ExprParser = new ExprParser(this.props.relations, this.props.nullValuesSupport);
            const fakeParseResult = exprParser.fakeParse(text, this.state.cursorIndex);
            const wordBeforeCursor: string = text.slice(getStartOfWordBeforeIndex(text, this.state.cursorIndex), this.state.cursorIndex);
            const whispers = sortWhispers(fakeParseResult.whispers, wordBeforeCursor);
            this.setState({
                whispers: whispers,
                errors: fakeParseResult.errors.filter(err => err.range !== undefined)
                    // @ts-ignore
                    .map(err => {return {start: err.range.start, end: err.range.end + 1, msg: err.message}})
            });
            this.lastWhisperAndErrorsUpdate = Date.now();
        }
    }

    private handleExprNameChange = (name: string) => {
        this.props.onChange(name, this.getCurExpr().text);
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
            MessageBox.error(err.message);
        }
        else {
            this.props.onUnexpectedError(err);
            MessageBox.error("UNEXPECTED ERROR: " + err.message + "\n" +
                "Please, report it with your last actions, thank you!");
        }
    }

    public render() {
        const createExprMenuButtons = () => {
            return this.props.expressions.map((expr, i) => {
                const className: string = (this.props.currentExpressionIndex === i ? "button-clicked" : "");
                return (<button
                    key={i}
                    onClick={() => this.handleSelectDifferentExpression(i)}
                    className={className}
                >{expr.name}</button>);
            });
        }

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

        /**
         * Creates buttons for inserting given operators and adds margin after them.
         */
        const createOpButtons = (buttonProps: Array<OpButtonProps>) => {
            return buttonProps.map((prop, i) => {
                const style = i === buttonProps.length - 1 ? {marginRight: "10px"} : undefined;
                return (<TooltipButton
                    key={prop.key}
                    text={prop.text}
                    onClick={() => this.addSpecialString(prop.char, prop.shift)}
                    className={""}
                    tooltip={prop.tooltip}
                    tooltipClassName={"tooltip"}
                    style={style}
                />);
            });
        }

        return (
            <section className="page-section">
                <header>
                    <h2>Expressions</h2>
                    {createButton("Import", this.loadExpressions, "Loads expressions from a file")}
                    {createButton("Export", this.saveExpressions, "Saves expressions to a file")}
                </header>

                <menu className="page-section-tab-menu">
                    {createExprMenuButtons()}
                    <button onClick={this.newExpression}
                        style={{minWidth: "0", marginLeft: "10px", padding: "2px 6px 1px 6px"}}>
                        <strong>+</strong>
                    </button>
                </menu>

                <XTextArea
                    ref={this.textAreaRef}
                    id="expression-section-textarea"
                    text={this.getCurExpr().text}
                    placeholder="Write RA expression here..."
                    errors={this.state.errors}
                    whispers={this.state.whispers}

                    onChange={this.handleExprChange}
                    onCtrlInput={this.handleCtrlInput}

                    darkTheme={this.props.darkTheme}
                />

                <menu className="expressions-operators-menu">
                    {createOpButtons(this.unaryButtons)}
                    {createOpButtons(this.setOperatorsButtons)}
                    {createOpButtons(this.innerJoinsButtons)}
                    {this.props.nullValuesSupport ? createOpButtons(this.outerJoinsButtons) : null}
                    {createOpButtons(this.divisionButton)}
                    {createOpButtons(this.specialButtons)}
                </menu>

                <menu className="page-section-management-menu">
                    <TooltipButton
                        key="Evaluate"
                        text="Evaluate"
                        onClick={this.evalExpr}
                        className={"action-button"}
                        style={{marginRight: "40px"}}
                        tooltip="Evaluates given RA expression"
                        tooltipClassName={"tooltip"}
                    />
                    <TextInput
                        label=""
                        value={this.getCurExpr().name}
                        buttonText="Rename"
                        onSubmit={this.handleExprNameChange}
                        forbidden={() => false}
                        id="expression-name-input"
                    />
                    {createButton("Delete", this.deleteExpression, "Deletes current RA expression")}
                </menu>
            </section>
        );
    }
}