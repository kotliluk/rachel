import React from "react";
import "./css/expressionSection.css"
import {Relation}  from "../relation/relation";
import {TooltipButton} from "./tooltipButton";
import {RASyntaxError} from "../error/raSyntaxError";
import {RASemanticError} from "../error/raSemanticError";
import {LocatedError, XTextArea} from "./xTextArea";
import {ExprParser} from "../expression/exprParser";
import {getStartOfWordBeforeIndex, sortWhispers} from "../utils/whisperUtils";
import {Expression} from "../expression/expression";
import {TextInput} from "./textInput";
import {ErrorWithTextRange} from "../error/errorWithTextRange";
import RATreeNode from "../ratree/raTreeNode";
import {MessageBox} from "./messageBox";
import {LanguageDef} from "../language/language";
import {StartEndPair} from "../types/startEndPair";

/**
 * Props of ExpressionSection component.
 * @public
 */
interface ExpressionSectionProps {
    /**
     * available expressions
     * @type Expression[]
     * @public
     */
    expressions: Expression[],
    /**
     * index of the current selected expression in the expression list
     * @type Number
     * @public
     */
    currentExpressionIndex: number,
    /**
     * loaded relations user as sources for expression evaluation
     * @type Map<String, Relation>
     * @public
     */
    relations: Map<string, Relation>,
    /**
     * handler of selecting different expression as current
     * @type Function
     * @public
     */
    onSelectDifferentExpression: (newIndex: number) => void,
    /**
     * handler of moving an expression on a new position using drag and drop
     * @type Function
     * @public
     */
    onDragExpression: (from: number, to: number) => void,
    /**
     * handler of creating the new expression
     * @type Function
     * @public
     */
    onNewExpression: () => void,
    /**
     * handler of deleting the current expression
     * @type Function
     * @public
     */
    onDeleteExpression: (onDone: () => void) => void,
    /**
     * handler of saving the expressions
     * @type Function
     * @public
     */
    onExportExpressions: (onDone: (msg: string) => void) => void,
    /**
     * handler of loading the expressions
     * @type Function
     * @public
     */
    onImportExpressions: (onDone: (msg: string) => void) => void,
    /**
     * handler of change in the current selected expression
     * @type Function
     * @public
     */
    onChange: (name: string, text: string) => void,
    /**
     * handler of evaluation, it accepts the parsed tree from the expression text
     * @type Function
     * @public
     */
    onEval: (tree: RATreeNode) => void,
    /**
     * handler of unexpected errors
     * @type Function
     * @public
     */
    onUnexpectedError: (e: Error) => void,
    /**
     * whether to support null values
     * @type Boolean
     * @public
     */
    nullValuesSupport: boolean,
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

interface ExpressionSectionState {
    sectionClicked: boolean,
    whispers: string[],
    errors: LocatedError[],
    parentheses: StartEndPair[],
    cursorIndex: number
}

/**
 * Section to edit, manage, and eval relational algebra expressions.
 * Accepts {@link ExpressionSectionProps} props.
 *
 * @public
 */
export class ExpressionSection extends React.Component<ExpressionSectionProps, ExpressionSectionState> {

    // reference to child textarea element
    private readonly textAreaRef: React.RefObject<XTextArea>;
    // timestamp of last expression text change
    private lastChange: number = 0;
    // timestamp of last display of whispers and errors
    private lastWhisperAndErrorsUpdate: number = 0;
    // update rate of whispers and errors (in ms)
    private readonly whispersAndErrorsUpdateRate: number = 400;

    constructor(props: ExpressionSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false,
            whispers: [],
            errors: [],
            parentheses: [],
            cursorIndex: 0
        }
        this.textAreaRef = React.createRef<XTextArea>();
        setInterval(() => this.updateWhispersAndErrors(), this.whispersAndErrorsUpdateRate);
    }

    /**
     * Updates displayed errors and parentheses pairs in the text area input.
     * @public
     */
    public updateErrorsAndParentheses = () => {
        const text = this.getCurExpr().text;
        const exprParser: ExprParser = new ExprParser(this.props.relations, this.props.nullValuesSupport);
        const { errors, parentheses } = exprParser.fakeParse(text, this.state.cursorIndex);
        this.setState({
            errors: errors.filter(err => err.range !== undefined && !isNaN(err.range.start) && !isNaN(err.range.end))
                // @ts-ignore
                .map(err => {return {start: err.range.start, end: err.range.end + 1, msg: err.message}}),
            parentheses: parentheses.filter(p => !isNaN(p.start) && !isNaN(p.end))
        });
    }

    private getCurExpr(): Expression {
        return this.props.expressions[this.props.currentExpressionIndex];
    }

    private handleSelectDifferentExpression(index: number): void {
        this.props.onSelectDifferentExpression(index);
    }

