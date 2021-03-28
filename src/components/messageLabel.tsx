import React from "react";

interface MessageLabelProps {
    message: string,
    darkTheme: boolean,
    error: boolean
}

interface MessageLabelState {}

/**
 * Label to show a message in a paragraph.
 *
 * Props:
 * - message: string: message to be shown
 * - color: string: color of the font
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