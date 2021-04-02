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
                    columnNames: ["Id", "Owner", "Color", "Electric"],
                    columnTypes: ["number", "number", "string", "boolean"],
                    rows: [
                        ['1', '1', '"Blue"', 'true'],
                        ['2', '1', '"Green"', 'false'],
                        ['3', '2', '"Blue"', 'false'],
                        ['4', '3', '"Black"', 'true']
                    ],
                    columnCount: 4,
                    rowCount: 4
                },
                {
                    name: "Owner",
                    columnNames: ["Id", "Name"],
                    columnTypes: ["number", "string"],
                    rows: [
                        ['1', '"George"'],
                        ['2', '"Adam"'],
                        ['3', '"Michael"']
                    ],
                    columnCount: 2,
                    rowCount: 3
                }
            ],
            expressions: [
                {name: "Expression 1", text: "// You can use comments until the line end after '//'\n\nCar"},
                {name: "Expression 2", text: "// Unary operator after the source relation\n\nOwner(Id = 1)"},
                {name: "Expression 3", text: "// Binary operator between source relations\n\nCar*Owner"}
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