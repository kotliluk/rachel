# Rachel

Rachel is an evaluator and syntax checker for relational algebra (RA). It provides both
data definition and expression evaluation. It uses simplified RA notation
and is implemented for evaluation over small data sets for teaching purposes.
Rachel has strong, explicit error description which helps better RA understanding.

The application was implemented by Lukáš Kotlík as a bachelor thesis on Faculty of
Electrical Engineering, Czech Technical University.

## Usage

The application has two main parts: relation definition section and expression evaluation
section. When the expression is evaluated, the result section is displayed as well.
On top of the page, we can manage settings or project import/export.

The common work flow is:
- (data import)
- definition of relations
- evaluation of expressions
- update of relations and expressions
- (data export)

### Relation section

We define relations for the application in a table in upper part of the screen.
To use a relation in the expressions, we need to load it to application. The relation must be
in a valid state to be loaded. After loading, we can continue editing the relation while 
the last loaded (valid) state is still available for the expressions.

There are 4 buttons in the header menu, which affect all relations:
- The **Load all** button loads all valid relations into the application memory.
If any loaded relation with the same name exists, it is overwritten. Invalid relations are skipped.
- The **Delete loaded** button deletes all loaded relations (editable relations are not changed).
- The **Import** button enables us to import new editable relations from CSV files.
- The **Export** button saves all editable relations in CSV files. The saved relations can be
in invalid state.

In the menu above the table, we can choose from editable relations the current edited one.
A star (*) before the relation name shows changed relations since last load.
We can add a new relation by the "+" button.

In the first row of the table, we define the column names and types. Column names cannot be
duplicit inside one relation and must contain letters, numbers and underscores only and not
start with a number. Also, column names "null", "true" and "false" are forbidden.
There are 3 supported column types in Rachel: number, string, and boolean.

Buttons in last column and last row adds a new column or row, respectively.

Other table inputs define data itself. Numbers can be integers or decimals.
String values must be enclosed in quotes ("). To use quote character inside a string, it must be
escaped by a backslash (\\). If null values are supported, null keywords or empty inputs are
valid in all column types.

When the first or second row is right-clicked, the clicked column can be deleted. Right-click
in other rows can be used to delete the clicked row.

There are 3 buttons in the menu under the table, which affect the selected relation:
- **Rename** text field renames the relation. The name cannot be changed to any
existing editable relation name. Allowed characters are the same as
in the column names, but the forbidden words are "F", "L", and "R".
- The **Load** button loads the relation into the application memory. If any loaded
relation with the same name exists, it is overwritten. 
- The **Delete** button deletes the relation.
- The **Revert** button changes the editable relation to the state of a loaded relation with
the same name as the name of the editable relation was at its last loading time.

### Expression section

We can have multiple named expressions loaded in the application at the time. Again, we use the upper
menu for choosing the current edited one.

In the text area, we define the expression itself. We can use buttons to insert RA operators.

Rename text field renames the edited expression. There are no restrictions on expression names.

The Evaluate button evaluates the edited expression and updates the result section.

The **New** button adds a new expression.

The **Delete** button deletes the edited expression.

The **Import** button enables us to load new expressions from textual files.

The **Export** button saves all expressions in a textual file.

### Result section

The result section appears after an evaluation of an expression. It displays the evaluation tree
and the result relation. We can choose to display a relation from a different tree node. The rows
in the relation can be sorted by the specific column.

We can assign a name to the displayed relation and add it to stored ones or save it in a CSV file.

### Management section

The last mentioned section is the upper one.

In the Project tab, we can import or export the whole project by JSON files. The exported file
contains all stored relations, all expressions and selected null values support.

In the Settings tab, we can set:

- Null values support - allowed/forbidden - it determinates whether the application supports
null values in relations and expressions
- CSV separator - semicolon/comma - used value separator in downloaded CSV files
- Theme - light/dark - theme of the application

The About button navigates to the application GitHub.

### Shortcuts

In the relation section, we can use:
- Ctrl+Enter = load the edited relation
- Ctrl+Shift+A = add new relation
- Ctrl+Shift+D = delete the edited expression
- Ctrl+Arrows = navigation in the edit table

In the expression section, we can use:
- Ctrl+Enter = evaluate the edited expression
- Ctrl+Shift+A = add new expression
- Ctrl+Shift+D = delete the edited expression

### Tips

You can use standard C-style one-line comments in expressions (rest of the line after //).

All tabulators in the application are replaced by 4 spaces. In case you are editing the files outside
Rachel, we commend to use spaces as well to ensure expected indenting.

## Relational algebra

### Notation

Rachel uses simplified RA notation (not scientific). It is easier to write and more readable.

Example - projection of columns Name and Address of a relation Human:
- simplified notation: Human\[Name, Address\]
- scientific notation: pi<sub>Name, Address</sub>(Human)

### Null values

In strict original relational algebra, null values are not allowed. In newer versions, null values
are supported for compatibility with SQL. To provide both possibilities, in Rachel the user can set
null values support in the settings.

### RA operators

Rachel provides wide set of relational algebra operators. The RA operators do not have
standardized precedence, our chosen precedence values are displayed
below (lower numbers mean higher precedence) and in the application.
Anyway, we recommend to use parentheses to avoid unexpected precedence behavior.

Unary:
- **projection** of columns (precedence 1): Relation\[column, ...\]
- **selection** of rows (precedence 1): Relation(condition)
- **rename** of columns (precedence 1): Relation<OldName -> NewName, ...>

Binary:
- **natural join** (precedence 2): A*B
- **cartesian product** (precedence 2): A⨯B
- **theta join** (precedence 2): A\[condition\]B
- **left/right semijoin** (precedence 3): A<\*B, A\*>B
- **left/right antijoin** (precedence 3): A⊳B, A⊲B
- **left/right theta join** (precedence 3): A<condition\]B, A\[condition>B
- **full/left/right outer join** (precedence 4): A\*F\*B, A\*L\*B, A\*R\*B
- **division** (precedence 5): A÷B

Set operations:
- **union** (precedence 6): A∩B
- **difference** (precedence 7): A\B
- **intersection** (precedence 8): A∪B

### Algebraic and logical operators

**Algebraic operators** in the conditions:

These operators expect number literals or number columns as the input. If the
number column evaluates to null, null is returned. When string, boolean, or
null constant is given, an error is triggered.

- addition: 1 + 5.2, 3.2 + NumberColumn, ...
- subtraction: 1 - 5.2, 3.2 - NumberColumn, ...
- multiplication: 1 \* 5.2, 3.2 \* NumberColumn, ...
- division: 1 / 5.2, 3.2 / NumberColumn, ...

**Testing operators** in the conditions:

These operators except any input pair of the same type. Inequality checking
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

These operators except boolean values. When a boolean column evaluates to null,
it holds "!column == false", "column && boolean == false",
"column || boolean == boolean". When number, string, or
null constant is given, an error is triggered.

- negation (! or ~ or U+00AC): !boolean, ...
- and (&& or & or U+2227): boolean && boolean, ...
- or (|| or | or U+2228): boolean || boolean, ...

## Implementation details