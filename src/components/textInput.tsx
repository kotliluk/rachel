import React from "react";

interface TextInputProps {
    // initial value for the input
    value: string,
    // text on the submit button
    buttonText: string,
    // handler of input submit
    onSubmit: (text: string) => void,
    // function which returns true for forbidden inputs which cannot be submitted
    forbidden: (text: string) => boolean,

    // id of the input
    id: string
}

interface TextInputState {
    value: string,
    buttonDisable: boolean
}

/**
 * Basic text input with submit button (without label). The input cannot be submit if the current value is forbidden.
 * All inserted tabulators are replaced by 4 spaces.
 */
export class TextInput extends React.Component<TextInputProps, TextInputState> {

    private readonly inputRef: React.RefObject<HTMLInputElement>;

    constructor(props: TextInputProps) {
        super(props);
        this.state = {
            value: this.props.value,
            buttonDisable: this.props.forbidden(this.props.value)
        }
        this.inputRef = React.createRef();
    }

    componentDidUpdate(prevProps: Readonly<TextInputProps>) {
        if (prevProps.value !== this.props.value) {
            this.setState({value: this.props.value});
        }
    }

    private handleChange = (value: string): void => {
        value = value.replace(/\t/g, "    ");
        const disable: boolean = this.props.forbidden(value);
        this.setState({
            value: value,
            buttonDisable: disable
        });
    }

    private handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter") {
            if (!this.state.buttonDisable) {
                this.handleSubmit();
            }
        }
        else if (event.key === "Escape" || event.key === "Esc") {
            if (this.inputRef.current !== null) {
                this.inputRef.current.blur();
            }
        }
    }

    private handleSubmit = (): void => {
        this.props.onSubmit(this.state.value);
    }

    public render() {
        return (
            <>
                <input
                    ref={this.inputRef}
                    type='text'
                    id={this.props.id}
                    spellCheck={false}
                    autoComplete={"off"}
                    value={this.state.value}
                    onChange={event => this.handleChange(event.target.value)}
                    onKeyDown={this.handleKeyDown}
                    className={'text-input'}
                />
                <button
                    onClick={this.handleSubmit}
                    disabled={this.state.buttonDisable}
                >{this.props.buttonText}</button>
            </>
        );
    }
}