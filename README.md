# Rachel

## About

Rachel is an evaluator and syntax checker for relational algebra (RA). It provides both
data definition and expression evaluation. It uses simplified RA notation
and is implemented for evaluation over small data sets for teaching purposes.
Rachel has strong, explicit error descriptions that help better RA understanding.

The application was implemented by Lukáš Kotlík as a bachelor thesis on [Faculty of
Electrical Engineering, Czech Technical University](https://fel.cvut.cz/en/).

## Usage

The application has two main parts: the relation definition section and the expression evaluation
section. When we evaluate the expression, the result section is displayed as well.
On top of the page, we can manage settings or project import/export.

The usual workflow is:
- (data import)
- definition of relations
- evaluation of expressions
- update of relations and expressions
- (data export)

### Relation section

We define relations for the application in a table in the upper part of the screen.
To use a relation in the expressions, we need to load it to the application
when in a valid state. After loading, we can continue editing the relation while 
the last loaded (valid) state is still available for the expressions.

There are four buttons in the header menu, which affect all relations:
- The **Load all** button loads all valid relations into the application memory.
If any loaded relation with the same name exists, it is overwritten. Invalid relations are skipped.
- The **Remove loaded** button removes all loaded relations (editable relations are not changed).
- The **Import** button enables us to import new editable relations from CSV files.
- The **Export** button saves all editable relations in CSV files. The saved relations can be
in an invalid state.

In the menu above the table, we can select from editable relations the currently edited one.
A star (\*) before the relation name shows changed relations since the last loading.
We can add a new relation by the **+** button.

In the first row of the table, we define the column names and types. Column names cannot be
duplicated inside one relation and must contain letters, numbers, and underscores only and not
start with a number. Also, column names "null", "true" and "false" are forbidden.
There are three supported column types in Rachel: number, string, and boolean.

The **+** buttons in the last column and last row adds a new column or row, respectively.

Other table inputs define the data itself. Numbers can be integers or decimals. Boolean values can be
true or false. String values can be any character sequence. Note that margin whitespaces are trimmed
before loading to application, so the string " a b c " is loaded as "a b c".
If null values are supported, "null" and empty inputs are valid in all column types and are loaded as null values.

When the mouse is over the first row or the first column, a button for deleting a column or a row, respectively, appears.

There are four buttons in the menu under the table, which affect the selected relation:
- The **Load** button loads the relation into the application memory. If any loaded
relation with the same name exists, it is overwritten. 
- The **Rename** text field renames the relation. We cannot change the name to any
existing editable relation name. Allowed characters are the same as
in the column names, but the forbidden words are "F", "L", and "R".
- The **Delete** button deletes the relation.
- The **Revert** button reverts the relation to the last saved state - the state is saved after
creation (adding or importing a new one) or after loading it.

### Expression section

The **Import** button enables us to load new expressions from textual files. The **Export** button saves all expressions in a textual file.

We can have multiple named expressions loaded in the application at the time. Again, we use the upper
menu for choosing the currently edited expression, and the **+** button for adding a new one.

In the text area, we define the expression itself. We can use buttons to insert RA operators. While
typing, Rachel suggests available relation or column names on the cursor position. You can use
arrows + Enter/Tab or mouse to insert the suggestion. Ctrl+Space hides or displays the suggestions menu.

There is a list of buttons under the table, which insert relational algebra operators.

To use quote '"' characters inside string literals in expressions, you must escape their default behavior
(i.e., starting or ending a string) by a backslash as '\\"'. Similarly, to use a backslash character,
you must type it twice '\\\\'.

There are three buttons on the bottom of the section, which affect the selected expression:
- The **Evaluate** button evaluates the edited expression and updates the result section.
- The **Rename** text field renames the edited expression. There are no restrictions on expression
names.
- The **Delete** button deletes the edited expression.

### Result section

The result section appears after an evaluation of an expression. It displays the evaluation tree
and the result relation. We can choose to display a relation from different tree nodes. We can sort the rows
in a relation using the specific column values. The **Export** button above the
evaluation tree downloads the tree as a png picture.

We can use the **Add** and **Export** buttons above the table to add the displayed relation
to edited ones or to save it in a CSV file.

### Management section

The last-mentioned section is the upper one.

We can **Load** or **Save** the whole project using .rachel files. The saved file contains all
editable relations, all expressions, and selected null values support.

We can load prepared sample projects by the **Samples** button. It can be a great start before
you define your relations and expressions.

In the **Settings**, we can set:

- Null values support - allowed/forbidden - it determinates whether the application supports
null values in relations and expressions
- CSV separator - semicolon/comma - used value separator in downloaded CSV files
- Theme - light/dark - the theme of the application
- Language - the language of the application

The **About** button navigates to the application GitHub repository.

### Tips

You can use C-style line (rest of the line after '//') or block (all between '/\*' and '\*/') comments in expressions.

You can use Ctrl+Enter in the relation table to load the current relation.
In the expression textarea, you can use Ctrl+Enter to evaluate the current expression.

All tabulators loaded into the application in files are replaced by four spaces. In case you are editing
the files outside Rachel, we recommend using spaces to ensure expected indenting. Also, do not
insert text with tabulators by Ctrl+V.

In formal Relational algebra, all conditions must contain comparison (==, >, <, ...). In Rachel, we can use boolean
values can directly (e.g., "BooleanColumn" not "BooleanColumn == true"). Anyway, we recommend
using the full comparison in theta joins to receive expected suggestions behavior.

You can use drag-and-drop to move relations and expressions in their menus.

## Relational algebra

### Notation

Rachel uses simplified RA notation (not scientific). It is easier to write and more readable.

Example - projection of columns Name and Address of a relation Human:
- simplified notation: Human\[Name, Address\]
- scientific notation: π<sub>Name, Address</sub>(Human)

### Null values

In strict original relational algebra, null values are not allowed. Newer versions support null values
for compatibility with SQL. To provide both possibilities in Rachel, the user can set
null values support in the settings.

### RA operators

Rachel provides a wide set of relational algebra operators. In the following list,
we show their syntax and precedence (lower numbers mean higher precedence).
Anyway, we recommend using parentheses to avoid unexpected precedence behavior.

Unary:
- **projection** of columns (precedence 1): Relation\[column, ...\]
- **selection** of rows (precedence 1): Relation(condition)
- **rename** of columns (precedence 1): Relation<OldName -> NewName, ...>

Binary:
- **natural join** (precedence 2): A*B
- **cartesian product** (precedence 2): A⨯B
- **theta join** (precedence 2): A\[condition\]B
- **left/right semijoin** (precedence 2): A<\*B, A\*>B
- **left/right antijoin** (precedence 2): A⊳B, A⊲B
- **left/right theta join** (precedence 2): A<condition\]B, A\[condition>B
- **full/left/right outer join** (precedence 2): A\*F\*B, A\*L\*B, A\*R\*B
- **division** (precedence 2): A÷B

Set operations:
- **intersection** (precedence 3): A∩B
- **union** (precedence 4): A∪B
- **difference** (precedence 4): A\B

### Algebraic and logical operators

**Algebraic operators** in the conditions:

These operators expect number literal or number column inputs. If the
number column evaluates to null, null is returned. When string, boolean, or
null constant is given, an error is triggered.

- addition: 1 + 5.2, 3.2 + NumberColumn, ...
- subtraction: 1 - 5.2, 3.2 - NumberColumn, ...
- multiplication: 1 \* 5.2, 3.2 \* NumberColumn, ...
- division: 1 / 5.2, 3.2 / NumberColumn, ...

**Testing operators** in the conditions:

These operators accept any input pair of the same type. Inequality checking
of booleans uses false < true. Inequality checking of strings uses alphabetic
comparison ("abc" < "def", "a" < "aa"). If a column is evaluated to null, the only
possible condition to return true is "column == null". When the inputs have
different types, an error is triggered.

- equal (= or ==): 1 = 5.2, StringColumn = "abcd", ...
- non-equal (!= or <>): 1 != 5.2, StringColumn != "abcd", ...
- greater than (>): 1 > 5.2, StringColumn > "abcd", ...
- smaller than (<): 1 < 5.2, StringColumn < "abcd", ...
- greater or equal (>=): 1 >= 5.2, StringColumn >= "abcd", ...
- smaller or equal (<=): 1 <= 5.2, StringColumn <= "abcd", ...

**Logical operators** in the conditions:

These operators accept boolean values. When a boolean column evaluates to null,
it holds "!column == false", "column && boolean == false",
"column || boolean == boolean". When number, string, or
null constant is given, an error is triggered.

- negation (! or ~ or ¬): !boolean, ...
- and (&& or & or ∧): boolean && boolean, ...
- or (|| or | or ∨): boolean || boolean, ...

## Known issues

The application does not support the Internet Explorer browser. We decided not to support it as
Microsoft recommends using the newer browsers and announced the end of its support as well.

## Language contribution

If you want to extend Rachel by a new language, feel free to define it by the steps
described in the /src/language/language.ts file.

## Implementation details

Rachel is implemented in [TypeScript](https://www.typescriptlang.org/)
(a [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) typed superset) using
[React](https://github.com/facebook/react) framework and
[create-react-app](https://github.com/facebook/create-react-app) for set up configuration.

The application uses many great libraries (available on [npm](https://www.npmjs.com/)):
- [JSZIP](https://github.com/Stuk/jszip) - Create, read and edit .zip files with Javascript
- [visx](https://github.com/airbnb/visx) - Visualization components
- [export-svg-with-styles](https://www.npmjs.com/package/export-svg-with-styles) - Turn your SVGs to PNGs
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) - An HTML5 saveAs() FileSaver implementation
- [Lodash](https://github.com/lodash/lodash) - A modern JavaScript utility library delivering modularity, performance, & extras
- [Jest](https://github.com/facebook/jest) - Delightful JavaScript Testing
- [PostMail](https://postmail.invotes.com/) - Send email from JavaScript or static HTML without backend code

## License

Rachel is licensed under [MIT License](./LICENSE)
