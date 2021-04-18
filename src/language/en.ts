import {LanguageDef} from "./language";
import {CodeErrorMessages} from "../error/codeError";
import {SemanticErrorMessages} from "../error/raSemanticError";
import {SyntaxErrorMessages} from "../error/raSyntaxError";

/**
 * English messages for CodeErrors mapped by their error codes.
 */
const codeErrors: CodeErrorMessages = {
    resultSection_nodeIndexNotFound:
        ["ResultSection.getCurrentRelation: Selected node index in evaluation tree not found."],
    resultSection_evalError:
        ["ResultSection.getCurrentRelation: Evaluation error in result section: ", /* error */ "."],
    resultSection_nullRelationToSave:
        ["ResultSection.saveResultRelation: Result relation is null when tried to save it."],
    resultSection_nullRelationToAdd:
        ["ResultSection.handleAddRelation: Result relation is null when tried to add it."],

    row_absentColumn:
        ["Row.getOrderedValues: Column ", /* column */ " is absent in row with columns: ", /* column */ "."],

    valueParser_unexpectedToken:
        ["ValueParser.rpnToVETreeRecursive: Unexpected token: ", /* token */ "."],

    exprParser_unexpectedToken:
        ["ExprParser.isValidSequence: Unexpected token: ", /* token */ "."],
    exprParser_thetaJoinBranchError:
        ["ExprParser.parseTokensForWhisper: Error in theta join branch: ", /* error */ "."],
    exprParser_projectionBranchError:
        ["ExprParser.parseTokensForWhisper: Error in projection branch: ", /* error */ "."]
};

/**
 * English messages for RASemanticErrors mapped by their error codes.
 */
const semanticErrors: SemanticErrorMessages = {
    exprParser_relationNotDefined: ["Relation \"", /* relation */ "\" is not defined. Check relations definitions."],

    binaryNode_commonColumns: ["Source relations for ", /* operator */ " have common columns \"", /* columns */ "\"."],
    setOperationNode_notEqualColumns:
        ["Source relations \"", /* left */ "\" and \"", /* right */ "\" for set ", /* operation */ " do not have the same column sets."],
    divisionNode_rightColumnsNotSubset:
        ["Right source relation schema \"", /* schema */ "\" is not a subset of the left source relation schema \"", /* schema */ "\"."],
    divisionNode_rightColumnsNotProperSubset:
        ["Right source relation schema \"", /* schema */ "\" is not a proper subset of the left source relation schema \"",
        /* schema */ ". There must exist a column in the left relation which is not present in the right relation."],
    renameNode_absentOriginalColumn: ["Invalid rename, column \"", /* column */ "\" does not exist in the source relation."],
    renameNode_changeToDuplicit: ["Invalid rename, new column name \"", /* column */ "\" is duplicit in the changed relation."],
    projectionNode_absentColumn: ["Invalid projection of the column \"", /* column */ "\". It does not exist in the source relation."],

    referenceValue_absentColumn: ["Column \"", /* column */ "\" is absent in a schema with columns: ", /* columns */ "."]
};

/**
 * English messages for RASyntaxErrors mapped by their error codes.
 */
