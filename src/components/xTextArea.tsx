import React from "react";
import './css/xTextArea.css';
import {mod} from "../tools/math";
import {computeFontSizeInPx} from "../tools/font";
import {getStartOfWordBeforeIndex} from "../tools/whisper";

interface XTextAreaProps {
    // id of the component
    id: string;
    // current text content of the textarea
    text: string;
    // text to be shown as textarea placeholder
    placeholder: string;
    // error messages and ranges to be highlighted in text area
    errors: {start: number, end: number, msg: string}[];
    // strings whispered to the user to be added at the current position
    whispers: string[];
    // handler of text change
    onChange: (text: string, cursorIndex: number) => void;
    // true if dark theme should be applied
    darkTheme: boolean;
}

interface XTextAreaState {}

/**
 * HTMLTextAreaElement extended for painting number lines, inserting strings given from parent and whispering.
 */
type ExtendedHTMLTextArea = HTMLTextAreaElement & {
    /**
     * (Re)paints line numbers next to textarea.
     *
     * @param darkTheme style to be applied to numbers
     */
    paintLineNumbers: (darkTheme: boolean) => void,
    // reference to canvas element used to paint line numbers
    canvasLines: HTMLCanvasElement,
    // true when the mouse button is clicked down
    mouseIsDown: boolean,

    /**
     * Whispers given array of strings to the user at the current cursor position.
     *
     * @param toWhisper
     */
    showWhisper: (whispers: string[]) => void,
    /**
     * Moves the WhisperDiv to be located next to the current cursor position.
     * The WhisperDiv is moved only if the whisperDiv.isShown is true.
     */
    moveWhisper: () => void,
    /**
     * Hides the WhisperDiv (whisperDiv.isShown is set to false).
     */
    hideWhisper: () => void,
    /**
     * Inserts current selected whisper.
     *
     * @param onChange callback to the parent after text change
     */
    insertCurrentSelectedWhisper: (onChange: (text: string, cursorIndex: number) => void) => void,
    // reference to whisper div
    whisperDiv: WhisperDiv,

    /**
     * Creates error div elements for given ranges.
     */
    updateErrors: (ranges: {start: number, end: number, msg: string}[]) => void,
    /**
     * Moves error div elements to current position.
     */
    moveErrors: () => void,
    // div elements for highlighting errors
    errorDivs: ErrorDiv[]
};

/**
 * HTMLDivElement extended by functions for easy whispering.
 */
type WhisperDiv = HTMLDivElement & {
    // true when the whisper should be shown
    isShown: boolean,
    // index of the selected whisper
    selectedIndex: number,
    /**
     * Updates selected whisper by given difference. Removes highlights from previous highlighted whisper and
     * highlights the new selected. The new index is modulo actual whisper count. The function does nothing, when
     * there no whispers at the moment.
     *
     * @param indexDiff
     */
    changeSelected: (indexDiff: number) => void,
    /**
     * Updates selected whisper to given index. Removes highlights from previous highlighted whisper and
     * highlights the new selected. The new index is modulo actual whisper count. The function does nothing, when
     * there no whispers at the moment.
     *
     * @param newIndex
     */
    setSelected: (newIndex: number) => void,
    /**
     * Returns current selected whisper or undefined, when no whisper is selected.
     */
    getSelectedWhisper: () => string | undefined
};

type ErrorDiv = HTMLDivElement & {
    startLine: number,
    startColumn: number,
    rangeLength: number,
    messageSpan: HTMLSpanElement
}

// @ts-ignore
const cssConstants: CSSStyleDeclaration = getComputedStyle(document.querySelector(':root'));

const fontSize: string = cssConstants.getPropertyValue('--x-textarea-font-size');
const fontFamily: string = cssConstants.getPropertyValue('--x-textarea-font-family');
const {fontWidth} = computeFontSizeInPx(fontFamily, fontSize);
const lineHeight: number = Number(cssConstants.getPropertyValue('--x-textarea-line-height'));
const numsBackgroundLight: string = cssConstants.getPropertyValue('--light-section');
const numsBackgroundDark: string = cssConstants.getPropertyValue('--dark-section');
const numsColorLight: string = cssConstants.getPropertyValue('--text-color-light');
const numsColorDark: string = cssConstants.getPropertyValue('--text-color-dark');
const canvasWidth: number = 24;

