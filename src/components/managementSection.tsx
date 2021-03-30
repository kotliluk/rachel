import React from "react";
import {CsvValueSeparatorChar} from "../tools/csvSupport";
import {SupportedLanguage} from "../tools/supportedLanguage";
import "./css/managementSection.css"

interface ManagementSectionProps {
    // handler of batch processing
    onBatch: (onDone: (msg: string) => void) => void,

    // handler of project import
    onImportProject: (onDone: (msg: string) => void) => void,
    // handler of project export
    onExportProject: (onDone: (msg: string) => void) => void,

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
    sectionClicked: boolean,
    state: "hidden" | "batch" | "project" | "settings",
    batchMessage: string,
    projectMessage: string
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
            sectionClicked: false,
            state: "hidden",
            batchMessage: "",
            projectMessage: ""
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

    /**
     * Changes displayed tools after button click.
     *
     * @param toState clicked button state
     */
    private handleStateChange = (toState: "batch" | "project" | "settings" | "hidden") => {
        // clears states messages
        this.setState({
            batchMessage: "",
            projectMessage: ""
        });
        // hides after second click
        if (this.state.state === toState) {
            return this.setState({state: "hidden"});
        }
        this.setState({state: toState});
    };

    render() {
        const createButtonChangeState = (text: string, changeTo: "batch" | "project" | "settings") => {
            const className: string = (this.props.darkTheme ?
                (this.state.state === changeTo ? "button-clicked-dark" : "button-dark") :
                (this.state.state === changeTo ? "button-clicked-light" : "button-light"));
            return (
                <button
                    onClick={() => this.handleStateChange(changeTo)}
                    className={className}
                >{text}</button>);
        }
        const createAboutButton = () => {
            const className: string = "button-like-link " + (this.props.darkTheme ? "button-dark" : "button-light");
            return (
                <a
                    href="https://github.com/kotliluk/rachel"
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                >About</a>
            );
        }

        let openState = null;
        if (this.state.state === "batch") {
            openState = this.createBatch();
        }
        else if (this.state.state === "project") {
            openState = this.createProject();
        }
        else if (this.state.state === "settings") {
            openState = this.createSettings();
        }

        let sectionClassName = this.props.darkTheme ? "section-border-dark" : "section-border-light";
        if (this.state.sectionClicked) {
            sectionClassName = this.props.darkTheme ? "section-border-dark-clicked" : "section-border-light-clicked";
        }
        return (
            <header
                ref={this.sectionRef}
                className={sectionClassName}
                style={{paddingTop: "5px", paddingBottom: "5px", marginTop: "5px"}}>
                <div>
                    {createButtonChangeState("Batch processing", "batch")}
                    {createButtonChangeState("Project", "project")}
                    {createButtonChangeState("Settings", "settings")}
                    {createAboutButton()}
                </div>

                {openState}
            </header>
        );
    }

    private createBatch = () => {
        return (
            <section>
                <p>
                    Select multiple input files with expressions. The expressions will be evaluated and the reports will be generated.
                    Please be patient, the action freezes the application for couple of seconds.
                    You can see progress in the browser console (F12).
                </p>
                <button
                    onClick={() => this.props.onBatch((msg: string) => this.setState({batchMessage: msg}))}
                    className={this.props.darkTheme ? 'button-dark' : 'button-light'}
                >Select files and evaluate</button>
                <p>
                    {this.state.batchMessage}
                </p>
            </section>
        );
    }

    private createProject = () => {
        return (
            <section>
                <p>
                    Import or export project's data (i.e., stored relations, all expressions and null values support flag).
                </p>
                <button
                    onClick={() => this.props.onImportProject((msg: string) => this.setState({projectMessage: msg}))}
                    className={this.props.darkTheme ? 'button-dark' : 'button-light'}
                >Import</button>
                <button
                    onClick={() => this.props.onExportProject((msg: string) => this.setState({projectMessage: msg}))}
                    className={this.props.darkTheme ? 'button-dark' : 'button-light'}
                >Export</button>
                <p>
                    {this.state.projectMessage}
                </p>
            </section>
        );
    }

    private createSettings = () => {
        return (
            <ul style={{listStyleType: "none"}}>
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
                {/*<li> // NOT SUPPORTED YET
                    Language:
                    <input
                        type="radio"
                        name="language"
                        value="eng"
                        id="language_eng"
                        checked={this.props.language === "ENG"}
                        onClick={() => this.props.onLanguageChange("ENG")} />
                    <label htmlFor="language_eng">ENG</label>
                    <input
                        type="radio"
                        name="language"
                        value="cze"
                        id="language_cze"
                        checked={this.props.language === "CZE"}
                        onClick={() => this.props.onLanguageChange("CZE")} />
                    <label htmlFor="language_cze">CZE</label>
                </li>*/}
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
    }
}