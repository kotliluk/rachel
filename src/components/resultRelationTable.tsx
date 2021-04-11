import React from "react";
import Relation from "../relation/relation";
import './css/resultRelationTable.css'
import Row from "../relation/row";

interface RelationTableProps {
    // relation to be shown
    relation: Relation
}

interface RelationTableState {
    // index of the column which is used to order the table (or -1 if none is used)
    orderBy: number,
    // 1 = ascending, -1 = descending
    orderDir: number
}

/**
 * Table which shows given relation. The relation cannot be edited
 * Rows can be ordered by column values when the column header is clicked.
 * When the same column header is clicked for the second time, the order direction is changed (asc, des, asc, des, ...).
 */
export class ResultRelationTable extends React.Component<RelationTableProps, RelationTableState> {

    constructor(props: RelationTableProps) {
        super(props);
        this.state = {
            orderBy: -1,
            orderDir: 1
        }
    }

    componentDidUpdate(prevProps: Readonly<RelationTableProps>, prevState: Readonly<RelationTableState>, snapshot?: any) {
        if (prevProps.relation !== this.props.relation) {
            this.setState({
                orderDir: 1,
                orderBy: -1
            });
        }
    }

    /**
     * Updates ordering column or direction. If the given orderBy index is already selected, switches ASC/DESC order.
     * Otherwise, sets ASC ordering by new orderBy column index.
     */
    private updateOrderBy(orderBy: number): void {
        this.setState(state => {
            if (state.orderBy === orderBy) {
                return {
                    orderDir: -state.orderDir,
                    orderBy: orderBy
                };
            }
            else {
                return {
                    orderDir: 1,
                    orderBy: orderBy
                };
            }
        });
    }

    private getOrderByText = (): string => {
        return this.state.orderDir === 1 ? " ▼" : " ▲";
    }

    /**
     * Creates a header row for a table (with given column names).
     *
     * @param columns
     */
    private createHeaderRow(columns: string[]) {
        return (
            <tr>
                <td className="row-number-td"/>
                {columns.map((columnName, index) => {
                    const text: string = this.state.orderBy === index ?
                        (columnName + this.getOrderByText()) : columnName;
                    return <th key={index} onClick={() => this.updateOrderBy(index)}>{text}</th>
                })}
            </tr>
        );
    }

    /**
     * Creates rows for a table. If there is no row in a resultRelation, returns one cell "<<NO ROWS>>".
     *
     * @param columns
     */
    private createRows(columns: string[]) {
        // creates default row if no exists
        if (this.props.relation.getRowsCount() === 0) {
            return (
                <tr key='1'>
                    <td className="row-number-td"/>
                    <td key='1' colSpan={columns.length}>{'<<NO ROWS>>'}</td>
                </tr>
            );
        }
        const rows: Row[] = this.props.relation.getRows();
        // sorts rows if orderBy is given (null values are after other values)
        if (this.state.orderBy > -1 && this.state.orderBy < columns.length) {
            const sortCol: string = columns[this.state.orderBy];
            // @ts-ignore cannot be undefined
            const type: "string" | "number" | "boolean" = rows[0].getType(sortCol);
            if (type === "number") {
                rows.sort((a, b) => {
                    // @ts-ignore
                    let aValue: number | null = a.getValue(sortCol);
                    // @ts-ignore
                    let bValue: number | null = b.getValue(sortCol);
                    // a is null
                    if (aValue === null && bValue !== null) {
                        return this.state.orderDir * Number.MAX_SAFE_INTEGER;
                    }
                    // b is null
                    if (aValue !== null && bValue === null) {
                        return this.state.orderDir * Number.MIN_SAFE_INTEGER;
                    }
                    // no is null - compares as numbers
                    if (aValue !== null && bValue !== null) {
                        // @ts-ignore
                        return this.state.orderDir * (a.getValue(sortCol) - b.getValue(sortCol));
                    }
                    // both are null
                    return 0;
                });
            }
            else {
                rows.sort((a, b) => {
                    // @ts-ignore
                    let aValue: string | boolean | null = a.getValue(sortCol);
                    // @ts-ignore
                    let bValue: string | boolean | null = b.getValue(sortCol);
                    // a is null
                    if (aValue === null && bValue !== null) {
                        return this.state.orderDir * Number.MAX_SAFE_INTEGER;
                    }
                    // b is null
                    if (aValue !== null && bValue === null) {
                        return this.state.orderDir * Number.MIN_SAFE_INTEGER;
                    }
                    // no is null - compares as strings
                    if (aValue !== null && bValue !== null) {
                        return this.state.orderDir * String(a.getValue(sortCol)).localeCompare(String(b.getValue(sortCol)));
                    }
                    // both are null
                    return 0;
                });
            }
        }
        // creates all rows if any
        return rows.map((row, index) => (
            <tr key={index}>
                <td className="row-number-td">{index + 1}</td>
                {row.getOrderedPrintValues(columns).map((value, index) => (
                    <td key={index}>{value}</td>
                ))}
            </tr>
        ));
    }

    render(){
        // creates header row
        const columns: string[] = this.props.relation.getColumnNames();
        const headerRow = this.createHeaderRow(columns);
        const rows = this.createRows(columns);

        return (
            <div className="result-table-container scrollbar-container">
                <table className="result-table">
                    <thead>
                    {headerRow}
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}