const syntaxErrors: SyntaxErrorMessages = {
    exprParser_emptyStringGiven: ["Cannot parse an expression from an empty string."],
    exprParser_outerJoinWhenNullNotSupported: ["Found ", /* outer join */ " when null values are not supported."],
    exprParser_unexpectedPart: ["Unexpected part \"", /* part */ "\" in RA expression."],
    exprParser_bothBranchesError: ["All combinations throw error in \"", /* part */ "\". When treated as projection:\n",
        /* error */ "\nWhen treated as theta join:\n", /* error */ ""],
    exprParser_invalidExpression: ["Given string is not a valid expression."],
    exprParser_invalidParentheses: ["Invalid structure of parentheses in the expression."],
    exprParser_invalidStart: ["RA expression cannot start with ", /* start */ "."],
    exprParser_invalidEnd: ["RA expression cannot end with ", /* end */ "."],
    exprParser_relationAfterRelation: ["Relation \"", /* relation */ "\" after relation \"", /* relation */"\"."],
    exprParser_relationAfterUnary: ["Relation \"", /* relation */ "\" after unary operator \"", /* unary */ "\"."],
    exprParser_relationAfterClosing: ["Relation \"", /* relation */ "\" after closing parenthesis."],
    exprParser_unaryAfterBinary: ["Unary operator \"", /* unary */ "\" after binary operator \"", /* binary */ "\"."],
    exprParser_unaryAfterOpening: ["Unary operator \"", /* unary */ "\" after opening parenthesis."],
    exprParser_binaryAfterBinary: ["Binary operator \"", /* unary */ "\" after binary operator \"", /* binary */ "\"."],
    exprParser_binaryAfterOpening: ["Binary operator \"", /* binary */ "\" after opening parenthesis."],
    exprParser_openingAfterRelation: ["Opening parentheses after relation \"", /* relation */ "\"."],
    exprParser_openingAfterUnary: ["Opening parentheses after unary operator \"", /* unary */ "\"."],
    exprParser_openingAfterClosing: ["Opening parentheses after closing parentheses."],
    exprParser_closingAfterBinary: ["Closing parentheses after binary operator \"", /* binary */ "\"."],
    exprParser_closingAfterOpening: ["Closing parentheses after opening parentheses."],

    valueParser_emptyInput: ["An empty string given as a condition."],
    valueParser_unsupportedNull: ["Null constant used when null values are not supported."],
    valueParser_unexpectedPart: ["Unexpected part \"", /* part */ "\" in expression."],
    valueParser_missingOpeningParenthesis: ["Missing opening parenthesis '(' in an expression."],
    valueParser_missingClosingParenthesis: ["Missing closing parenthesis ')' in an expression."],
    valueParser_invalidExpression: ["Given string is not a valid expression."],
    valueParser_invalidStart: ["Expression cannot start with \"", /* start */ "\"."],
    valueParser_invalidEnd: ["Expression cannot end with \"", /* end */ "\"."],
    valueParser_literalAfterLiteral: ["Literal \"", /* literal */ "\" after literal \"", /* literal */ "\"."],
    valueParser_literalAfterReference: ["Literal \"", /* literal */ "\" after reference to column \"", /* column */ "\"."],
    valueParser_literalAfterClosing: ["Literal \"", /* literal */ "\" after closing parentheses."],
    valueParser_referenceAfterLiteral: ["Reference to column \"", /* column */ "\" after literal \"", /* literal */ "\"."],
    valueParser_referenceAfterReference: ["Reference to column \"", /* column */ "\" after reference to column \"", /* column */ "\"."],
    valueParser_referenceAfterClosing: ["Reference to column \"", /* column */ "\" after closing parentheses."],
    valueParser_notAfterLiteral: ["Logical not operator \"", /* not */ "\" after literal \"", /* literal */ "\"."],
    valueParser_notAfterReference: ["Logical not operator \"", /* not */ "\" after reference to column \"", /* column */ "\"."],
    valueParser_notAfterClosing: ["Logical not operator \"", /* not */ "\" after closing parentheses."],
    valueParser_binaryAfterOperator: ["Binary operator \"", /* binary */ "\" after binary operator \"", /* binary */ "\"."],
    valueParser_binaryAfterOpening: ["Binary operator \"", /* binary */ "\" after opening parentheses."],
    valueParser_openingAfterLiteral: ["Opening parentheses after literal \"", /* literal */ "\"."],
    valueParser_openingAfterReference: ["Opening parentheses after reference to column \"", /* column */ "\"."],
    valueParser_openingAfterClosing: ["Opening parentheses after closing parentheses."],
    valueParser_closingAfterOperator: ["Closing parentheses after binary operator \"", /* binary */ "\"."],
    valueParser_closingAfterOpening: ["Closing parentheses after opening parentheses."],

    stringUtils_missingClosingChar: ["Missing '", /* opening char */ "' after opening '", /* closing char */ "'."],
    stringUtils_charNotFound: ["Expected \"", /* char */ "\" not found."],

    renameNode_missingArrow: ["Invalid rename, use \"OldName -> NewName\" format separated by commas."],
    renameNode_invalidNewName: ["Invalid rename to \"", /* name */
        "\". New column name must contain letters, numbers and underscores only and start with a letter or an underscore."],
    renameNode_keywordNewName: ["Invalid rename to \"", /* name */ "\". New column name cannot be a keyword."],
    renameNode_multipleRenameOfTheColumn: ["Multiple rename of column \"", /* name */ "\"."],

    selectionNode_resultNotBoolean: ["Result of the selection condition ", /* condition */ " is not a boolean value, but ", /* type */ "."],
    thetaJoinNode_resultNotBoolean: ["Result of the theta join condition ", /* condition */ " is not a boolean value, but ", /* type */ "."],

    comparingOperator_differentInputTypes: ["Inputs for \"", /* operator */ "\"  have different types ", /* type */ " and ", /* type */ "."],
    computingOperator_inputTypesNotNumbers: ["Inputs for \"", /* operator */ "\" are not both numbers, they are ", /* type */ " and ", /* type */ "."],
    logicalOperator_leftInputNotBoolean: ["Left input value for \"", /* operator */ "\" is not a boolean, but ", /* type */ "."],
    logicalOperator_rightInputNotBoolean: ["Right input value for \"", /* operator */ "\" is not a boolean, but ", /* type */ "."]
};

