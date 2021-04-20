import {LocalStorage} from "../utils/localStorage";
import {EN} from "./en";
import {CS} from "./cs";
import {CodeErrorMessages} from "../error/codeError";
import {SemanticErrorMessages} from "../error/raSemanticError";
import {SyntaxErrorMessages} from "../error/raSyntaxError";

/**
 * IF YOU WANT TO ADD A NEW LANGUAGE, READ THIS:
 *
 * Adding a language is simple, follow these steps:
 * 1) Copy the "en.ts" file in this package and name it as the lowercase new language abbreviation, e.g., "cs.ts"
 * 2) Rename the language definition object to the uppercase language abbreviation, e.g., "CS"
 * 3) Translate the messages in the new file. Some messages are split into an array - if you are not sure what to
 * write in each part, see its usage or other languages.
 * 4) Add the uppercase language abbreviation, e.g., "CS", in the allSupportedLanguages array in this file.
 * 5) Import your language definition in this file, e.g., "import {CS} from "./cs";"
 * 6) Add the imported language definition into languageMap map in this file, e.g., "["CS", CS],"
 * 7) (voluntary) Create a project sample in your language in /project/samples.ts - you can translate existing samples.
 * 8) Test whether the application works.
 */

/**
 * All languages supported in the application.
 * NOTE FOR NEW LANGUAGES: If you define a new language file "lang.ts", add "LANG" to this array.
 */
export const allSupportedLanguages = (<L extends string>(arr: L[]) => arr)(["EN", "CS"]);

/**
 * Abbreviation of supported languages in the application.
 */
export type SupportedLanguage = (typeof allSupportedLanguages)[number];

/**
 * Definition of a language for Rachel.
 * NOTE FOR NEW LANGUAGES: If you want to define a new language, it must be through this interface in a new file in
 * this package (see en.ts file as an example of English language definition).
 */
export interface LanguageDef {
    /**
     * Abbreviation of the language
     */
    abbr: SupportedLanguage,
    /**
     * Description of errors in relation definitions.
     */
    relationErrors: {
        emptyColumn: string,
        duplicitColumn: string,
        keywordColumn: string,
        invalidColumn: string,

        unsupportedNull: string,
        invalidNumber: string,
        invalidBoolean: string,
    },
    /**
     * Description of unexpected errors.
     */
    codeErrors: CodeErrorMessages,
    /**
     * Description of semantic errors in expressions.
     */
    semanticErrors: SemanticErrorMessages,
    semanticError: string,
    /**
     * Description of syntactic errors in expressions.
     */
    syntaxErrors: SyntaxErrorMessages,
    syntaxError: string,
    /**
     * Info messages for the user in pop-up message box.
     */
    userMessages: {
        loadedRelationsTotalNo: string,
        loadedRelationsTotalSome: string,
        loadRelationNew: string,
        // 2 parts expected - see English language as an example
        loadAllRelationsNew: string[],
        deleteLoadedRelations: string,

        relationsExportOK: string,
        relationsExportErr: string,
        // 2 parts expected - see English language as an example
        relationsImport: string[],

        expressionsExportOK: string,
        expressionsExportErr: string,
        // 4 parts expected - see English language as an example
        expressionsImport: string[]
    },
    /**
     * Names of RA operations.
     */
    operations: {
        selection: string,
        projection: string,
        rename: string,
        union: string,
        intersection: string,
        difference: string,
        naturalJoin: string,
        cartesianProduct: string,
        leftSemiJoin: string,
        rightSemiJoin: string,
        leftAntijoin: string,
        rightAntijoin: string,
        thetaJoin: string,
        leftThetaSemiJoin: string,
        rightThetaSemiJoin: string,
        fullOuterJoin: string,
        leftOuterJoin: string,
        rightOuterJoin: string,
        division: string
    }
    /**
     * Description of elements in management section.
     */
    managementSection: {
        batchButton: string,
        loadButton: string,
        saveButton: string,

        samplesButton: string,
        samplesMenuTitle: string,

        settingsButton: string,
        settingsNullValues: string,
        settingsNullValuesAllowed: string,
        settingsNullValuesForbidden: string,
        settingsCSVSeparator: string,
        settingsCSVSeparatorSemicolon: string,
        settingsCSVSeparatorComma: string,
        settingsTheme: string,
        settingsThemeLight: string,
        settingsThemeDark: string,
        settingsLanguage: string,

        aboutButton: string
    },
    /**
     * Description of elements in relation section.
     */
    relationSection: {
        relationSectionHeader: string,

        loadAllButton: string,
        loadAllButtonTooltip: string,
        removeLoadedButton: string,
        removeLoadedButtonTooltip: string,
        importButton: string,
        importButtonTooltip: string,
        exportButton: string,
        exportButtonTooltip: string,

        loadButton: string,
        loadButtonTooltip: string,
        renameButton: string,
        deleteButton: string,
        deleteButtonTooltip: string,
        revertButton: string,
        revertButtonTooltip: string
    },
    /**
     * Description of elements in expression section.
     */
    expressionSection: {
        expressionSectionHeader: string,

        importButton: string,
        importButtonTooltip: string,
        exportButton: string,
        exportButtonTooltip: string,

        evaluateButton: string,
        evaluateButtonTooltip: string,
        renameButton: string,
        deleteButton: string,
        deleteButtonTooltip: string,

        expressionTextareaPlaceholder: string,

        lineComment: string,
        blockComment: string
    }
    /**
     * Description of elements in result section.
     */
    resultSection: {
        resultSectionHeader: string,

        exportEvalTreeButton: string,
        exportEvalTreeButtonTooltip: string,
        evalTreeTitle: string,

        resultRelationTitle: string,
        intermediateRelationTitle: string,
        addButton: string,
        addButtonTooltip: string,
        exportRelationButton: string,
        exportRelationButtonTooltip: string,
    }
}

/**
 * Map of supported languages to their definition.
 * NOTE FOR NEW LANGUAGES: If you define a new language, add its definition mapping here.
 */
const languageMap: Map<SupportedLanguage, LanguageDef> = new Map<SupportedLanguage, LanguageDef>([
    ["EN", EN],
    ["CS", CS],
]);

/**
 * Returns true if the given value is a supported language.
 */
export function isSupportedLanguage(x: any): boolean {
    return allSupportedLanguages.includes(x);
}

/**
 * Returns definition of the current select language.
 */
export function language(): LanguageDef {
    const lang = languageMap.get(LocalStorage.getLanguage());
    if (lang === undefined) {
        return EN;
    }
    return lang;
}