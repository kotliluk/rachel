import {Project} from "./project";

/**
 * Sample of the application {@link Project} with a name.
 * @public
 */
export interface ProjectSample {
    /**
     * name of the sample
     * @type String
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
        name: "Auta a Majitelé (CS)",
        project: {
            relations: [
                {
                    name: "Auto",
                    columnNames: ["Id", "Majitel", "Barva", "Elektro", "Váha"],
                    columnTypes: ["number", "number", "string", "boolean", "number"],
                    rows: [
                        ['1', '1', 'Modrá', 'True', '1000'],
                        ['2', '1', 'Zelená', 'false', '1 200'],
                        ['3', '2', 'Modrá', 'F', '850.42'],
                        ['4', '3', 'Černá', 't', '1 111.111 111']
                    ],
                    columnCount: 5,
                    rowCount: 4
                },
                {
                    name: "Majitel",
                    columnNames: ["Id", "Jméno"],
                    columnTypes: ["number", "string"],
                    rows: [
                        ['1', 'Pepa Mrázek'],
                        ['2', 'Adam "Závodník /\\" Horváth'],
                        ['3', 'Michael Dvořák'],
                        ['Před nahráním', 'oprav chyby'],
                        ['Nebo odstraň', 'chybné řádky']
                    ],
                    columnCount: 2,
                    rowCount: 3
                }
            ],
            expressions: [
                {
                    name: "Pouze relace",
                    text:
                        "// Můžeš používat komentáře po '//'\n" +
                        "// Před použitím relací ve výrazech je musíš nahrát\n" +
                        "\n" +
                        "Auto\n" +
                        "\n" +
                        "// Po vyhodnocení uvidíš evaluační strom\n" +
                        "// a výslednou relaci dole na stránce\n" +
                        ""
                },
                {
                    name: "Unární operátor",
                    text:
                        "// Unární operátory se píší za vstupní relaci\n" +
                        "// Pokud je tato relace stále nedefinovaná, zkontroluj její definici\n" +
                        "// Tento dotaz vrátí všechny majitele s id = 1\n" +
                        "\n" +
                        "Majitel(Id = 1)\n" +
                        ""
                },
                {
                    name: "Binární operátor",
                    text:
                        "// Binární operátory se píší mezi vstupní relace\n" +
                        "// Tento výraz vrátí přirozené spojení aut a majitelů\n" +
                        "\n" +
                        "Auto*Majitel\n" +
                        ""
                },
                {
                    name: "Escapes",
                    text:
                        "// Textové řetězce ve výrazech musí být mezi uvozovkami\n" +
                        "// Pro použití uvozovek v řetězci před ně musíš napsat zpětné lomítko '\\\"'\n" +
                        "// Pro použití zpětného lomítka před něj musíš napsat druhé '\\\\'\n" +
                        "\n" +
                        'Majitel(Jméno == "Adam \\"Závodník /\\\\\\" Horváth")\n' +
                        '\n' +
                        '// Toto by nefungovalo: Majitel(Jméno == "Adam "Závodník /\\" Horváth")\n' +
                        ""
                },
                {
                    name: "Příklad",
                    text:
                        "// Chyby jsou zvýrazněni červeným podtržením - přejeď na ně myší pro detaily\n" +
                        "// Při psaní ti Rachel nabízí dostupné relace nebo sloupce\n" +
                        "// (pokud jsou relace nahrané v aplikace)\n" +
                        "// Zkus napsat dotaz pro: id všech aut a jména jejich majitelů\n" +
                        "\n" +
                        "TODO...\n" +
                        ""
                },
                {
                    name: "Výsledek příkladu",
                    text:
                        "// Jedno možné řešení je toto...\n" +
                        "\n" +
                        "(\n" +
                        "  Auto\n" +
                        "  *\n" +
                        "  Majitel< Id -> Majitel >\n" +
                        ")[Id, Jméno]\n" +
                        "\n" +
                        "// Pro více informací navštiv manuál přes odkaz 'O aplikaci' v horním menu\n" +
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
 * @public
 */
export function getSamples(): ProjectSample[] {
    return samples;
}