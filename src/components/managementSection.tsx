import React from "react";
import {CsvValueSeparatorChar} from "../tools/csvSupport";
import {SupportedLanguage} from "../tools/supportedLanguage";
import "./css/managementSection.css"
import {getSamples} from "../project/samples";
import {Project} from "../project/project";

interface ManagementSectionProps {
    // handler of batch processing
    onBatch: () => void,

    // handler of project loading
    onLoadProject: () => void,
    // handler of project saving
    onSaveProject: () => void,

    //
    onLoadSample: (sample: Project) => void,

    // current selected value separator in csv files
    csvValueSeparator: CsvValueSeparatorChar,
    // current selected language of the application
    language: SupportedLanguage,
    // current selected null values support
    nullValuesSupport: boolean,
    // true if dark theme should be applied
    darkTheme: boolean,

    // handler of change of the current selected value separator in csv files
    onCsvValueSeparatorChange: (csvValueSeparator: CsvValueSeparatorChar) => void,
    // handler of change of the current selected language of the application
    onLanguageChange: (language: SupportedLanguage) => void,
    // handler of change of the current selected null values support
    onNullValuesSupportChange: (nullValuesSupport: boolean) => void,
    // handler of change of the current selected theme
    onDarkModeChange: (darkTheme: boolean) => void
}

interface ManagementSectionState {
    sectionClicked: boolean
}

/**
 * Section to manage batch processing, importing/exporting the project, and settings.
 */
export class ManagementSection extends React.Component<ManagementSectionProps, ManagementSectionState> {

    // reference to this section element
    private readonly sectionRef: React.RefObject<HTMLDivElement>;

    constructor(props: ManagementSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false
        }
        this.sectionRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        const section = this.sectionRef.current;
        if (section !== null) {
            section.addEventListener("click", () => {
                this.setState({sectionClicked: true});
            }, true); // useCapture = true for overwriting the window listener
        }
        window.addEventListener("click", () => {
            this.setState({sectionClicked: false});
        }, true); // useCapture = true for overwriting by section listener
    }

    render() {
        const createBatchButton = () => {
            const className: string = this.props.darkTheme ? "button-dark" : "button-light";
            return (
                <button
                    onClick={this.props.onBatch}
                    className={className}
                >Batch</button>);
        }
        const createLoadProjectButton = () => {
            const className: string = this.props.darkTheme ? "button-dark" : "button-light";
            return (
                <button
                    onClick={this.props.onLoadProject}
                    className={className}
                >Load</button>);
        }
        const createSaveProjectButton = () => {
            const className: string = this.props.darkTheme ? "button-dark" : "button-light";
            return (
                <button
                    onClick={this.props.onSaveProject}
                    className={className}
                >Save</button>);
        }
        const createSettingsButton = () => {
            const buttonClassName: string = this.props.darkTheme ? "button-dark" : "button-light";
            const menuClassName: string = "list-menu " + (this.props.darkTheme ? "list-menu-dark" : "list-menu-light");
            const settingsMenu = (
                <ul className={menuClassName}>
                    <li>
                        Null values:
                        <input
                            type="radio"
                            name="null_values_support"
                            value="allowed"
                            id="null_values_support_allowed"
                            checked={this.props.nullValuesSupport}
                            onClick={() => this.props.onNullValuesSupportChange(true)} />
                        <label htmlFor="null_values_support_allowed">allowed</label>
                        <input
                            type="radio"
                            name="null_values_support"
                            value="forbidden"
                            id="null_values_support_forbid"
                            checked={!this.props.nullValuesSupport}
                            onClick={() => this.props.onNullValuesSupportChange(false)} />
                        <label htmlFor="null_values_support_forbid">forbidden</label>
                    </li>
                    <li>
                        CSV separator:
                        <input
                            type="radio"
                            name="value_separator"
                            value="semicolon"
                            id="value_separator_semi"
                            checked={this.props.csvValueSeparator === ";"}
                            onClick={() => this.props.onCsvValueSeparatorChange(";")}/>
                        <label htmlFor="value_separator_semi">semicolon</label>
                        <input
                            type="radio"
                            name="value_separator"
                            value="comma"
                            id="value_separator_comma"
                            checked={this.props.csvValueSeparator === ","}
                            onClick={() => this.props.onCsvValueSeparatorChange(",")}/>
                        <label htmlFor="value_separator_comma">comma</label>
                    </li>
                    <li>
                        Theme:
                        <input
                            type="radio"
                            name="dark_mode"
                            value="on"
                            id="dark_mode_on"
                            checked={!this.props.darkTheme}
                            onClick={() => this.props.onDarkModeChange(false)} />
                        <label htmlFor="dark_mode_on">light</label>
                        <input
                            type="radio"
                            name="dark_mode"
                            value="off"
                            id="dark_mode_off"
                            checked={this.props.darkTheme}
                            onClick={() => this.props.onDarkModeChange(true)} />
                        <label htmlFor="dark_mode_off">dark</label>
                    </li>
                </ul>
            );
            return (
                <div className={"button-like " + buttonClassName}
                >Settings{settingsMenu}</div>);
        }
        const createSamplesButton = () => {
            const buttonClassName: string = this.props.darkTheme ? "button-dark" : "button-light";
            const menuClassName: string = "list-menu " + (this.props.darkTheme ? "list-menu-dark" : "list-menu-light");
            const settingsMenu = (
            <ul className={menuClassName}>
                {getSamples().map((sample, i) => {
                    return (
                        <li key={i}>
                            <button
                                onClick={() => this.props.onLoadSample(sample.project)}
                                className={buttonClassName}
                            >{sample.name}</button>
                        </li>
                    );
                })}
            </ul>
            );
            return (
                <div className={"button-like " + buttonClassName}
                >Samples{settingsMenu}</div>);
        }
        const createAboutButton = () => {
            const className: string = this.props.darkTheme ? "button-dark" : "button-light";
            return (
                <a
                    href="https://github.com/kotliluk/rachel"
                    target="_blank"
                    rel="noreferrer"
                    className={"button-like " + className}
                >About</a>
            );
        }

        let sectionClassName = "management-section ";
        if (this.state.sectionClicked) {
            sectionClassName += this.props.darkTheme ? "section-border-dark-clicked" : "section-border-light-clicked";
        }
        else {
            sectionClassName += this.props.darkTheme ? "section-border-dark" : "section-border-light";
        }
        return (
            <header
                ref={this.sectionRef}
                className={sectionClassName}
                style={{paddingTop: "5px", paddingBottom: "5px", marginTop: "5px"}}>
                {createBatchButton()}
                {createLoadProjectButton()}
                {createSaveProjectButton()}
                {createSamplesButton()}
                {createSettingsButton()}
                {createAboutButton()}
            </header>
        );
    }
}