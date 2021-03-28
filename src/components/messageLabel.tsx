import React from "react";

interface MessageLabelProps {
    // message to be shown
    message: string,
    // when true, the message is highlighted as error
    error: boolean,
    // true if dark theme should be applied
    darkTheme: boolean
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
        let color: string;
        if (this.props.darkTheme) {
            color = this.props.error ? "red" : "white";
        }
        else {
            color = this.props.error ? "red" : "black";
        }
        return (
            <p style={{color: color}}>
                {this.props.message}
            </p>
        );
    }
}