/**
 * TextArea extended by line numbers and text highlighting. The component is maintained by JavaScript HTML functions,
 * not by React.
 */
export class XTextArea extends React.Component<XTextAreaProps, XTextAreaState> {
    // reference to XTextArea root React div element
    private reactDiv: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>();
    // @ts-ignore - always set before usage in componentDidMount
    private textarea: ExtendedHTMLTextArea;

    /**
     * Returns current text area selection start and end.
     */
    public getSelection(): {start: number, end: number} {
        return {start: this.textarea.selectionStart, end: this.textarea.selectionEnd};
    }

    /**
     * Sets text area selection start and end. If end is not given, start value is used as end value as well.
     *
     * @param start
     * @param end
     */
    public setSelection(start: number, end?: number): void {
        this.textarea.setSelectionRange(start, end ? end : start);
    }

    /**
     * Returns true if the textarea has focus.
     */
    public isFocused(): boolean {
        return document.activeElement !== null && document.activeElement.id === this.props.id + '-ta';
    }

    /**
     * The text area gains focus in the window.
     */
    public focus(): void {
        this.textarea.focus();
    }

    /**
     * The component is build by JavaScript HTML functions after mount of the empty div in render function.
     */
    componentDidMount() {
        // @ts-ignore - gets parent div
        const div: HTMLDivElement = document.getElementById(this.props.id);
        div.classList.add(this.props.darkTheme ? "x-textarea-div-dark" : "x-textarea-div-light");

        // LAYOUT (table with 1 row and 2 columns)
        const table = document.createElement('table');
        table.setAttribute('cellspacing','0');
        table.setAttribute('cellpadding','0');
        table.classList.add('x-textarea-table');
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        td1.setAttribute('id', this.props.id + '-td1');
        td1.classList.add(this.props.darkTheme ? 'x-textarea-table-td1-dark' : 'x-textarea-table-td1-light');
        const td2 = document.createElement('td');
        td2.classList.add('x-textarea-table-td2');
        tr.appendChild(td1);
        tr.appendChild(td2);
        table.appendChild(tr);

        // TEXTAREA
        // @ts-ignore - extended later in componentDidMount
        const ta: ExtendedHTMLTextArea = document.createElement('textarea');
        ta.setAttribute('id', this.props.id + '-ta');
        ta.setAttribute('rows', '2');
        ta.setAttribute('spellcheck', 'false');
        ta.mouseIsDown = false;
        ta.setAttribute('placeholder', this.props.placeholder);
        ta.classList.add('x-textarea');
        this.props.darkTheme ? ta.classList.add('x-textarea-dark', 'cursor-container-dark') :
                              ta.classList.add('x-textarea-light', 'cursor-container-light');
        ta.value = this.props.text;

        // TEXTAREA NUMBERS (Canvas)
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth + 4;    // must not set width & height in css !!!
        canvas.classList.add(this.props.darkTheme ? 'canvas-dark' : 'canvas-light');
        ta.canvasLines = canvas;
        td1.appendChild(canvas);
        td2.appendChild(ta);
        div.appendChild(table);

        // TEXTAREA WHISPER DIV
        // @ts-ignore - extended later in componentDidMount
        const whisperDiv: WhisperDiv = document.createElement('div');
        whisperDiv.classList.add('whisper-div', this.props.darkTheme ? 'whisper-div-dark' : 'whisper-div-light');
        whisperDiv.isShown = false;
        whisperDiv.selectedIndex = -1;
        whisperDiv.changeSelected = function (indexDiff: number) {
            this.setSelected(this.selectedIndex + indexDiff);
        }
        whisperDiv.setSelected = function (newIndex: number) {
            if (this.childElementCount > 0) {
                // removes selected highlight from previous selected whisper (if it is valid)
                if (this.selectedIndex > -1 && this.selectedIndex < this.childElementCount) {
                    this.children[this.selectedIndex].classList.remove("selected-whisper");
                }
                // updates the index modulo child count
                this.selectedIndex = mod(newIndex, this.childElementCount);
                // adds selected highlight
                this.children[this.selectedIndex].classList.add("selected-whisper");
            }
        }
        whisperDiv.getSelectedWhisper = function (): string | undefined {
            if (this.selectedIndex > -1 && this.childElementCount > 0) {
                // @ts-ignore
                return this.children[this.selectedIndex].innerText;
            }
            return undefined;
        }
        ta.whisperDiv = whisperDiv;
        td2.appendChild(whisperDiv);

        // Line numbers rendering inspired by: https://www.w3schools.com/code/tryit.asp?filename=G68VMFWS12UH,
        // Nikola Bozovic, nigerija@gmail.com
        ta.paintLineNumbers = function(darkTheme: boolean): void {
            try {
                const canvas = this.canvasLines;
                if (canvas.height !== this.clientHeight) {
                    canvas.height = this.clientHeight; // on resize
                }
                // @ts-ignore
                const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
                ctx.fillStyle = darkTheme ? numsBackgroundDark : numsBackgroundLight;
                ctx.fillRect(0, 0, canvasWidth + 2, this.scrollHeight + 1);
                ctx.fillStyle = darkTheme ? numsColorDark : numsColorLight;
                ctx.font = fontSize + " " + fontFamily;
                const startIndex = Math.floor(this.scrollTop / lineHeight);
                const endIndex = startIndex + Math.floor(this.clientHeight / lineHeight);
                for (let i = startIndex; i <= endIndex; i++) {
                    const y = 16 - this.scrollTop + (i * lineHeight);
                    const text = '' + (i + 1);  // line number
                    ctx.fillText(text,canvasWidth - (text.length * 6), y);
                }
            }
            catch(e) {
                console.log('XTextArea paintLineNumbers error: ' + e);
            }
        };

        ta.showWhisper = function (whispers: string[]): void {
            if (whispers.length === 0) {
                this.hideWhisper();
            }
            else {
                const prevCount: number = this.whisperDiv.childElementCount;
                // inserts given whispers (rewrites innerHTML)
                this.whisperDiv.innerHTML = whispers.map(whisper => `<div>${whisper}</div>`).join('');
                if (this.whisperDiv.childElementCount !== prevCount) {
                    // sets selected index to 0 when whispers count has changed
                    this.whisperDiv.setSelected(0);
                }
                else {
                    // forces highlight of current selection
                    this.whisperDiv.changeSelected(0);
                }
                // needs to be set to true before moveWhisper call
                this.whisperDiv.isShown = true;
                // sets the div position
                this.moveWhisper();
            }
        }

        ta.moveWhisper = function () {
            // updates only if the whisper is shown
            if (this.whisperDiv.isShown) {
                // finds cursor position in the whole string
                const cursorLineAndColumn = getPositionLineAndColumn(this.value, this.selectionEnd);
                // computes position of the bottom end of the cursor relative to the text
                const cursorDistanceFromTATotalTop: number = (cursorLineAndColumn.line + 1) * lineHeight;
                const cursorDistanceFromTATotalLeft: number = cursorLineAndColumn.column * fontWidth;
                const yPos: number = cursorDistanceFromTATotalTop - this.scrollTop;
                const xPos: number = cursorDistanceFromTATotalLeft - this.scrollLeft;
                // shows the div at computed position if the cursor is visible
                if (0 <= yPos && yPos < this.clientHeight && 0 <= xPos && xPos < this.clientWidth) {
                    // if the div is in the upper part of the screen, shows it under the cursor
                    if (this.getBoundingClientRect().y + yPos <= window.innerHeight / 2) {
                        this.whisperDiv.setAttribute('style', `display: block; top: ${yPos + 4}px; left: ${xPos}px;`);
                    }
                    // if the div is in the lower part of the screen, shows it above the cursor
                    else {
                        this.whisperDiv.setAttribute('style',
                            `display: block; bottom: ${this.getBoundingClientRect().height - yPos + lineHeight}px; left: ${xPos}px;`);
                    }
                }
                // hides the div if the cursor is not visible (but DOES NOT SET whisperDiv.isShown to false to re-appear it again)
                else {
                    this.whisperDiv.setAttribute('style', `display: none;`);
                }
            }
        }

        ta.hideWhisper = function () {
            whisperDiv.innerHTML = '';
            this.whisperDiv.setAttribute('style', 'display: none;');
            this.whisperDiv.isShown = false;
        }

        ta.insertCurrentSelectedWhisper = function (onChange: (text: string, cursorIndex: number) => void) {
            const currWhisper: string | undefined = this.whisperDiv.getSelectedWhisper();
            if (currWhisper !== undefined) {
                const i: number = getStartOfWordBeforeIndex(this.value, this.selectionEnd);
                const beforeAdd: string = this.value.slice(0, i);
                const afterAdd: string = this.value.slice(this.selectionEnd);
                const newCursorPos: number = i + currWhisper.length;
                onChange(beforeAdd + currWhisper + afterAdd, newCursorPos);
                this.setSelectionRange(newCursorPos, newCursorPos);
                this.hideWhisper();
            }
        }

        // TEXTAREA ERROR RANGE HIGHLIGHTS
        ta.errorDivs = [];

        ta.moveErrors = function () {
            this.errorDivs.forEach(highlight => {
                // computes position of the highlight relative to the text
                const yPos: number = (highlight.startLine + 1) * lineHeight + 1 - this.scrollTop;
                // shows the div at computed position if the line is visible
                if (1 < yPos && yPos < this.clientHeight) {
                    let width: number = highlight.rangeLength * fontWidth;
                    let xPos: number = highlight.startColumn * fontWidth + 7 - this.scrollLeft;
                    // if the whole highlight is out of the width, does not display it
                    if (xPos > this.clientWidth || xPos + width < 3) {
                        highlight.setAttribute('style', `display: none;`);
                    }
                    else {
                        // updates position of highlights starting before first visible column
                        if (xPos < 3) {
                            width += xPos - 3;
                            xPos = 3;
                        }
                        // updates width of highlights ending after last visible column
                        if (xPos + width > this.clientWidth) {
                            width = this.clientWidth - xPos;
                        }
                        // updates the position of message span when the highlight is on the right side of the screen
                        if (this.getBoundingClientRect().x + xPos >= window.innerWidth / 2) {
                            highlight.messageSpan.setAttribute('style', `right: 50%; left: unset;`);
                        }
                        highlight.setAttribute('style', `display: block; top: ${yPos}px; left: ${xPos}px; width: ${width}px`);
                    }
                }
                // hides the div if the line is not visible
                else {
                    highlight.setAttribute('style', `display: none;`);
                }
            });
        }

        ta.updateErrors = function (ranges: {start: number, end: number, msg: string}[]) {
            // removes old highlight divs
            this.errorDivs.forEach(highlight => {
                highlight.remove();
            });
            this.errorDivs = [];

            // appends the highlight div as textarea child and adds it to highlights array
            const pushHighlight = (highlight: ErrorDiv) => {
                // @ts-ignore - adds it to the parent element
                this.parentElement.appendChild(highlight);
                this.errorDivs.push(highlight);
            }

            ranges.forEach(range => {
                // finds highlight start and end lines and columns
                const start = getPositionLineAndColumn(this.value, range.start);
                const end = getPositionLineAndColumn(this.value, range.end);
                // error on one line only
                if (start.line === end.line) {
                    pushHighlight(createHighlightDiv(start.line, start.column, end.column - start.column,
                        range.msg, this));
                }
                // error on multiple lines
                else {
                    // pushes first line part - from error start to line end
                    pushHighlight(createHighlightDiv(start.line, start.column,
                        getLineLength(this.value, start.line) - start.column, range.msg, this));
                    // pushes middle lines
                    for (let line = start.line + 1; line < end.line; ++line) {
                        pushHighlight(createHighlightDiv(line, 0, getLineLength(this.value, line),
                            range.msg, this));
                    }
                    // pushes last line part - from line start to error end
                    pushHighlight(createHighlightDiv(end.line, 0, end.column, range.msg, this));
                }
            });

            // moves highlight to current positions
            this.moveErrors();
        }

        // handles whisper div position when scrolling on page
        window.addEventListener('scroll', () => ta.moveWhisper());
        window.addEventListener('resize', () => {
            ta.moveWhisper();
            ta.moveErrors();
        });
        ta.onscroll     = () => {
            ta.paintLineNumbers(this.props.darkTheme);
            ta.moveWhisper();
            ta.moveErrors();
        };
        ta.addEventListener("focusout", () => ta.hideWhisper());
        ta.onmousedown  = () => {
            ta.mouseIsDown = true;
            ta.hideWhisper();
        }
        ta.onmouseup    = () => {
            ta.mouseIsDown = false;
            ta.paintLineNumbers(this.props.darkTheme);
        };
        ta.onmousemove  = () => {
            if (ta.mouseIsDown) ta.paintLineNumbers(this.props.darkTheme);
        };
        ta.oninput      = (ev) => {
            // @ts-ignore
            this.props.onChange(ev.target.value, ev.target.selectionStart);
        }
        // prevents default behavior of special keys input when whisperDiv is shown, passes key event to the parent
        ta.onkeydown    = (ev) => {
            // if the ctrl key is pressed, hides whisperDiv and keeps default behaviour
            if (ta.whisperDiv.isShown && ev.ctrlKey) {
                ta.hideWhisper();
            }
            // if the ctrl key is not pressed, changes whisper and key default behaviour
            else if (ta.whisperDiv.isShown) {
                if (ev.key === "ArrowDown") {
                    ta.whisperDiv.changeSelected(1);
                    ev.preventDefault();
                }
                if (ev.key === "ArrowUp") {
                    ta.whisperDiv.changeSelected(-1);
                    ev.preventDefault();
                }
                if (ev.key === "PageDown") {
                    // moves selected whisper to bottom
                    ta.whisperDiv.setSelected(-1);
                    ev.preventDefault();
                }

                if (ev.key === "PageUp") {
                    // moves selected whisper to top
                    ta.whisperDiv.setSelected(0);
                    ev.preventDefault();
                }
                if (ev.key === "End" || ev.key === "Home") {
                    ta.hideWhisper();
                    // keeps default behaviour
                }
                if (ev.key === "Escape" || ev.key === "Esc") {
                    ta.hideWhisper();
                    ev.preventDefault();
                }
                if (ev.key === "Enter" || ev.key === "Tab") {
                    ta.insertCurrentSelectedWhisper(this.props.onChange);
                    ev.preventDefault();
                }
                if (ev.key === "ArrowLeft") {
                    const cursor = (ta.selectionStart === 0) ? 0 : (ta.selectionStart - 1);
                    // forces update to recompute whispers if needed
                    this.props.onChange(ta.value, cursor);
                    // keeps default behaviour
                }
                if (ev.key === "ArrowRight") {
                    const cursor = (ta.selectionStart === ta.value.length) ? ta.selectionStart : ta.selectionStart + 1;
                    // forces update to recompute whispers if needed
                    this.props.onChange(ta.value, cursor);
                    // keeps default behaviour
                }
            }
        }

        // make sure numbers are painted
        ta.paintLineNumbers(this.props.darkTheme);
        // shows highlights
        ta.updateErrors(this.props.errors);
        this.textarea = ta;
    }

