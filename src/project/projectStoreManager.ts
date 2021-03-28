import {isProjectObject, Project} from "./project";
import {FileDialog} from "../tools/fileDialog";
import {saveAs} from "file-saver";

/**
 * Class for loading and saving project relations and expressions relation.
 */
export class ProjectStoreManager {

    /**
     * Loads asynchronously the project from a JSON file selected by the user.
     * The file must contain the representation of the project object: {
     * relations: StoredRelationData[],
     * expressionTexts: string[],
     * nullValuesSupport: boolean
     * }.
     * Returned string values always use '\n' as line separator.
     */
    public static load(): Promise<Project> {
        return new Promise<Project>((resolve, reject) => {
            FileDialog.openFile(".json").then(file => {
                if (file.text === null) {
                    reject("Reading of the content of the file " + file.name + " failed.");
                }
                else if (file.name.match(/\.json$/)) {
                    // replaces line separators to expected '\n'
                    file.text = file.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                    let obj = JSON.parse(file.text);
                    const result: string = isProjectObject(obj);
                    if (result === "OK") {
                        const project: Project = obj;
                        resolve(project);
                    }
                    else {
                        reject("Invalid structure of the JSON file. " + result)
                    }
                }
                else {
                    reject("Please select a JSON file to load a project relation from.");
                }
            });
        });
    }

    /**
     * Saves the given Project into the JSON file.
     *
     * @param project the Project object with all project relation
     * @param filename name of the downloaded file (without extension)
     */
    public static save(project: Project, filename: string): void {
        const blob = new Blob([JSON.stringify(project)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename + '.json');
    }
}