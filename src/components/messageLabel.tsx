import React from "react";

interface MessageLabelProps {
    // message to be shown
    message: string,
    // true if dark theme should be applied
    darkTheme: boolean,
    // inline styling for the message label
    style?: React.CSSProperties
}

interface MessageLabelState {}

/**
 * Label to show a message in a paragraph.
 */
export class MessageLabel extends React.Component<MessageLabelProps, MessageLabelState> {

    render() {
        // does not render for an empty message
        if (this.props.message === '') {
            return null;
        }
        return (
            <p style={this.props.style}>
                {this.props.message}
            </p>
        );
    }
}