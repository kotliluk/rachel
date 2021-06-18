import React from "react";
import {CsvValueSeparator} from "../types/csvSupport";
import {allSupportedLanguages, LanguageDef, SupportedLanguage} from "../language/language";
import "./css/managementSection.css"
import {getSamples} from "../project/samples";
import {Project} from "../project/project";
import {TooltipButton} from "./tooltipButton";

/**
 * Props of ManagementSection component.
 * @category Components
 * @public
 */
interface ManagementSectionProps {
    /**
     * handler of loading a config file for batch processing
     * @type function
     * @public
     */
    onBatchConfig: () => void,
    /**
     * handler of loading project files for batch processing
     * @type function
     * @public
     */
    onBatchLoad: () => void,
    /**
     * information about current batch configuration
     * @type string
     * @public
     */
    batchConfigurationInfo: string,
    /**
     * handler of project loading
     * @type function
     * @public
     */
    onLoadProject: () => void,
    /**
     * handler of project saving
     * @type function
     * @public
     */
    onSaveProject: () => void,
    /**
     * handler of loading the selected sample project
     * @type function
     * @public
     */
    onLoadSample: (sample: Project) => void,
    /**
     * current selected value separator in csv files
     * @type CsvValueSeparator
     * @public
     */
    csvValueSeparator: CsvValueSeparator,
    /**
     * current selected language of the application
     * @type LanguageDef
     * @public
     */
    language: LanguageDef,
    /**
     * current selected null values support
     * @type boolean
     * @public
     */
    nullValuesSupport: boolean,
    /**
     * true if dark theme should be applied
     * @type boolean
     * @public
     */
    darkTheme: boolean,
    /**
     * handler of change of the current selected value separator in csv files
     * @type function
     * @public
     */
    onCsvValueSeparatorChange: (csvValueSeparator: CsvValueSeparator) => void,
    /**
     * handler of change of the current selected language of the application
     * @type function
     * @public
     */
    onLanguageChange: (language: SupportedLanguage) => void,
    /**
     * handler of change of the current selected null values support
     * @type function
     * @public
     */
    onNullValuesSupportChange: (nullValuesSupport: boolean) => void,
    /**
     * handler of change of the current selected theme
     * @type function
     * @public
     */
    onDarkThemeChange: (darkTheme: boolean) => void
}

interface ManagementSectionState {
    sectionClicked: boolean
}

/**
 * Section to manage batch processing, importing/exporting the project, and settings.
 * Accepts {@link ManagementSectionProps} props.
 * @category Components
 * @public
 */
export class ManagementSection extends React.Component<ManagementSectionProps, ManagementSectionState> {

    constructor(props: ManagementSectionProps) {
        super(props);
        this.state = {
            sectionClicked: false
        }
    }

    render() {
        const lang = this.props.language.managementSection;

        const createBatchButton = () => {
            const batchMenu = (
              <ul className="list-menu">
                  <TooltipButton text={lang.batchConfig} onClick={this.props.onBatchConfig}
                                 tooltip={this.props.batchConfigurationInfo}/>
                  <button onClick={this.props.onBatchLoad}>{lang.batchLoad}</button>
              </ul>
            )
            return (<div className={"button-like"}>{lang.batchTitle}{batchMenu}</div>);
        }
        const createLoadProjectButton = () => {
            return (<button onClick={this.props.onLoadProject} >{lang.loadButton}</button>);
        }
        const createSaveProjectButton = () => {
            return (<button onClick={this.props.onSaveProject} >{lang.saveButton}</button>);
        }
        const createSettingsButton = () => {
            const settingsMenu = (
                <ul className="list-menu">
                    <li>
                        <span>{lang.settingsNullValues}:</span>
                        <input
                            type="radio"
                            name="null_values_support"
                            value="allowed"
                            id="null_values_support_allowed"
                            checked={this.props.nullValuesSupport}
                            onChange={() => this.props.onNullValuesSupportChange(true)} />
                        <label htmlFor="null_values_support_allowed">{lang.settingsNullValuesAllowed}</label>
                        <input
                            type="radio"
                            name="null_values_support"
                            value="forbidden"
                            id="null_values_support_forbid"
                            checked={!this.props.nullValuesSupport}
                            onChange={() => this.props.onNullValuesSupportChange(false)} />
                        <label htmlFor="null_values_support_forbid">{lang.settingsNullValuesForbidden}</label>
                    </li>
                    <li>
                        <span>{lang.settingsCSVSeparator}:</span>
                        <input
                            type="radio"
                            name="value_separator"
                            value="semicolon"
                            id="value_separator_semi"
                            checked={this.props.csvValueSeparator === ";"}
                            onChange={() => this.props.onCsvValueSeparatorChange(";")}/>
                        <label htmlFor="value_separator_semi">{lang.settingsCSVSeparatorSemicolon}</label>
                        <input
                            type="radio"
                            name="value_separator"
                            value="comma"
                            id="value_separator_comma"
                            checked={this.props.csvValueSeparator === ","}
                            onChange={() => this.props.onCsvValueSeparatorChange(",")}/>
                        <label htmlFor="value_separator_comma">{lang.settingsCSVSeparatorComma}</label>
                    </li>
                    <li>
                        <span>{lang.settingsTheme}:</span>
                        <input
                            type="radio"
                            name="dark_mode"
                            value="on"
                            id="dark_mode_on"
                            checked={!this.props.darkTheme}
                            onChange={() => this.props.onDarkThemeChange(false)} />
                        <label htmlFor="dark_mode_on">{lang.settingsThemeLight}</label>
                        <input
                            type="radio"
                            name="dark_mode"
                            value="off"
                            id="dark_mode_off"
                            checked={this.props.darkTheme}
                            onChange={() => this.props.onDarkThemeChange(true)} />
                        <label htmlFor="dark_mode_off">{lang.settingsThemeDark}</label>
                    </li>
                    <li>
                        <span>{lang.settingsLanguage}:</span>
                        {allSupportedLanguages.map(lang => {
                            return (<div key={lang} style={{display: "inline"}}>
                                <input
                                    type="radio"
                                    name="language"
                                    value={lang}
                                    id={"language_" + lang}
                                    checked={this.props.language.abbr === lang}
                                    onChange={() => this.props.onLanguageChange(lang)} />
                                <label htmlFor={"language_" + lang}>{lang}</label>
                            </div>)
                        })}
                    </li>
                </ul>
            );
            return (<div className={"button-like"}>{lang.settingsButton}{settingsMenu}</div>);
        }
        const createSamplesButton = () => {
            const samplesMenu = (
            <ul className="list-menu">
                {lang.samplesMenuTitle}
                {getSamples().map((sample, i) => {
                    return (
                        <li key={i}>
                            <button onClick={() => this.props.onLoadSample(sample.project)}>{sample.name}</button>
                        </li>
                    );
                })}
            </ul>
            );
            return (<div className={"button-like"} >{lang.samplesButton}{samplesMenu}</div>);
        }
        const createAboutButton = () => {
            return (
                <a  href="https://github.com/kotliluk/rachel"
                    target="_blank"
                    rel="noreferrer"
                    className={"button-like"}
                >{lang.aboutButton}</a>
            );
        }

        return (
            <header className="management-section">
                <h1>RACHEL</h1>
                {createLoadProjectButton()}
                {createSaveProjectButton()}
                {createSamplesButton()}
                {createSettingsButton()}
                {createBatchButton()}
                {createAboutButton()}
            </header>
        );
    }
}