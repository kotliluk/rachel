import {Project} from "./project";

export interface ProjectSample {
    name: string,
    project: Project
}

const samples: ProjectSample[] = [
    {
        name: "Cars and Owners",
        project: {
            relations: [
                {
                    name: "Car",
                    columnNames: ["Id", "Owner", "Color", "Electric", "Weight"],
                    columnTypes: ["number", "number", "string", "boolean", "number"],
                    rows: [
                        ['1', '1', 'Blue', 'true', '1000'],
                        ['2', '1', 'Green', 'false', '1 200'],
                        ['3', '2', 'Blue', 'false', '850.42'],
                        ['4', '3', 'Black', 'true', '1 111.111 111']
                    ],
                    columnCount: 5,
                    rowCount: 4
                },
                {
                    name: "Owner",
                    columnNames: ["Id", "Name"],
                    columnTypes: ["number", "string"],
                    rows: [
                        ['1', 'George Smith'],
                        ['2', 'Adam "Driver /\\" Jackson'],
                        ['3', 'Michael Trueman'],
                        ['Fix errors', 'before loading'],
                        ['Or delete', 'invalid rows']
                    ],
                    columnCount: 2,
                    rowCount: 3
                }
            ],
            expressions: [
                {
                    name: "Relation only",
                    text:
                        "// You can use comments until the line end after '//'\n" +
                        "// You must load relations before using them in expressions\n" +
                        "\n" +
                        "Car\n" +
                        "\n" +
                        "// After evaluation, you will see the evaluation tree\n" +
                        "// and the result relation at the bottom of the page\n" +
                        ""
                },
                {
                    name: "Unary operator",
                    text:
                        "// Unary operator comes after the source relation\n" +
                        "// If the relation is still not defined, go check its definition\n" +
                        "// This expression returns all owners with id 1\n" +
                        "\n" +
                        "Owner(Id = 1)\n" +
                        ""
                },
                {
                    name: "Binary operator",
                    text:
                        "// Binary operator comes between source relations\n" +
                        "// This expression returns natural join of cars and owners\n" +
                        "\n" +
                        "Car*Owner\n" +
                        ""
                },
                {
                    name: "Escapes",
                    text:
                        "// Strings in expressions are enclosed in quotes\n" +
                        "// To use quotes inside a string, you must escape them by a backslash '\\\"'\n" +
                        "// To use backslash inside a string, you must escape it with second one '\\\\'\n" +
                        "\n" +
                        'Owner(Name == "Adam \\"Driver /\\\\\\" Jackson")\n' +
                        '\n' +
                        '// This does not work: Owner(Name == "Adam "Driver /\\" Jackson")\n' +
                        ""
                },
                {
                    name: "Example",
                    text:
                        "// Errors are highlighted by red underline - hover mouse over it to see details\n" +
                        "// While typing, Rachel shows you available relations or columns\n" +
                        "// (if relations are loaded in the application)\n" +
                        "// Try to write a query for: all cars' ids and their owners' names\n" +
                        "\n" +
                        "TODO...\n" +
                        ""
                },
                {
                    name: "Example result",
                    text:
                        "// One possible expression is like this...\n" +
                        "\n" +
                        "(\n" +
                        "  Car\n" +
                        "  *\n" +
                        "  Owner< Id -> Owner >\n" +
                        ")[Id, Name]\n" +
                        "\n" +
                        "// For more detailed manual click 'About' button in the page header\n" +
                        ""
                }
            ],
            nullValuesSupport: true
        }
    }
];

/**
 * Returns prepared project samples.
 */
export function getSamples(): ProjectSample[] {
    return samples;
}