import React from "react";
import './css/editRelationTable.css';
import {StoredRelation} from "../relation/storedRelation";
import {SupportedColumnType} from "../relation/columnType";
import {RCToStringMap} from "../tools/rcToStringMap";

interface EditRelationTableProps {
    // storing representation of the relation to be edited
    relation: StoredRelation,

    // handler of column name change
    onColumnNameChange: (columnName: string, columnIndex: number) => void,
    // handler of column type change
    onColumnTypeChange: (columnType: SupportedColumnType, columnIndex: number) => void,
    // handler of row input change
    onRowInputChange: (input: string, columnIndex: number, rowIndex: number) => void,
    // handler of adding new row
    onNewRow: (onDone: () => void) => void,
    // handler of adding new column
    onNewColumn: (onDone: () => void) => void,
    // handler of deleting the row of given index
    onDeleteRow: (rowIndex: number) => void,
    // handler of deleting the column of given index
    onDeleteColumn: (columnIndex: number) => void,

    // handler of input with Ctrl key
    onCtrlInput: (ev: React.KeyboardEvent) => void,

    // true if dark theme should be applied
    darkTheme: boolean
}

interface EditRelationTableState {
    selectedColumn: number | undefined,
    selectedRow: "names" | "types" | number | undefined
}

// @ts-ignore
const cssConstants: CSSStyleDeclaration = getComputedStyle(document.querySelector(':root'));
const cellPaddingSides: number = Number(cssConstants.getPropertyValue('--cell-padding-sides-num'));

/**
 * Table for editing a relation relation. It supports adding new columns and rows and editing all relation (column names,
 * column types and row inputs).
 */
export default class EditRelationTable extends React.Component<EditRelationTableProps, EditRelationTableState> {

    private readonly containerRef: React.RefObject<HTMLDivElement>;
    // reference to the head row with columns names
    private readonly tableHeadRowRef: React.RefObject<HTMLTableRowElement>;
    // width of cells in head (with deducted padding) to set proper inputs width to not resize the table
    private columnWidths: number[] = [];

    constructor(props: EditRelationTableProps) {
        super(props);
        this.state = {
            selectedColumn: undefined,
            selectedRow: undefined
        }
        this.containerRef = React.createRef<HTMLDivElement>();
        this.tableHeadRowRef = React.createRef<HTMLTableRowElement>();
    }

    componentDidMount() {
        // clicking in the window blurs the selected input (if clicked into a cell, event propagation is stopped to not blur
        window.addEventListener('click', () => {
            this.setSelectedInput(undefined, undefined);
        });
    }

    componentDidUpdate() {
        const headRow = this.tableHeadRowRef.current;
        if (headRow !== null) {
            // cells without the first (line number) and last (add column button)
            const cells = [...headRow.cells].slice(1, -1);
            this.columnWidths = cells.map(cell => cell.clientWidth - 2 * cellPaddingSides);
        }
    }

    /**
     * Changes column width if the resized input element does not fit in it anymore.
     */
    private handleInputResize = (inputElement: EventTarget & HTMLInputElement, column: number) => {
        // handles larger width
        if (inputElement.scrollWidth > this.columnWidths[column]) {
            this.columnWidths[column] = inputElement.scrollWidth;
        }
    }

    /**
     * Returns error of the relation to edit.
     */
    private getErrors = (): RCToStringMap => {
        return this.props.relation.getErrors();
    }

    /**
     * Sets selected input column and row to given values.
     */
    private setSelectedInput = (column: number | undefined, row: "names" | "types" | number | undefined): void => {
        this.setState({
            selectedColumn: column,
            selectedRow: row
        });
    }

    /**
     * Moves selected input to right if it is defined and not in the last column.
     */
    private moveSelectedInputRight = (): void => {
        const selectedColumn = this.state.selectedColumn;
        const selectedRow = this.state.selectedRow;
        if (selectedColumn !== undefined && selectedRow !== undefined) {
            // if not last column was selected
            if (selectedColumn < this.props.relation.getColumnCount() - 1) {
                this.setState({selectedColumn: selectedColumn + 1});
            }
        }
    }

    /**
     * Moves selected input to left if it is defined and not in the first column.
     */
    private moveSelectedInputLeft = (): void => {
        const selectedColumn = this.state.selectedColumn;
        const selectedRow = this.state.selectedRow;
        if (selectedColumn !== undefined && selectedRow !== undefined) {
            // if not first column was selected
            if (selectedColumn > 0) {
                this.setState({selectedColumn: selectedColumn - 1});
            }
        }
    }

