# Rachel

## About

Rachel is an evaluator and syntax checker for relational algebra (RA). It provides both
data definition and expression evaluation. It uses simplified RA notation
and is implemented for evaluation over small data sets for teaching purposes.
Rachel has strong, explicit error descriptions that help better RA understanding.

The application was implemented by Lukáš Kotlík as a bachelor thesis on [Faculty of
Electrical Engineering, Czech Technical University](https://fel.cvut.cz/en/).

## Usage

We start with a description of basic terms we will use in the following text:

* **Editable relations** - They are the relations we can edit. They are not available for usage in queries directly
(see **Loaded relations** below).
* **Selected relation** - It is the editable relation that is edited in a given time. The application displays it in the container
in the upper part of the screen.
* **Loaded relations** - They are available for usage in queries. We create them from valid editable relations by
loading.
* **Expressions** - There may be multiple relational algebra expressions in the application.
* **Selected expression** - It is the expression that is edited in a given time. The application displays it in the text area
in the second part of the screen.
* **Project** - We use the project to save/load our work using **.rachel** (JSON) file. It stores editable relations,
expressions, and an indicator of whether we assume null values.
* **Application** - The application always contains one project, which can be saved or overwritten by loading a new one.
Furthermore, the application provides additional settings or batch processing of multiple project files.



### Typical Workflow

Now, we will describe the high-level workflow in the application. We will describe particular parts in depth in the
following paragraphs.

When using the application for the first time, we must prepare our relations first. To do so, we use the relation
section of the page. In the relation section, we can create new editable relations, delete them, or import/export them
using CSV files. At each time, we can edit the selected relation in the container. Once we prepare (valid) relations, we
load them into the application.

After loading the relations, we can use them in query expressions. In the expression section, we can create new
expressions, delete them, or import/export them using a text file. Each time, we can edit the selected expression
in the text area. Once we are done with editing, we can evaluate the selected expression.

After the evaluation of the selected expression, the application displays its evaluation tree and result in the bottom
part of the page. We can use the evaluation tree to browse intermediate relations created during the evaluation.

Anytime in the described process, we can save the project to a file and continue later on.



### Relation Section

We define relations in a sheet in the upper part of the screen. To be able to use a relation in the expressions,
we need to load it to the application when all its values are valid. After loading, we can continue editing
the relation while the last loaded (valid) state is still available in the expressions.

There are four buttons in the header menu, which affect all relations:

* The **Load all** button loads all valid editable relations into the application memory. If any loaded relation with
the same name exists, it is overwritten. Invalid relations are skipped.
* The **Remove loaded** button removes all loaded relations (editable relations are not changed).
* The **Import** button enables us to import new editable relations from CSV files.
* The **Export** button saves all editable relations in CSV files. The saved relations may be in an invalid state.


In the menu above the sheet, we can select one relation to be edited. A star before the relation name marks changed
relations since the last loading. We can add a new editable relation by the **+** button.

In the first row of the sheet, we define column names and types. Column names cannot be duplicated inside one relation
and must contain letters, numbers, and underscores only and not start with a number. Also, column names "null", "true"
and "false" are forbidden. There are three supported column types in the application: **number**, **string**,
and **boolean**.

The **+** buttons in the last column and last row adds a new column or row, respectively.

Other sheet cells define the data itself. We can use integers or decimals in number columns and character sequences
in string columns. Note that the application trims trailing whitespaces before loading, so the string **"~a~b~c~"**
is loaded as **"a~b~c"**. If **null** values are supported, "null" inputs are valid in all column types and
are loaded as **null** values. Also, empty inputs in number and boolean columns are loaded as **null** values.

When the cursor hovers over the first row, a button for deleting a given column appears. Similarly, when over the
first column, a button for deleting a given row appears.

There are four buttons in the menu under the sheet, which affect the selected relation:

* The **Load** button loads the relation into the application memory. If any loaded relation with the same name exists,
it is overwritten.
* The **Rename** text field renames the relation. We cannot change the name to any existing relation name. Allowed
characters are the same as in column names, but forbidden words are "F", "L", and "R".
* The **Delete** button deletes the relation from the editable list.
* The **Revert** button reverts the relation to the last loaded state (if the relation was not loaded yet, it is
reverted to its initial state).



### Expression Section

The second section of the application provides the input for expressions.

There are two buttons in the header menu, which effects all expressions:

* The **Import** button enables us to load new expressions from text files.
* The **Export** button saves all expressions in a text file.

We can have multiple named expressions loaded in the application at a time. Again, we use the upper menu for selecting
an expression to edit and the **+** button for adding a new one.

In the text area, we define the expression itself. We can use buttons under the text area to insert RA operators.
While typing, the application suggests relation or column names available at the cursor position. We can use
**arrows/Enter** keys or **mouse** to insert the suggestion. Pressing **Ctrl+Space** hides or displays
the suggestions list.

To use quote characters inside string literals in expressions, we must escape their default behavior (i.e.,
starting or ending a string) by a backslash. Similarly, to use a backslash character, we must type it twice.

There are three buttons on the bottom of the section, which affect the selected expression:

* The **Evaluate** button evaluates the selected expression and updates the result section.
* The **Rename** text field renames the selected expression. There are no restrictions on expression names.
* The **Delete** button deletes the selected expression.



### Result Section

The result section appears after the evaluation of an expression. It displays the evaluation tree and the result
relation. Moreover, for every individual operation node within the tree, we can display a relation with data
corresponding to a given intermediate result. We can also sort the rows in a relation using the specific column
values.

The **Export** button above the evaluation tree downloads the tree as a PNG image. We can use the **Add** and
**Export** buttons above the table to add the displayed relation to the editable ones or save it in a CSV file.



### Management Section

The last-mentioned section is the upper one. It provides general management of the application.

* The **Load** button loads the whole project from **.rachel** files. Rachel files contain all editable relations, all
expressions, and a configuration value indicating whether usage of null meta values is enabled.
* The **Save** button saves the current project to a new **.rachel** file.
* The **Samples** button shows prepared sample projects. It is a convenient starting point for users who are just
getting acquainted with Rachel.
* In the **Settings**, we can set:
  - **Null values support** whether the project supports null values in relations and expressions
  - **CSV separator** used value separator in downloaded CSV files
  - **Theme** the theme of the application (light/dark)
  - **Language** the language of the application (English/Czech)
* The **Batch** button lets us select multiple project files to be all processed, and their reports generated.
See [Batch processing](#batch-processing)
* The **About** button navigates to the project repository.



### Operators

Rachel provides a wide set of relational algebra operations. In the following list, we show their syntax and
precedence (lower numbers mean higher precedence). Anyway, we recommend using parentheses to avoid
unexpected precedence behavior.

* Precedence level 1 - unary operations:
  - **Projection** Relation[column, ...]
  - **Selection**: Relation(condition)
  - **Rename**: Relation\<Old -> New, ...>
* Precedence level 2 - joins and division:
  - **Natural join**: A * B
  - **Cartesian product**: A ⨯ B
  - **Left/right semijoin**: A <* B, A *> B
  - **Left/right antijoin**: A ⊳ B, A ⊲ B
  - **Theta join**: A [condition] B
  - **Left/right theta join**: A ⟨condition] B, A [condition⟩ B
  - **Full/left/right outer join**: A \*F\* B, A \*L\* B, A \*R\* B
  - **Division**: A ÷ B
* Precedence level 3 - intersection:
  - **Intersection**: A ∩ B
* Precedence level 4 - union and difference:
  - **Union**: A ∪ B
  - **Difference**: A \\ B

We use algebraic operators (+, -, *, /) in the conditions to calculate new number values. If a number column evaluates
to null, null is returned. Other input types trigger an error.

Comparison operators (==, !=, <, >, <=, >=) accept any pair of input operands of the same type and produce a boolean
value, i.e., true or false. Inequality checking of booleans uses false < true. Inequality checking of strings uses
alphabetic comparison (e.g., "abc" < "def", "a" < "aa"). If a column evaluates to null, the only condition which
returns true is column == null. Different input types trigger an error. There are two ways to write equality (==, =)
and inequality (!=, <>) operators.

We can use boolean values in selection and theta semijoins with no testing operator (e.g., Relation(BooleanColumn)).
Theta joins always require some testing operator (e.g., RelA[BooleanColumn = true]RelB).

Logical operators (not, and, or) accept boolean values and computes a new boolean value. When a column of boolean type
evaluates to null, it holds: !column == false, column && boolean == false for any boolean value, and
column || boolean == boolean for any boolean value. Other input types trigger an error. There are three ways to write
logical operators: negation (!, ~, ¬), and (&&, &, ∧), or (||, |, ∨).



### Tips

In expressions, we can use C-style line and block comments.

We can use **Ctrl+Enter** in the relation table to load the current relation. In the expression textarea, we can use
it to evaluate the current expression.

All tabulators loaded into the application in files are replaced by four spaces. In case of editing the files outside
Rachel, we recommend using spaces to ensure expected indenting.

We can use a mouse to move relations and expressions in their menus.



### Known Issues

The application does not support the **Internet Explorer** browser. We decided not to support it as Microsoft
recommends using newer browsers and announced the end of its support as well.



### Batch processing

The application provides batch processing of Rachel projects. You can use it to efficiently evaluate many projects
at once. Moreover, the application creates a report for each loaded project. In the report, there is a list of counts
of used operations, pretty-printed each defined table, and displayed each defined expression with its pretty-printed
result relation or error.

For example, this feature is suitable for homework evaluation - the homework can be assigned
as a predefined Rachel project, students create required tables and queries and submit it back, and teachers
use Rachel to generate the reports for submitted projects.

Additional checking of projects can be configured by the **Load config** button. You can load a configuration JSON file
with the following structure:

```json
{
  "loadType": "files",
  "resultFilename": "my-custom-zip-name",
  "reportName": {
    "prefix": "aaa_",
    "suffix": "_xxx",
    "usePathParts": [ 1, 2 ],
    "joinPathParts": "-"
  },
  "Some_custom_name_of_rule_A" : {
    "operations" : "antijoin",
    "description" : "There must be 5 antijoins.",
    "count" : 5
  },
  "Rule_B" : {
    "operations" : [ "antijoin", "cartesian", "division" ],
    "description" : "There must be 5 operations from antijoins, cartesian products, and divisions.",
    "count" : { "$eq" : 5 }
  },
  "Rule_C" : {
    "operations" : [ "antijoin", "cartesian", "division" ],
    "description" : "There must be 3-4 tables of each from antijoins, cartesian products, and divisions.",
    "each" : { "$gte" : 3, "$lte" : 7 }
  },
  "Rule_D" : {
    "tables" : 2,
    "description" : "There must be 2 tables defined."
  },
  "Rule_E" : {
    "tables" : { "$gte" : 3, "$lte" : 4 },
    "description" : "There must be 3-4 tables defined."
  },
  "Rule_F" : {
    "queries" : 3,
    "description" : "There must be 3 queries."
  },
  "Rule_H" : {
    "queries" : { "$gt" : 3, "$lt" : 6 },
    "description" : "There must be 4-5 queries."
  }
}
```

In the config, you can set the **loadType**. If the loading type is set to *"zip"*, the application expects a user to
select a ZIP file for processing. The application finds .rachel files in the zip (even in subfolders) and processes them.
If the loading type is set to *"files"*, the application expects a user to select multiple .rachel files. The default
setting is *"zip"*. The **resultFilename** field sets the name of the downloaded ZIP file with generated reports. The
default name is *"rachel-eval-results"*.

The **reportName** modifies names of generated reports. It can specify 4 modifications:
* **usePathParts** sets which parts of the path to the project files
should be included in the report name. The parts are numbered backwards - last part (i.e., filename) is number 1.
Example: if we have a source project some/path/to/my-project.rachel and set usePathParts to \[ 1, 3 \], the report name
will be path/my-project.rachel.
* **joinPathParts** sets how slashes in the source project path are replaced.
Example: if we have a source project some/path/to/my-project.rachel and set joinPathParts to "-", the report name
will be some-path-to-my-project.rachel.
* **prefix**/**suffix** are prepended/appended respectively to the filename after usePathParts and joinPathParts
modifications
         
Words *loadType*, *resultFilename*, and *reportName* are reserved and cannot be used to name your count rules.

Further, the JSON file contains arbitrary number of rules with custom (non-reserved) but unique names.
There are 3 types of rules, the type is specified by its operations/tables/queries field:
* **operations count:** restricts the count of operations used in the project
* **tables count:** restricts the count of tables defined in the project
* **queries count:** restricts the count of queries defined in the project

The count is specified as a single number (for exact count), or as a count object. The count object supports 5 fields,
there may be multiple fields specified:
* **$eq: N** - count must be equal to N
* **$gte: N** - count must be grater than or equal to N
* **$lte: N** - count must be less than or equal to N
* **$gt: N** - count must be grater than N
* **$lt: N** - count must be less than N

The **operations** field specifies operation types used in the rule - it is a single type, or an array of types. Supported
operation types are: antijoin (for left/right antijoins), cartesian (for cartesian product), division,
natural (for natural join), outerJoin (for left/right/full outer join), projection, rename, selection,
semijoin (for left/right semijoins), union, intersection, difference, thetaJoin,
thetaSemijoin (for left/right theta semijoins). If the **count** field is defined, the provided count is checked for the sum
of the listed operation types. If the **each** field is defined, the provided count is checked for each from the listed
operation types - it creates automatically multiple independent rules.

The **tables**/**queries** fields contain the count of tables/queries right away. Each rule can contain a description.

If the project violates any defined rule, the name and the description of the rule is displayed in the generated report.

