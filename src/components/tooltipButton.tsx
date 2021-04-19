import React from "react";

interface TooltipButtonProps {
    // text on the button
    text: string,
    // handler of the button click
    onClick: () => void,
    // css class of the button
    className?: string,
    // inline styling for button
    style?: React.CSSProperties,

    // text of the tooltip
    tooltip: string,
    // css class of the tooltip (it always has default .tooltip class)
    tooltipClassName?: string,
    // inline styling for tooltip
    tooltipStyle?: React.CSSProperties,
}

interface TooltipButtonState {
}

/**
 * Button with a tooltip text.
 */
export class TooltipButton extends React.Component<TooltipButtonProps, TooltipButtonState> {

    render() {
        return (
            <button
                className={this.props.className}
                onClick={this.props.onClick}
                style={this.props.style}
                >{this.props.text}
                <span
                    className={"tooltip " + (this.props.tooltipClassName !== undefined ? this.props.tooltipClassName : "")}
                    style={this.props.tooltipStyle}
                    onClick={event => {
                        event.stopPropagation();
                        event.preventDefault();
                    }}
                >{this.props.tooltip}</span>
            </button>
        );
    }
}