    /**
     * Updates text content and component style.
     */
    componentDidUpdate(prevProps: Readonly<XTextAreaProps>) {
        this.textarea.value = this.props.text;
        if (prevProps.darkTheme !== this.props.darkTheme) {
            this.updateStyle();
        }
        // whispers
        if (this.props.whispers !== prevProps.whispers) {
            this.textarea.showWhisper(this.props.whispers);
        }
        // highlights error
        if (this.props.errors !== undefined) {
            this.textarea.updateErrors(this.props.errors);
        }
        // first undefined highlight removes 'x-textarea-err' from textarea.className to show selection with blue color
        else if (this.props.errors !== prevProps.errors) {
            this.textarea.classList.remove('x-textarea-err');
        }
    }

    /**
     * Updates style of the XTextArea elements to fit current darkTheme settings.
     */
    private updateStyle(): void {
        // @ts-ignore
        this.reactDiv.current.classList.toggle('x-textarea-div-dark', this.props.darkTheme);
        // @ts-ignore
        this.reactDiv.current.classList.toggle('x-textarea-div-light', !this.props.darkTheme);
        this.textarea.classList.toggle('x-textarea-dark', this.props.darkTheme);
        this.textarea.classList.toggle('cursor-container-dark', this.props.darkTheme);
        this.textarea.classList.toggle('x-textarea-light', !this.props.darkTheme);
        this.textarea.classList.toggle('cursor-container-light', !this.props.darkTheme);
        this.textarea.paintLineNumbers(this.props.darkTheme);
        this.textarea.canvasLines.classList.toggle('canvas-dark', this.props.darkTheme);
        this.textarea.canvasLines.classList.toggle('canvas-light', !this.props.darkTheme);
        this.textarea.whisperDiv.classList.toggle('whisper-div-dark', this.props.darkTheme);
        this.textarea.whisperDiv.classList.toggle('whisper-div-light', !this.props.darkTheme);
        // @ts-ignore
        document.getElementById(this.props.id + '-td1').classList.toggle('x-textarea-table-td1-dark', this.props.darkTheme);
        // @ts-ignore
        document.getElementById(this.props.id + '-td1').classList.toggle('x-textarea-table-td1-light', !this.props.darkTheme);
    }

