import {CsvValueSeparatorChar} from "./csvSupport";
import {isSupportedLanguage, SupportedLanguage} from "./supportedLanguage";

const defaultCsvValueSeparator: CsvValueSeparatorChar = ";";
const defaultLanguage: SupportedLanguage = "ENG";
const defaultDarkMode: string = "false";

/**
 * Static class for maintaining the access to local storage of the browser. It handles user settings:
 * saving file type, csv value separator, language, light/dark theme of the application.
 * If the local storage is not used, it uses the application memory and the default values.
 */
export class LocalStorage {

    private static isInit: boolean = false;
    private static storageSupported: boolean = typeof(Storage) !== "undefined";

    private static csvValueSeparator: CsvValueSeparatorChar;
    private static language: SupportedLanguage;
    private static darkTheme: string;

    /**
     * Initializes the LocalStorage. If there are the requested values, loads them to application memory.
     * If the local storage is not supported, uses the default values.
     */
    private static init(): void {
        if (LocalStorage.storageSupported) {
            const storedSeparator = localStorage.getItem("csvValueSeparator");
            if (storedSeparator !== ";" && storedSeparator !== ",") {
                console.log("csvValueSeparator not found in localStorage and set to default");
                localStorage.setItem("csvValueSeparator", defaultCsvValueSeparator);
                LocalStorage.csvValueSeparator = defaultCsvValueSeparator;
            }
            else {
                // @ts-ignore
                LocalStorage.csvValueSeparator = localStorage.getItem("csvValueSeparator");
            }
            if (!isSupportedLanguage(localStorage.getItem("language"))) {
                console.log("language not found in localStorage and set to default");
                localStorage.setItem("language", defaultLanguage);
                LocalStorage.language = defaultLanguage;
            }
            else {
                // @ts-ignore
                LocalStorage.language = localStorage.getItem("language");
            }

            if (localStorage.getItem("darkTheme") !== "true" && localStorage.getItem("darkTheme") !== "false") {
                console.log("darkTheme not found in localStorage and set to default");
                localStorage.setItem("darkTheme", defaultDarkMode);
                LocalStorage.darkTheme = defaultDarkMode;
            }
            else {
                // @ts-ignore
                LocalStorage.darkTheme = localStorage.getItem("darkTheme");
            }
        }
        else {
            console.warn("LocalStorage not supported in the browser. Default values used.");
            LocalStorage.csvValueSeparator = defaultCsvValueSeparator;
            LocalStorage.language = defaultLanguage;
            LocalStorage.darkTheme = defaultDarkMode;
        }
        LocalStorage.isInit = true;
    }

    public static getCsvValueSeparator(): CsvValueSeparatorChar {
        if (!LocalStorage.isInit) {
            LocalStorage.init();
        }
        return LocalStorage.csvValueSeparator;
    }

    public static setCsvValueSeparator(csvValueSeparator: CsvValueSeparatorChar): void {
        LocalStorage.csvValueSeparator = csvValueSeparator;
        if (LocalStorage.storageSupported) {
            localStorage.setItem("csvValueSeparator", csvValueSeparator);
        }
    }

    public static getLanguage(): SupportedLanguage {
        if (!LocalStorage.isInit) {
            LocalStorage.init();
        }
        return LocalStorage.language;
    }

    public static setLanguage(language: SupportedLanguage): void {
        LocalStorage.language = language;
        if (LocalStorage.storageSupported) {
            localStorage.setItem("language", language);
        }
    }

    public static getDarkMode(): boolean {
        if (!LocalStorage.isInit) {
            LocalStorage.init();
        }
        return LocalStorage.darkTheme === "true";
    }

    public static setDarkMode(darkTheme: boolean): void {
        LocalStorage.darkTheme = String(darkTheme);
        if (LocalStorage.storageSupported) {
            localStorage.setItem("darkTheme", String(darkTheme));
        }
    }
}