    /**
     * Moves selected input up if it is defined and not in the first row.
     */
    private moveSelectedInputUp = (): void => {
        const selectedColumn = this.state.selectedColumn;
        const selectedRow = this.state.selectedRow;
        if (selectedColumn !== undefined && selectedRow !== undefined) {
            // if not first row was selected
            if (typeof selectedRow === "number") {
                if (selectedRow === 0) {
                    this.setState({selectedRow: "names"});
                }
                else {
                    this.setState({selectedRow: selectedRow - 1});
                }
            }
        }
    }

    /**
     * Moves selected input down if it is defined and not in the last row.
     */
    private moveSelectedInputDown = (): void => {
        const selectedColumn = this.state.selectedColumn;
        const selectedRow = this.state.selectedRow;
        if (selectedColumn !== undefined && selectedRow !== undefined) {
            if (selectedRow === "names" && this.props.relation.getRowCount() > 0) {
                this.setState({selectedRow: 0});
            }
            // if not last row was selected
            if (typeof selectedRow === "number" && selectedRow < this.props.relation.getRowCount() - 1) {
                this.setState({selectedRow: selectedRow + 1});
            }
        }
    }

    /**
     * Catches key inputs with special effects in tht table.
     */
    private handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key === "Enter" || event.key === "Esc" || event.key === "Escape") {
            this.setSelectedInput(undefined, undefined);
        }
        else if (event.key === "Tab" || (event.ctrlKey && event.key === "ArrowRight")) {
            this.moveSelectedInputRight();
            event.preventDefault();
        }
        else if (event.ctrlKey && event.key === "ArrowLeft") {
            this.moveSelectedInputLeft();
            event.preventDefault();
        }
        else if (event.ctrlKey && event.key === "ArrowUp") {
            this.moveSelectedInputUp();
            event.preventDefault();
        }
        else if (event.ctrlKey && event.key === "ArrowDown") {
            this.moveSelectedInputDown();
            event.preventDefault();
        }
        if (event.ctrlKey) {
            this.props.onCtrlInput(event);
        }
    }

    /**
     * Passes the change of the column name, column type or row input to the parent element.
     * When row = "types", it is expected that value is of SupportedColumnType type.
     * Tabulators are replaced by 4 spaces.
     */
    private handleChange = (value: string, column: number, row: "names" | "types" | number): void => {
        value = value.replace(/\t/g, "    ");
        if (row === "names") {
            this.props.onColumnNameChange(value, column);
        }
        else if (row === "types") {
            // @ts-ignore - should be ensured before method call
            this.props.onColumnTypeChange(value, column);
        }
        else {
            this.props.onRowInputChange(value, column, row);
        }
    }

    /**
     * Adds a new column to the relation and scrolls to it.
     */
    private handleNewColumn = (): void => {
        this.props.onNewColumn(() => {
            // @ts-ignore
            this.containerRef.current.scrollTo(this.containerRef.current.clientWidth, this.containerRef.current.scrollTop)
        });
    }

    /**
     * Adds a new row to the relation and scrolls to it.
     */
    private handleNewRow = (): void => {
        this.props.onNewRow(() => {
            // @ts-ignore
            this.containerRef.current.scrollTo(this.containerRef.current.scrollLeft, this.containerRef.current.clientHeight)
        });
    }

    /**
     * Deletes the column at given index.
     */
    private handleDeleteColumn = (column: number): void => {
        this.props.onDeleteColumn(column);
    }

    /**
     * Deletes the row at given index.
     */
    private handleDeleteRow = (row: number): void => {
        this.props.onDeleteRow(row);
    }

    /**
     * Creates a text input bind to handling change of given column and row.
     */
    private createInput = (value: string, column: number, row: "names" | "types" | number) => {
        return (
            <input
                type='text'
                className={this.props.darkTheme ? 'text-input-dark' : 'text-input-light'}
                spellCheck={false}
                value={value}
                onChange={(e) => {
                    this.handleChange(e.target.value, column, row);
                    this.handleInputResize(e.target, column);
                }}
                autoFocus={true}
                style={{width: this.columnWidths[column] + "px"}}
            />
        )
    }

    /**
     * Creates a tooltip with given text.
     */
    private createTooltip(text: string, style?: React.CSSProperties) {
        return (
            <span className={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                style={style}>{text}</span>
        )
    }

    /**
     * Creates a button for deleting rows or columns.
     */
    private createDeleteButton = (callback: () => void) => {
        return (<button className="delete-row-or-column-button" onClick={callback}>&#10006;</button>);
    }

    /**
     * Creates content of the first row of the table with column names.
     * If the table is editable, additional blank column is added for "add column" button in next rows.
     */
    private createNamesRow() {
        const rowData = this.props.relation.getColumnNames().map((columnName, columnIndex) => {
            let content: string | JSX.Element = columnName;
            if (this.state.selectedColumn === columnIndex && this.state.selectedRow === "names") {
                content = this.createInput(columnName, columnIndex, "names");
            }
            let span: null | JSX.Element = null;
            let className: string = "name-th";
            const error = this.getErrors().get("name", columnIndex);
            if (error !== undefined) {
                span = this.createTooltip(error, {top: "120%", bottom: "auto"});
                className += " error-input";
            }
            return (
                <th key={columnIndex}
                    className={className}
                    onClick={ev => {
                        this.setSelectedInput(columnIndex, "names");
                        ev.stopPropagation();
                    }}
                >{content}{span}</th>
            )});
        // pushes "add column" button in last column
        rowData.push(
            <td key='add-column'
                rowSpan={2}
                style={{width: "24px", border: "none", padding: "1px"}}>
                <button
                    onClick={this.handleNewColumn}
                    className={this.props.darkTheme ? "button-dark" : "button-light"}
                    style={{width: "100%", height: "100%"}}><strong>+</strong></button>
            </td>);
        return (
            <><td className="row-number-td"/>{rowData}</>
        );
    }

    /**
     * Creates content of the second row of the table with column types.
     * If the table is editable, "add column" button is added in the last column with row span to the end of the table.
     */
    private createTypesRow() {
        const rowData = this.props.relation.getColumnTypes().map((columnType, columnIndex) => {
            const content = (
                <select value={columnType}
                    onChange={(e) => this.handleChange(e.target.value, columnIndex, "types")}>
                    <option>number</option>
                    <option>string</option>
                    <option>boolean</option>
                </select>
            );
            return (
                <th key={columnIndex}
                    className="type-th"
                >{content}{this.createDeleteButton(() => this.handleDeleteColumn(columnIndex))}</th>
            )});
        return (
            <><td className="row-number-td"/>{rowData}</>
        );
    }

    /**
     * Creates a data rows of the table.
     */
    private createRows() {
        // creates default row if no exists
        if (this.props.relation.getRows().length === 0) {
            return null;
        }
        const rows: string[][] = this.props.relation.getRows();
        // creates all rows if any
        return rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
                <td className="row-number-td">
                    {rowIndex + 1}
                    {this.createDeleteButton(() => this.handleDeleteRow(rowIndex))}
                </td>
                {row.map((value, columnIndex) => {
                    let content: string | JSX.Element = value;
                    if (this.state.selectedColumn === columnIndex && this.state.selectedRow === rowIndex) {
                        content = this.createInput(value, columnIndex, rowIndex);
                    }
                    let span: null | JSX.Element = null;
                    let className: string = "";
                    const error = this.getErrors().get(rowIndex, columnIndex);
                    if (error !== undefined) {
                        span = this.createTooltip(error);
                        className = "error-input";
                    }
                    return (
                        <td key={columnIndex}
                            className={className}
                            onClick={ev => {
                                this.setSelectedInput(columnIndex, rowIndex);
                                ev.stopPropagation();
                            }}
                        >{content}{span}</td>
                    )})}
            </tr>
        ));
    }

    /**
     * Creates the last row of the table with button for adding rows.
     */
    private createAddRow() {
        return (
            <tr key='add-row'>
                <td key='add-row-column'
                    className="add-row-td">
                    <button
                        onClick={this.handleNewRow}
                        className={this.props.darkTheme ? "button-dark" : "button-light"}
                        ><strong>+</strong></button>
                </td>
            </tr>
        );
    }

    public render() {
        let divClassName: string;
        let tableClassName: string;
        if (this.props.darkTheme) {
            divClassName = "edit-table-container edit-table-container-dark cursor-container-dark";
            tableClassName = "edit-table edit-table-dark";
        }
        else {
            divClassName = "edit-table-container edit-table-container-light cursor-container-light";
            tableClassName = "edit-table edit-table-light";
        }

        return (
            <div
                className={divClassName}
                ref={this.containerRef}
                onKeyDown={this.handleKeyDown}>
                <table className={tableClassName}>
                    <thead>
                        <tr ref={this.tableHeadRowRef}>{this.createNamesRow()}</tr>
                        <tr>{this.createTypesRow()}</tr>
                    </thead>
                    <tbody>
                        {this.createRows()}
                        {this.createAddRow()}
                    </tbody>
                </table>
            </div>
        );
    }
}