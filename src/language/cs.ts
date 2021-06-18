import {LanguageDef} from "./language";
import {EN} from "./en";
import {SyntaxErrorMessages} from "../error/raSyntaxError";
import {SemanticErrorMessages} from "../error/raSemanticError";

/**
 * Czech messages for RASemanticErrors mapped by their error codes.
 */
const semanticErrors: SemanticErrorMessages = {
    exprParser_relationNotDefined: ["Relace \"", "\" není definována. Zkontrolujte definice relací."],

    binaryNode_commonColumns: ["Vstupní relace pro ", " mají společné sloupce \"", "\"."],
    setOperationNode_notEqualColumns: ["Vstupní relace \"", "\" a \"", "\" pro ", " množin nemají stejné schéma."],
    divisionNode_rightColumnsNotSubset:
        ["Schéma pravé vstupní relace \"", "\" není podmnožinou schématu levé vstupní relace \"", "\"."],
    divisionNode_rightColumnsNotProperSubset:
        ["Schéma pravé vstupní relace \"", "\" není vlastní podmnožinou schématu levé vstupní relace \"",
        ". V levé relaci musí existovat sloupec, který neexistuje v pravé relaci."],
    renameNode_absentOriginalColumn: ["Nepovolené přejmenování, sloupec \"", "\" neexistuje ve vstupní relaci."],
    renameNode_changeToDuplicit: ["Nepovolené přejmenování, nový název sloupce \"", "\" je duplicitní ve změněné relaci."],
    projectionNode_absentColumn: ["Nepovolená projekce sloupce \"", "\". Tento sloupec neexistuje ve vstupní relaci."],
    projectionNode_emptyProjection: ["Nepovolená projekce, vždy musí být zachován alespoň jeden sloupec."],

    referenceValue_absentColumn: ["Sloupec \"", "\" neexistuje ve schématu se sloupci ", "."]
};

/**
 * Czech messages for RASyntaxErrors mapped by their error codes.
 */
