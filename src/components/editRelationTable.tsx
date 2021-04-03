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

    // true if dark theme should be applied
    darkTheme: boolean
}

interface EditRelationTableState {
    selectedColumn: number | undefined,
    selectedRow: "names" | "types" | number | undefined
}

/**
 * Table for editing a relation relation. It supports adding new columns and rows and editing all relation (column names,
 * column types and row inputs).
 */
export default class EditRelationTable extends React.Component<EditRelationTableProps, EditRelationTableState> {

    private readonly containerRef: React.RefObject<HTMLDivElement>;
    private readonly deleteButtonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: EditRelationTableProps) {
        super(props);
        this.state = {
            selectedColumn: undefined,
            selectedRow: undefined
        }
        this.containerRef = React.createRef<HTMLDivElement>();
        this.deleteButtonRef = React.createRef<HTMLButtonElement>();
    }

    /**
     * Adds listeners on window object to hide delete button
     */
    componentDidMount() {
        window.addEventListener("click", () => {
            if (this.deleteButtonRef.current !== null) {
                this.deleteButtonRef.current.style.visibility = "hidden";
            }
        });
        window.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape" || ev.key === "Esc") {
                if (this.deleteButtonRef.current !== null) {
                    this.deleteButtonRef.current.style.visibility = "hidden";
                }
                this.setSelectedInput(undefined, undefined);
            }
        });
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
        if (event.key === "Enter") {
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
    private createInput(value: string, column: number, row: "names" | "types" | number) {
        return (
            <input
                type='text'
                className={this.props.darkTheme ? 'text-input-dark' : 'text-input-light'}
                spellCheck={false}
                value={value}
                onChange={(e) => this.handleChange(e.target.value, column, row)}
                autoFocus={true}
            />
        )
    }

    /**
     * Creates a tooltip with given text.
     */
    private createTooltip(text: string, style?: React.CSSProperties) {
        return (
            <span
                className={"tooltip " + (this.props.darkTheme ? "tooltip-dark" : "tooltip-light")}
                style={style}
            >{text}</span>
        )
    }

    /**
     * Creates a button for deleting rows or columns.
     */
    private createDeleteButton = (callback: () => void) => {
        return (<button className="delete-row-or-column-button" onClick={callback}>&#10060;</button>);
    }

    /**
     * Creates a first row of the table with column names. If the table is editable and "names" row is selected,
     * the entry in selected column is changed to text input. Otherwise, plain text is displayed.
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
                <th
                    key={columnIndex}
                    className={className}
                    onClick={() => this.setSelectedInput(columnIndex, "names")}
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
            <tr><td className="row-number-td"/>{rowData}</tr>
        );
    }

    /**
     * Creates a first row of the table with column types. If the table is editable,
     * the entries in the row are select elements. Otherwise, plain texts are displayed.
     * If the table is editable, "add column" button is added in the last column with row span to the end of the table.
     */
    private createTypesRow() {
        const rowData = this.props.relation.getColumnTypes().map((columnType, columnIndex) => {
            const content = (
                <select
                    value={columnType}
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
            <tr><td className="row-number-td"/>{rowData}</tr>
        );
    }

    /**
     * Creates a data rows of the table. If the table is editable and any data row is selected,
     * the entry in selected column is changed to text input. Otherwise, plain text is displayed.
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
                        <td
                            key={columnIndex}
                            className={className}
                            onClick={() => this.setSelectedInput(columnIndex, rowIndex)}
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
        let contextButtonClassName: string;
        if (this.props.darkTheme) {
            divClassName = "edit-table-container edit-table-container-dark cursor-container-dark";
            tableClassName = "edit-table edit-table-dark";
            contextButtonClassName = "table-right-click-menu button-dark";
        }
        else {
            divClassName = "edit-table-container edit-table-container-light cursor-container-light";
            tableClassName = "edit-table edit-table-light";
            contextButtonClassName = "table-right-click-menu button-light";
        }

        return (
            <div
                className={divClassName}
                ref={this.containerRef}
                onKeyDown={this.handleKeyDown}>
                <button className={contextButtonClassName} ref={this.deleteButtonRef}/>
                <table
                    className={tableClassName}
                    onBlur={() => this.setSelectedInput(undefined, undefined)}>
                    <thead>
                        {this.createNamesRow()}
                        {this.createTypesRow()}
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