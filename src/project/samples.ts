import {Project} from "./project";

/**
 * Sample of the application {@link Project} with a name.
 * @category Project
 * @public
 */
export interface ProjectSample {
    /**
     * name of the sample
     * @type string
     * @public
     */
    name: string,
    /**
     * sample project
     * @type Project
     * @public
     */
    project: Project
}

const samples: ProjectSample[] = [
    // english sample
    {
        name: "Cars and Owners (EN)",
        project: {
            relations: [
                {
                    name: "Car",
                    columnNames: ["Id", "Owner", "Color", "Electric", "Weight"],
                    columnTypes: ["number", "number", "string", "boolean", "number"],
                    rows: [
                        ['1', '1', 'Blue', 'True', '1000'],
                        ['2', '1', 'Green', 'false', '1 200'],
                        ['3', '2', 'Blue', 'F', '850.42'],
                        ['4', '3', 'Black', 't', '1 111.111 111']
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
    },
    // czech sample
    {
        name: "Auta a Majitel?? (CS)",
        project: {
            relations: [
                {
                    name: "Auto",
                    columnNames: ["Id", "Majitel", "Barva", "Elektro", "V??ha"],
                    columnTypes: ["number", "number", "string", "boolean", "number"],
                    rows: [
                        ['1', '1', 'Modr??', 'True', '1000'],
                        ['2', '1', 'Zelen??', 'false', '1 200'],
                        ['3', '2', 'Modr??', 'F', '850.42'],
                        ['4', '3', '??ern??', 't', '1 111.111 111']
                    ],
                    columnCount: 5,
                    rowCount: 4
                },
                {
                    name: "Majitel",
                    columnNames: ["Id", "Jm??no"],
                    columnTypes: ["number", "string"],
                    rows: [
                        ['1', 'Pepa Mr??zek'],
                        ['2', 'Adam "Z??vodn??k /\\" Horv??th'],
                        ['3', 'Michael Dvo????k'],
                        ['P??ed nahr??n??m', 'oprav chyby'],
                        ['Nebo odstra??', 'chybn?? ????dky']
                    ],
                    columnCount: 2,
                    rowCount: 3
                }
            ],
            expressions: [
                {
                    name: "Pouze relace",
                    text:
                        "// M????e?? pou????vat koment????e po '//'\n" +
                        "// P??ed pou??it??m relac?? ve v??razech je mus???? nahr??t\n" +
                        "\n" +
                        "Auto\n" +
                        "\n" +
                        "// Po vyhodnocen?? uvid???? evalua??n?? strom\n" +
                        "// a v??slednou relaci dole na str??nce\n" +
                        ""
                },
                {
                    name: "Un??rn?? oper??tor",
                    text:
                        "// Un??rn?? oper??tory se p?????? za vstupn?? relaci\n" +
                        "// Pokud je tato relace st??le nedefinovan??, zkontroluj jej?? definici\n" +
                        "// Tento dotaz vr??t?? v??echny majitele s id = 1\n" +
                        "\n" +
                        "Majitel(Id = 1)\n" +
                        ""
                },
                {
                    name: "Bin??rn?? oper??tor",
                    text:
                        "// Bin??rn?? oper??tory se p?????? mezi vstupn?? relace\n" +
                        "// Tento v??raz vr??t?? p??irozen?? spojen?? aut a majitel??\n" +
                        "\n" +
                        "Auto*Majitel\n" +
                        ""
                },
                {
                    name: "Escapes",
                    text:
                        "// Textov?? ??et??zce ve v??razech mus?? b??t mezi uvozovkami\n" +
                        "// Pro pou??it?? uvozovek v ??et??zci p??ed n?? mus???? napsat zp??tn?? lom??tko '\\\"'\n" +
                        "// Pro pou??it?? zp??tn??ho lom??tka p??ed n??j mus???? napsat druh?? '\\\\'\n" +
                        "\n" +
                        'Majitel(Jm??no == "Adam \\"Z??vodn??k /\\\\\\" Horv??th")\n' +
                        '\n' +
                        '// Toto by nefungovalo: Majitel(Jm??no == "Adam "Z??vodn??k /\\" Horv??th")\n' +
                        ""
                },
                {
                    name: "P????klad",
                    text:
                        "// Chyby jsou zv??razn??ni ??erven??m podtr??en??m - p??eje?? na n?? my???? pro detaily\n" +
                        "// P??i psan?? ti Rachel nab??z?? dostupn?? relace nebo sloupce\n" +
                        "// (pokud jsou relace nahran?? v aplikace)\n" +
                        "// Zkus napsat dotaz pro: id v??ech aut a jm??na jejich majitel??\n" +
                        "\n" +
                        "TODO...\n" +
                        ""
                },
                {
                    name: "V??sledek p????kladu",
                    text:
                        "// Jedno mo??n?? ??e??en?? je toto...\n" +
                        "\n" +
                        "(\n" +
                        "  Auto\n" +
                        "  *\n" +
                        "  Majitel< Id -> Majitel >\n" +
                        ")[Id, Jm??no]\n" +
                        "\n" +
                        "// Pro v??ce informac?? nav??tiv manu??l p??es odkaz 'O aplikaci' v horn??m menu\n" +
                        ""
                }
            ],
            nullValuesSupport: true
        }
    }
];

/**
 * Returns prepared project samples.
 *
 * @return {@type ProjectSample[]}
 * @category Project
 * @public
 */
export function getSamples(): ProjectSample[] {
    return samples;
}