const syntaxErrors: SyntaxErrorMessages = {
    exprParser_emptyStringGiven: ["Výraz nelze parsovat z prázdného řetězce."],
    exprParser_outerJoinWhenNullNotSupported: ["Nalezeno ", ", přestože null hodnoty jsou zakázány."],
    exprParser_unexpectedPart: ["Nečekaná část \"", "\" v RA výrazu."],
    exprParser_bothBranchesError: ["Všechny kombinace způsobují chybu v \"", "\". Považováno za projekci:\n",
        "\nPovažováno za theta spojení:\n", ""],
    exprParser_invalidExpression: ["Daný výraz není korektní výraz relační algebry."],
    exprParser_invalidParentheses: ["Chybné uzávorkování ve výrazu."],
    exprParser_invalidStart: ["RA výraz nemůže začínat na ", "."],
    exprParser_invalidEnd: ["RA výraz nemůže končit na ", "."],
    exprParser_relationAfterRelation: ["Relace \"", "\" po relaci \"", "\"."],
    exprParser_relationAfterUnary: ["Relace \"", "\" po unárním operátoru \"", "\"."],
    exprParser_relationAfterClosing: ["Relace \"", "\" po uzavírací závorce."],
    exprParser_unaryAfterBinary: ["Unární operátor \"", "\" po binárním operátoru \"", "\"."],
    exprParser_unaryAfterOpening: ["Unární operátor \"", "\" po otevírací závorce."],
    exprParser_binaryAfterBinary: ["Binární operátor \"", "\" po binárním operátoru \"", "\"."],
    exprParser_binaryAfterOpening: ["Binární operátor \"", "\" po otevírací závorce."],
    exprParser_openingAfterRelation: ["Otevírací závorka po relaci \"", "\"."],
    exprParser_openingAfterUnary: ["Otevírací závorka po unárním operátoru \"", "\"."],
    exprParser_openingAfterClosing: ["Otevírací závorka po uzavírací závorce."],
    exprParser_closingAfterBinary: ["Uzavírací závorka po binárním operátoru \"", "\"."],
    exprParser_closingAfterOpening: ["Uzavírací závorka po otevírací závorce."],

    valueParser_emptyInput: ["Jako podmínka nemůže být prázdný řetězec."],
    valueParser_unsupportedNull: ["Nalezena null konstanta, přestože null hodnoty jsou zakázány."],
    valueParser_unexpectedPart: ["Nečekaná část \"", "\" ve výrazu."],
    valueParser_missingOpeningParenthesis: ["Chybějící otevírací závorka ve výrazu."],
    valueParser_missingClosingParenthesis: ["Chybějící uzavírací závorka ve výrazu."],
    valueParser_invalidExpression: ["Daný výraz není korektní."],
    valueParser_invalidStart: ["Výraz nemůže začínat na \"", "\"."],
    valueParser_invalidEnd: ["Výraz nemůže končit na \"", "\"."],
    valueParser_literalAfterLiteral: ["Konstanta \"", "\" po konstantě \"", "\"."],
    valueParser_literalAfterReference: ["Konstanta \"", "\" po referenci sloupce \"", "\"."],
    valueParser_literalAfterClosing: ["Konstanta \"", "\" po uzavírací závorce."],
    valueParser_referenceAfterLiteral: ["Reference sloupce \"", "\" po konstantě \"", "\"."],
    valueParser_referenceAfterReference: ["Reference sloupce \"", "\" po referenci sloupce \"", "\"."],
    valueParser_referenceAfterClosing: ["Reference sloupce \"", "\" po uzavírací závorce."],
    valueParser_notAfterLiteral: ["Logická negace \"", "\" po konstantě \"", "\"."],
    valueParser_notAfterReference: ["Logická negace \"", "\" po referenci sloupce \"", "\"."],
    valueParser_notAfterClosing: ["Logická negace \"", "\" po uzavírací závorce."],
    valueParser_binaryAfterOperator: ["Binární operátor \"", "\" po binárním operátoru \"", "\"."],
    valueParser_binaryAfterOpening: ["Binární operátor \"", "\" po otevírací závroce."],
    valueParser_openingAfterLiteral: ["Otevírací závorka po konstantě \"", "\"."],
    valueParser_openingAfterReference: ["Otevírací závorka po referenci sloupce \"", "\"."],
    valueParser_openingAfterClosing: ["Otevírací závorka po uzavírací závorce."],
    valueParser_closingAfterOperator: ["Uzavírací závorka po binárním operátoru \"", "\"."],
    valueParser_closingAfterOpening: ["Uzavírací závorka po otevírací závroce."],

    stringUtils_missingClosingChar: ["Chybějící '", "' po úvodní '", "'."],
    stringUtils_charNotFound: ["Očekávaný znak \"", "\" nenalezen."],

    renameNode_missingArrow: ["Chybné přejmenování, použijte formát \"StarýNázev -> NovýNázev\" oddělený čárkami."],
    renameNode_invalidNewName: ["Chybné přejmenování na \"",
        "\". Nový název sloupce musí obsahovat pouze písmena, čísla a podtržítka a začínat písmenem nebo podtržítkem."],
    renameNode_keywordNewName: ["Chybné přejmenování na \"", "\". Nový název nemůže být klíčové slovo."],
    renameNode_multipleRenameOfTheColumn: ["Vícenásobné přejmenování sloupce \"", "\"."],

    selectionNode_resultNotBoolean: ["Výsledek podmínky v selekci ", " není boolean, ale ", "."],
    thetaJoinNode_resultNotBoolean: ["Výsledek podmínky v theta joinu ", " není boolean, ale ", "."],

    comparingOperator_differentInputTypes: ["Vstupy pro \"", "\" nemají stejné typy, ale ", " a ", "."],
    computingOperator_inputTypesNotNumbers: ["Vstupy pro \"", "\" nejsou čísla, ale ", " a ", "."],
    logicalOperator_leftInputNotBoolean: ["Levý vstup logického operátoru \"", "\" není boolean, ale ", "."],
    logicalOperator_rightInputNotBoolean: ["Pravý vstup logického operátoru \"", "\" není boolean, ale ", "."],
};

