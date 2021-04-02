import React from "react";
import "./css/expressionSection.css"
import Relation from "../relation/relation";
import {TooltipButton} from "./tooltipButton";
import {MessageLabel} from "./messageLabel";
import RASyntaxError from "../error/raSyntaxError";
import RASemanticError from "../error/raSemanticError";
import {XTextArea} from "./xTextArea";
import {ExprParser} from "../expression/exprParser";
import {getStartOfWordBeforeIndex, sortWhispers} from "../tools/whisper";
import {Expression} from "../expression/expression";
import {TextInput} from "./textInput";
import ErrorWithTextRange from "../error/errorWithTextRange";
import RATreeNode from "../ratree/raTreeNode";

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
    cursorIndex: number,
    messageText: string,
    isMessageError: boolean
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

    // buttons for inserting RA operations supported without null values
    private readonly buttonPropsFirstPart: Array<OpButtonProps> = [
        // unary
        {key: 'unary_a', char: '()',        text: '()', tooltip: 'Selection (P1)',   shift: 1},
        {key: 'unary_b', char: '[]',        text: '[]', tooltip: 'Projection (P1)',  shift: 1},
        {key: 'unary_c', char: '< -> >',    text: '<>', tooltip: 'Rename (P1)',      shift: 5},
        // binary (precedence A)
        {key: 'a', char: '*',       text: '*',      tooltip: 'Natural join (P2)',            shift: 0},
        {key: 'b', char: '\u2a2f',  text: '\u2a2f', tooltip: 'Cartesian product (P2)',       shift: 0},
        {key: 'c', char: '{}',      text: '{}',     tooltip: 'Theta join (P2)',              shift: 1},
        // binary (precedence B)
        {key: 'd', char: '<*',      text: '<*',     tooltip: 'Left semijoin (P3)',           shift: 0},
        {key: 'e', char: '*>',      text: '*>',     tooltip: 'Right semijoin (P3)',          shift: 0},
        {key: 'f', char: '\u22b3',  text: '\u22b3', tooltip: 'Left antijoin (P3)',           shift: 0},
        {key: 'g', char: '\u22b2',  text: '\u22b2', tooltip: 'Right antijoin (P3)',          shift: 0},
        {key: 'h', char: '<}',      text: '<}',     tooltip: 'Left theta semijoin (P3)',     shift: 1},
        {key: 'i', char: '{>',      text: '{>',     tooltip: 'Right theta semijoin (P3)',    shift: 1},
    ];
    // buttons for inserting RA operations supported without null values
    private readonly buttonPropsSecondPart: Array<OpButtonProps> = [
        // binary (precedence D)
        {key: 'j', char: '\u00f7',  text: '\u00f7', tooltip: 'Division (P5)',                shift: 0},
        // binary (precedence E)
        {key: 'k', char: '\u2229',  text: '\u2229', tooltip: 'Intersection (P6)',            shift: 0},
        // binary (precedence F)
        {key: 'l', char: '\\',      text: '\\',     tooltip: 'Difference (P7)',              shift: 0},
        // binary (precedence G)
        {key: 'm', char: '\u222a',  text: '\u222a', tooltip: 'Union (P8)',                   shift: 0},
    ];
    // buttons for inserting RA operations supported with null values only
    private readonly nullSupportRequiredButtonProps: Array<OpButtonProps> = [
        // binary (precedence C)
        {key: 'null_a', char: '*F*', text: '*F*', tooltip: 'Full outer join (P4)',  shift: 0},
        {key: 'null_b', char: '*L*', text: '*L*', tooltip: 'Left outer join (P4)',  shift: 0},
        {key: 'null_c', char: '*R*', text: '*R*', tooltip: 'Right outer join (P4)', shift: 0}
    ];

    // reference to child textarea element
    private readonly textAreaRef: React.RefObject<XTextArea>;
    // timestamp of last expression text change
    private lastChange: number = 0;
    // timestamp of last display of whispers and errors
    private lastWhisperAndErrorsUpdate: number = 0;
    // update rate of whispers and errors (in ms)
    private readonly whispersAndErrorsUpdateRate: number = 200;
    // reference to this section element
    private readonly sectionRef: React.RefObject<HTMLDivElement>;

    constructor(props: ExpressionSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false,
            whispers: [],
            errors: [],
            cursorIndex: 0,
            messageText: "",
            isMessageError: false
        }
        this.textAreaRef = React.createRef<XTextArea>();
        this.sectionRef = React.createRef<HTMLDivElement>();
        setInterval(() => this.updateWhispersAndErrors(), this.whispersAndErrorsUpdateRate);
    }

    componentDidMount() {
        // adds listeners for evaluating on Ctrl+Enter
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
                if (event.key === "Enter") {
                    this.evalExpr();
                    event.preventDefault();
                }
                else if (event.shiftKey && event.key.toLowerCase() === "a") {
                    this.newExpression();
                    event.preventDefault();
                }
                else if (event.shiftKey && event.key.toLowerCase() === "d") {
                    this.deleteExpression();
                    event.preventDefault();
                }
            }
        });
        this.updateErrors();
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
        this.showMessage("");
    }

    private evalExpr = (): void => {
        this.showMessage("");
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
        this.props.onExportExpressions(this.showMessage);
    }

    private loadExpressions = (): void => {
        this.setState({errors: []});
        this.props.onImportExpressions((msg) => {
            this.showMessage(msg);
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
    private handleExprChange = (text: string, cursorIndex: number, onDone: () => void = () => {}) => {
        this.props.onChange(this.getCurExpr().name, text);  // must be called before setState for proper functionality of XTextArea
        this.setState({cursorIndex: cursorIndex}, onDone);
        this.lastChange = Date.now();
    }

    /**
     * Handles current text after text insertion - replaces tabs with 4 spaces.
     */
    private handleTextInsert = () => {
        const processedText = this.getCurExpr().text.replace(/\t/g, "    ");
        this.props.onChange(this.getCurExpr().name, processedText);
        this.lastChange = Date.now();
    }

    /**
     * Shows current whispers and errors, if the text area is focused and there was a text change after last update.
     */
    private updateWhispersAndErrors = () => {
        const textArea = this.textAreaRef.current;
        if (textArea !== null && textArea.isFocused() && this.lastChange > this.lastWhisperAndErrorsUpdate) {
            const text = this.getCurExpr().text;
            const exprParser: ExprParser = new ExprParser(this.props.relations, this.props.nullValuesSupport);
            const { whispers, errors } = exprParser.fakeParse(text, this.state.cursorIndex);
            const wordBeforeCursor: string = text.slice(getStartOfWordBeforeIndex(text, this.state.cursorIndex), this.state.cursorIndex);
            sortWhispers(whispers, wordBeforeCursor);
            this.setState({
                whispers: whispers,
                errors: errors.filter(err => err.range !== undefined)
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
                "Please, report it with your last actions, thank you!", true);
        }
    }

    public render() {
        const createExprMenuButtons = () => {
            return this.props.expressions.map((expr, i) => {
                const className: string = (this.props.darkTheme ?
                    (this.props.currentExpressionIndex === i ? "button-clicked-dark" : "button-dark") :
                    (this.props.currentExpressionIndex === i ? "button-clicked-light" : "button-light"));
                return (<TooltipButton
                    key={i}
                    text={expr.name}
                    onClick={() => this.handleSelectDifferentExpression(i)}
                    className={className}
                    tooltip={expr.name}
                    tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                />);
            });
        }

        const createButton = (text: string, onClick: () => void, tooltip: string, style?: React.CSSProperties) => {
            return (<TooltipButton
                key={text}
                text={text}
                onClick={onClick}
                className={this.props.darkTheme ? "button-dark" : "button-light"}
                // @ts-ignore
                style={style}
                tooltip={tooltip}
                tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
            />);
        }

        const createOpButtons = (buttonProps: Array<OpButtonProps>) => {
            return buttonProps.map(prop => {
                return (<TooltipButton
                    key={prop.key}
                    text={prop.text}
                    onClick={() => this.addSpecialString(prop.char, prop.shift)}
                    className={this.props.darkTheme ? "button-dark" : "button-light"}
                    tooltip={prop.tooltip}
                    tooltipClassName={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                />);
            });
        }

        return (
            <section
                ref={this.sectionRef}
                className="page-section">
                <header>
                    <h2>Expressions</h2>
                    {createButton("Import", this.loadExpressions, "Loads expressions from a file")}
                    {createButton("Export", this.saveExpressions, "Saves expressions to a file")}
                </header>

                <menu className="page-section-tab-menu">
                    {createExprMenuButtons()}
                    {createButton("+", this.newExpression, "Creates a new RA expression", {minWidth: "0", marginLeft: "10px"})}
                </menu>

                <XTextArea
                    ref={this.textAreaRef}
                    id="expression-section-textarea"
                    text={this.getCurExpr().text}
                    placeholder="Write RA expression here..."
                    errors={this.state.errors}
                    whispers={this.state.whispers}

                    onChange={this.handleExprChange}
                    onTextInserted={this.handleTextInsert}

                    darkTheme={this.props.darkTheme}
                />

                <menu className="expressions-operators-menu">
                    {createOpButtons(this.buttonPropsFirstPart)}
                    {this.props.nullValuesSupport ? createOpButtons(this.nullSupportRequiredButtonProps) : null}
                    {createOpButtons(this.buttonPropsSecondPart)}
                </menu>

                <menu className="page-section-management-menu">
                        <TextInput
                            label=""
                            value={this.getCurExpr().name}
                            buttonText="Rename"
                            onSubmit={this.handleExprNameChange}
                            forbidden={() => false}
                            id="expression-name-input"
                            darkTheme={this.props.darkTheme}
                        />
                        {createButton("Evaluate", this.evalExpr, "Evaluates given RA expression")}
                        {createButton("Delete", this.deleteExpression, "Deletes current RA expression")}
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