    private evalExpr = (): void => {
        try {
            const exprParser: ExprParser = new ExprParser(this.props.relations, this.props.nullValuesSupport);
            const tree = exprParser.parse(this.props.expressions[this.props.currentExpressionIndex].text);
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
        this.props.onDeleteExpression(this.updateErrorsAndParentheses);
    }

    private exportExpressions = (): void => {
        this.props.onExportExpressions(MessageBox.message);
    }

    private importExpressions = (): void => {
        this.props.onImportExpressions((msg) => {
            MessageBox.message(msg);
            this.updateErrorsAndParentheses();
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
                errors: fakeParseResult.errors.filter(err => err.range !== undefined && !isNaN(err.range.start) && !isNaN(err.range.end))
                    // @ts-ignore
                    .map(err => {return {start: err.range.start, end: err.range.end + 1, msg: err.message}}),
                parentheses: fakeParseResult.parentheses.filter(p => !isNaN(p.start) && !isNaN(p.end))
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
                "Please, help us and report your last actions, thank you!");
        }
    }

    /**
     * Requests expressions move when the drag ends.
     */
    // @ts-ignore
    private handleDragDrop = (e: DragEvent<HTMLDivElement>, i: number) => {
        const from = Number(e.dataTransfer.getData("text/plain"));
        if (!isNaN(from)) {
            this.props.onDragExpression(from, i);
        }
    }

    render() {
        const lang = this.props.language.expressionSection;
        const ops = this.props.language.operations;

        const createExprMenuButtons = () => {
            return this.props.expressions.map((expr, i) => {
                const className: string = (this.props.currentExpressionIndex === i ? "button-clicked" : "");
                return (<button
                    key={i}
                    onClick={() => this.handleSelectDifferentExpression(i)}
                    className={className}
                    draggable={true}
                    onDragStart={e => e.dataTransfer.setData("text/plain", String(i))}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => this.handleDragDrop(e, i)}
                >{expr.name}</button>);
            });
        }

        const createButton = (text: string, onClick: () => void, tooltip: string, style?: React.CSSProperties) => {
            return (<TooltipButton
                key={text}
                text={text}
                onClick={onClick}
                style={style}
                tooltip={tooltip}
            />);
        }

        const createOpButton = (key: string, char: string, text: string, tooltip: string, shift: number, style: React.CSSProperties = {}) => {
            return (<TooltipButton
                key={key}
                text={text}
                onClick={() => this.addSpecialString(char, shift)}
                tooltip={tooltip}
                style={style}
            />);
        }
        const buttonGroupMargin = {marginRight: "10px"};

        return (
            <section className="page-section">
                <header>
                    <h2>{lang.expressionSectionHeader}</h2>
                    {createButton(lang.importButton, this.importExpressions, lang.importButtonTooltip)}
                    {createButton(lang.exportButton, this.exportExpressions, lang.exportButtonTooltip)}
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
                    placeholder={lang.expressionTextareaPlaceholder}
                    errors={this.state.errors}
                    whispers={this.state.whispers}
                    parentheses={this.state.parentheses}

                    onChange={this.handleExprChange}
                    onCtrlInput={this.handleCtrlInput}

                    darkTheme={this.props.darkTheme}
                />

                <menu className="expressions-operators-menu">
                    {createOpButton("unary_a", "()", "()", ops.selection, 1)}
                    {createOpButton("unary_b", "[]", "[]", ops.projection, 1)}
                    {createOpButton("unary_c", "< -> >", "<>", ops.rename, 5, buttonGroupMargin)}

                    {createOpButton("set_a", "\u222a", "\u222a", ops.union, 0)}
                    {createOpButton("set_b", "\u2229", "\u2229", ops.intersection, 0)}
                    {createOpButton("set_c", "\\", "\\", ops.difference, 0, buttonGroupMargin)}

                    {createOpButton("inner_a", "*", "*", ops.naturalJoin, 0)}
                    {createOpButton("inner_b", "\u2a2f", "\u2a2f", ops.cartesianProduct, 0)}
                    {createOpButton("inner_c", "<*", "<*", ops.leftSemiJoin, 0)}
                    {createOpButton("inner_d", "*>", "*>", ops.rightSemiJoin, 0)}
                    {createOpButton("inner_e", "\u22b3", "\u22b3", ops.leftAntijoin, 0)}
                    {createOpButton("inner_f", "\u22b2", "\u22b2", ops.rightAntijoin, 0)}
                    {createOpButton("inner_g", "[]", "[]", ops.thetaJoin, 1)}
                    {createOpButton("inner_h", "<]", "<]", ops.leftThetaSemiJoin, 1)}
                    {createOpButton("inner_i", "[>", "[>", ops.rightThetaSemiJoin, 1, buttonGroupMargin)}

                    {this.props.nullValuesSupport && createOpButton("outer_a", "*F*", "*F*", ops.fullOuterJoin, 0)}
                    {this.props.nullValuesSupport && createOpButton("outer_b", "*L*", "*L*", ops.leftOuterJoin, 0)}
                    {this.props.nullValuesSupport && createOpButton("outer_c", "*R*", "*R*", ops.rightOuterJoin, 0, buttonGroupMargin)}

                    {createOpButton("division", "\u00f7", "\u00f7", ops.division, 0, buttonGroupMargin)}

                    {createOpButton("line_comment", "//", "//", lang.lineComment, 0)}
                    {createOpButton("block_comment", "/**/", "/*", lang.blockComment, 2)}
                </menu>

                <menu className="page-section-management-menu">
                    <TooltipButton
                        text={lang.evaluateButton}
                        onClick={this.evalExpr}
                        className={"action-button"}
                        style={{marginRight: "40px"}}
                        tooltip={lang.evaluateButtonTooltip}
                    />
                    <TextInput
                        value={this.getCurExpr().name}
                        buttonText={lang.renameButton}
                        onSubmit={this.handleExprNameChange}
                        forbidden={() => false}
                        id="expression-name-input"
                    />
                    {createButton(lang.deleteButton, this.deleteExpression, lang.deleteButtonTooltip)}
                </menu>
            </section>
        );
    }
}