export const CS: LanguageDef = {
    abbr: "CS",

    relationErrors: {
        emptyColumn: "Název sloupce nemůže být prázdný",
        duplicitColumn: "Duplicitní název sloupce",
        keywordColumn: "Název sloupce nemůže být klíčové slovo",
        invalidColumn: "Nepovolené znaky v názvu sloupce",

        unsupportedNull: "Null hodonoty nejsou podporovány",
        invalidNumber: "Daný řetězec není číslo",
        invalidBoolean: "Daný řetězec není boolean",
    },

    codeErrors: EN.codeErrors,

    semanticErrors: semanticErrors,
    semanticError: "Sémantická chyba: ",

    syntaxErrors: syntaxErrors,
    syntaxError: "Syntaktická chyba: ",

    userMessages: {
        loadedRelationsTotalNo: "Nyní nejsou v aplikaci nahrané žádné relace.",
        loadedRelationsTotalSome: " relací celkově nahráno v aplikaci: ",
        loadRelationNew: "Relace nahrána do aplikace.",
        loadAllRelationsNew: [/* number of loaded */ " relací nahráno do aplikace, ", /* number of skipped */ " přeskočeno kvůli chybám."],
        deleteLoadedRelations: " relací odebráno.",

        relationsExportOK: "Relace staženy.",
        relationsExportErr: "Stahování relací selhalo: ",
        relationsImport: [" relací nahráno, ", " souborů přeskočeno."],

        expressionsExportOK: "Výrazy staženy do souboru.",
        expressionsExportErr: "Stahování výrazů selhalo: ",
        expressionsImport: [/* number of expressions */ " výrazů nahráno z ", /* number of files */ " souborů (",
            /* number of skipped expressions */ " výrazů přeskočeno, ", /* number of skipped files */ " souborů přeskočeno)."]
    },

    operations: {
        selection: "Selekce",
        projection: "Projekce",
        rename: "Přejmenování",
        union: "Sjednocení",
        intersection: "Průnik",
        difference: "Rozdíl",
        naturalJoin: "Přirozené spojení",
        cartesianProduct: "Kartézský součin",
        leftSemiJoin: "Levé vnitřní spojení",
        rightSemiJoin: "Pravé vnitřní spojení",
        leftAntijoin: "Levý antijoin",
        rightAntijoin: "Pravý antijoin",
        thetaJoin: "Theta spojení",
        leftThetaSemiJoin: "Levé theta spojení",
        rightThetaSemiJoin: "Pravé theta spojení",
        fullOuterJoin: "Plné vnější spojení",
        leftOuterJoin: "Levé vnější spojení",
        rightOuterJoin: "Pravé vnější spojení",
        division: "Dělení"
    },

    managementSection: {
        batchTitle: "Batch",
        batchLoad: "Nahrát projekty",
        batchConfig: "Konfigurovat",
        batchConfigInfo: ["Konfigurace ", /* filename */ " s ", /* rules count */ " pravidly"],
        batchNoConfig: "Není nahrána žádná konfigurace",

        loadButton: "Nahrát",
        saveButton: "Uložit",

        samplesButton: "Ukázky",
        samplesMenuTitle: "Připravené vzorové projekty",
        settingsButton: "Nastavení",
        settingsNullValues: "Null hodnoty",
        settingsNullValuesAllowed: "povoleny",
        settingsNullValuesForbidden: "zakázány",
        settingsCSVSeparator: "CSV oddělovač",
        settingsCSVSeparatorSemicolon: "středník",
        settingsCSVSeparatorComma: "čárka",
        settingsTheme: "Režim",
        settingsThemeLight: "světlý",
        settingsThemeDark: "tmavý",
        settingsLanguage: "Jazyk",
        aboutButton: "O aplikaci"
    },

    relationSection: {
        relationSectionHeader: "Relace",
        loadAllButton: "Nahrát všechny",
        loadAllButtonTooltip: "Nahraje všechny bezchybné relace do aplikace",
        removeLoadedButton: "Odebrat nahrané",
        removeLoadedButtonTooltip: "Odebere všechny nahrané relace z aplikace",
        importButton: "Import",
        importButtonTooltip: "Nahraje nové relace ze souborů",
        exportButton: "Export",
        exportButtonTooltip: "Stáhne editované relace do souborů",
        loadButton: "Nahrát",
        loadButtonTooltip: "Nahraje relaci do aplikace",
        renameButton: "Přejmenovat",
        deleteButton: "Odstranit",
        deleteButtonTooltip: "Odstraní vybranou relaci",
        revertButton: "Obnovit",
        revertButtonTooltip: "Obnoví relaci do posledního nahraného stavu"
    },

    expressionSection: {
        expressionSectionHeader: "Výrazy",

        importButton: "Import",
        importButtonTooltip: "Nahraje nové výrazy ze souboru",
        exportButton: "Export",
        exportButtonTooltip: "Stáhne výrazy do souboru",

        evaluateButton: "Vyhodnotit",
        evaluateButtonTooltip: "Vyhodnotí vybraný relační výraz",
        renameButton: "Přejmenovat",
        deleteButton: "Odstranit",
        deleteButtonTooltip: "Odstraní vybraný relační výraz",

        expressionTextareaPlaceholder: "Zde napište svůj relační výraz...",

        lineComment: "Řádkový komentář",
        blockComment: "Blokový komentář"
    },

    resultSection: {
        resultSectionHeader: "Výsledek",

        exportEvalTreeButton: "Export",
        exportEvalTreeButtonTooltip: "Uloží evaluační strom jako obrázek",
        evalTreeTitle: "Evaluační strom pro",

        resultRelationTitle: "Výsledná relace",
        intermediateRelationTitle: "Mezivýsledná relace",
        addButton: "Přidat",
        addButtonTooltip: "Přidá zvolenou relaci mezi editované",
        exportRelationButton: "Export",
        exportRelationButtonTooltip: "Stáhne zvolenou relaci do souboru",
    }
}