export const EN: LanguageDef = {
    abbr: "EN",

    relationErrors: {
        emptyColumn: "Column name cannot be empty",
        duplicitColumn: "Duplicit column name",
        keywordColumn: "Column name cannot be a keyword",
        invalidColumn: "Invalid characters in column name",

        unsupportedNull: "Null values are not supported",
        invalidNumber: "Given string is not a number",
        invalidBoolean: "Given string is not a boolean"
    },

    codeErrors: codeErrors,

    semanticErrors: semanticErrors,
    semanticError: "Semantic error: ",

    syntaxErrors: syntaxErrors,
    syntaxError: "Syntax error: ",

    userMessages: {
        loadedRelationsTotalNo: "No relations loaded in the application at the moment.",
        loadedRelationsTotalSome: " relations loaded at the moment: ",
        loadRelationNew: "Relation loaded to application.",
        loadAllRelationsNew: [/* number of loaded */ " relations loaded to application, ", /* number of skipped */ " skipped for errors."],
        deleteLoadedRelations: " relations deleted.",

        relationsExportOK: "Relations saved.",
        relationsExportErr: "Relations saving failed: ",
        relationsImport: [/* number of loaded */ " relations loaded, ", /* number of skipped */ " files skipped."],

        expressionsExportOK: "Expressions saved.",
        expressionsExportErr: "Expressions saving failed: ",
        expressionsImport: [/* number of expressions */ " expressions loaded from ", /* number of files */ " files (",
        /* number of skipped expressions */ " expressions skipped, ", /* number of skipped files */ " files skipped)."]
    },

    operations: {
        selection: "Selection",
        projection: "Projection",
        rename: "Rename",
        union: "Union",
        intersection: "Intersection",
        difference: "Difference",
        naturalJoin: "Natural join",
        cartesianProduct: "Cartesian product",
        leftSemiJoin: "Left semijoin",
        rightSemiJoin: "Right semijoin",
        leftAntijoin: "Left antijoin",
        rightAntijoin: "Right antijoin",
        thetaJoin: "Theta join",
        leftThetaSemiJoin: "Left theta semijoin",
        rightThetaSemiJoin: "Right theta semijoin",
        fullOuterJoin: "Full outer join",
        leftOuterJoin: "Left outer join",
        rightOuterJoin: "Right outer join",
        division: "Division"
    },

    managementSection: {
        batchButton: "Batch",
        loadButton: "Load",
        saveButton: "Save",
        samplesButton: "Samples",
        samplesMenuTitle: "Prepared sample projects",
        settingsButton: "Settings",
        settingsNullValues: "Null values",
        settingsNullValuesAllowed: "allowed",
        settingsNullValuesForbidden: "forbidden",
        settingsCSVSeparator: "CSV separator",
        settingsCSVSeparatorSemicolon: "semicolon",
        settingsCSVSeparatorComma: "comma",
        settingsTheme: "Theme",
        settingsThemeLight: "light",
        settingsThemeDark: "dark",
        settingsLanguage: "Language",
        aboutButton: "About"
    },

    relationSection: {
        relationSectionHeader: "Relations",
        loadAllButton: "Load all",
        loadAllButtonTooltip: "Loads all valid relation into the application",
        removeLoadedButton: "Remove loaded",
        removeLoadedButtonTooltip: "Removes all loaded relations",
        importButton: "Import",
        importButtonTooltip: "Adds new relations from files",
        exportButton: "Export",
        exportButtonTooltip: "Saves stored relations to files",
        loadButton: "Load",
        loadButtonTooltip: "Loads the relation into the application",
        renameButton: "Rename",
        deleteButton: "Delete",
        deleteButtonTooltip: "Deletes the relation",
        revertButton: "Revert",
        revertButtonTooltip: "Reverts to last loaded state"
    },

    expressionSection: {
        expressionSectionHeader: "Expressions",

        importButton: "Import",
        importButtonTooltip: "Adds new expressions from a file",
        exportButton: "Export",
        exportButtonTooltip: "Saves expressions to a file",

        evaluateButton: "Evaluate",
        evaluateButtonTooltip: "Evaluates selected RA expression",
        renameButton: "Rename",
        deleteButton: "Delete",
        deleteButtonTooltip: "Deletes selected RA expression",

        expressionTextareaPlaceholder: "Write RA expression here...",

        comment: "Comment"
    },

    resultSection: {
        resultSectionHeader: "Result",

        exportEvalTreeButton: "Export",
        exportEvalTreeButtonTooltip: "Saves the evaluation tree as a picture",
        evalTreeTitle: "Evaluation tree of",

        resultRelationTitle: "Result relation",
        intermediateRelationTitle: "Intermediate relation",
        addButton: "Add",
        addButtonTooltip: "Adds the given relation to stored ones",
        exportRelationButton: "Export",
        exportRelationButtonTooltip: "Saves the given relation to a file",
    }
}