    /**
     * Renders only an empty div. Other maintaining is not provided by React.
     */
    public render() {
        return (
            <div
                ref={this.reactDiv}
                id={this.props.id}
                className="x-textarea-div"
            />
        );
    }
}

/**
 * Computes line and column number for given position in text.
 */
function getPositionLineAndColumn(text: string, position: number): {line: number, column: number} {
    const textBeforeCursor: string = text.slice(0, position);
    const line: number = (textBeforeCursor.match(/\n/g) || []).length;
    const lastNewLine: number = textBeforeCursor.lastIndexOf('\n');
    const column: number = textBeforeCursor.length - lastNewLine - 1;
    return {line, column};
}

/**
 *
 */
function getLineLength(text: string, line: number): number {
    let newLinesFound = 0;
    let lineStart = 0;  // index of line-th newline
    let lineEnd = 0;    // index of (line+1)-th newline
    for (let i = 0; i < text.length; ++i) {
        if (text.charAt(i) === '\n') {
            ++newLinesFound;
            if (newLinesFound === line) {
                lineStart = i;
            }
            else if (newLinesFound === line + 1) {
                lineEnd = i;
                break;
            }
        }
    }
    if (lineEnd === 0) {
        lineEnd = text.length; // handles case of last line in text
    }
    return lineEnd - lineStart;
}

/**
 *
 */
function createHighlightDiv(startLine: number, startColumn: number, rangeLength: number, msg: string,
                            textarea: ExtendedHTMLTextArea): ErrorDiv {
    // @ts-ignore
    const highlight: ErrorDiv = document.createElement('div');
    highlight.classList.add("x-textarea-highlight");
    highlight.startLine = startLine;
    highlight.startColumn = startColumn;
    highlight.rangeLength = rangeLength;
    // dispatches click event to not block textarea underneath highlights
    highlight.onclick = (ev: MouseEvent) => {
        const newEvent: MouseEvent = new MouseEvent(ev.type, {...ev});
        textarea.dispatchEvent(newEvent);
        ev.stopPropagation();
    }
    const span: HTMLSpanElement = document.createElement('span');
    span.classList.add("highlight-tooltip");
    span.innerText = msg;
    highlight.messageSpan = span;
    highlight.appendChild(span);
    return highlight;
}