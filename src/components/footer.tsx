import React from "react";
import {SupportedLanguage} from "../tools/supportedLanguage";
import "./css/footer.css"

interface FooterProps {
    // language of the application
    language: SupportedLanguage,
    // true if dark theme should be applied
    darkTheme: boolean
}

interface FooterState {

}

/**
 * Footer of the page with contact links.
 */
export class Footer extends React.Component<FooterProps, FooterState> {

    render() {
        const modeStr: string = this.props.darkTheme ? "-dark" : "-light";
        return (
            <footer className={"page-footer page-footer" + modeStr}>
                <hr className={"footer-hr" + modeStr}/>
                <ul className="footer-list">
                    <li>
                        <a href="mailto:kotliluk@fel.cvut.cz">Contact author</a>
                    </li>
                    <li>
                        <a href="https://github.com/kotliluk/rachel" target="_blank" rel="noreferrer">About</a>
                    </li>
                </ul>
            </footer>
        );
    }
}