import React from "react";

/**
 * Props of TooltipButton component.
 * @category Components
 * @public
 */
interface TooltipButtonProps {
    /**
     * text on the button
     * @type string
     * @public
     */
    text: string,
    /**
     * handler of the button click
     * @type function
     * @public
     */
    onClick: () => void,
    /**
     * css class of the button
     * @type string?
     * @public
     */
    className?: string,
    /**
     * inline styling for button
     * @type React.CSSProperties?
     * @public
     */
    style?: React.CSSProperties,
    /**
     * text of the tooltip
     * @type string
     * @public
     */
    tooltip: string,
    /**
     * css class of the tooltip (it always has default .tooltip class)
     * @type string?
     * @public
     */
    tooltipClassName?: string,
    /**
     * inline styling for tooltip
     * @type React.CSSProperties?
     * @public
     */
    tooltipStyle?: React.CSSProperties,
}

interface TooltipButtonState {
}

/**
 * Button with a tooltip text.
 * Accepts {@link TooltipButtonProps} props.
 * @category Components
 * @public
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