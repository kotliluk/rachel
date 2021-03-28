import React from "react";

interface TooltipButtonProps {
    text: string,
    onClick: () => void,
    className: string,
    style?: React.CSSProperties,
    tooltip: string,
    tooltipClassName: string,
    tooltipStyle?: React.CSSProperties,
}

interface TooltipButtonState {
}

/**
 * Button with a tooltip text.
 *
 * Props:
 * - text: string: text on the button
 * - onClick: () => void: function triggered on the click
 * - className: string: css class of the button
 * - style?: React.CSSProperties: inline styling for button
 * - tooltip: string: text of the tooltip
 * - tooltipClassName: string: css class of the tooltip
 * - tooltipStyle?: React.CSSProperties: inline styling for tooltip
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
                    className={this.props.tooltipClassName}
                    style={this.props.tooltipStyle}
                >{this.props.tooltip}</span>
            </button>
        );
    }
}