import {CsvValueSeparator} from "../types/csvSupport";
import {isSupportedLanguage, SupportedLanguage} from "../language/language";

const defaultCsvValueSeparator: CsvValueSeparator = ";";
const defaultLanguage: SupportedLanguage = "EN";
const defaultDarkTheme: string = "false";

/**
 * Static class for maintaining the access to local storage of the browser. It handles user settings:
 * saving file type, csv value separator, language, light/dark theme of the application.
 * If the local storage is not used, it uses the application memory and the default values.
 * @public
 */
export class LocalStorage {

    private static isInit: boolean = false;
    private static storageSupported: boolean = typeof(Storage) !== "undefined";

    private static csvValueSeparator: CsvValueSeparator;
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
                localStorage.setItem("darkTheme", defaultDarkTheme);
                LocalStorage.darkTheme = defaultDarkTheme;
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
            LocalStorage.darkTheme = defaultDarkTheme;
        }
        LocalStorage.isInit = true;
    }

    /**
     * Returns stored CSV value separator.
     *
     * @return stored CSV value separator {@type CsvValueSeparator}
     * @public
     */
    public static getCsvValueSeparator(): CsvValueSeparator {
        if (!LocalStorage.isInit) {
            LocalStorage.init();
        }
        return LocalStorage.csvValueSeparator;
    }

    /**
     * Stores the given CSV value separator.
     *
     * @param csvValueSeparator CSV value separator to store {@type CsvValueSeparator}
     * @public
     */
    public static setCsvValueSeparator(csvValueSeparator: CsvValueSeparator): void {
        LocalStorage.csvValueSeparator = csvValueSeparator;
        if (LocalStorage.storageSupported) {
            localStorage.setItem("csvValueSeparator", csvValueSeparator);
        }
    }

    /**
     * Returns stored language settings.
     *
     * @return stored language {@type SupportedLanguage}
     * @public
     */
    public static getLanguage(): SupportedLanguage {
        if (!LocalStorage.isInit) {
            LocalStorage.init();
        }
        return LocalStorage.language;
    }

    /**
     * Stores the given language settings.
     *
     * @param language language settings to store {@type SupportedLanguage}
     * @public
     */
    public static setLanguage(language: SupportedLanguage): void {
        LocalStorage.language = language;
        if (LocalStorage.storageSupported) {
            localStorage.setItem("language", language);
        }
    }

    /**
     * Returns stored theme settings: true if the stored theme is dark, false if light.
     *
     * @return true if the stored theme is dark, false if light {@type boolean}
     * @public
     */
    public static getDarkTheme(): boolean {
        if (!LocalStorage.isInit) {
            LocalStorage.init();
        }
        return LocalStorage.darkTheme === "true";
    }

    /**
     * Stores the given theme settings: true if the stored theme is dark, false if light.
     *
     * @param darkTheme theme settings to store {@type boolean}
     * @public
     */
    public static setDarkTheme(darkTheme: boolean): void {
        LocalStorage.darkTheme = String(darkTheme);
        if (LocalStorage.storageSupported) {
            localStorage.setItem("darkTheme", String(darkTheme));
        }
    }
}