import {isProjectObject, Project} from "./project";
import {FileDialog} from "../utils/fileDialog";
import {saveAs} from "file-saver";

/**
 * Class for loading and saving all project data as {@link Project} objects.
 * @public
 */
export class ProjectStoreManager {

    /**
     * Loads asynchronously the project from a .rachel (JSON) file selected by the user.
     * The file must contain the representation of the project object.
     * Returned string values always use '\n' as line separator.
     *
     * @return loaded project as a Promise {@type Promise<Project>}
     * @public
     */
    public static load(): Promise<Project> {
        return new Promise<Project>((resolve, reject) => {
            FileDialog.openFile(".rachel").then(file => {
                if (file.text === null) {
                    reject("Reading of the content of the file " + file.name + " failed.");
                }
                else if (file.name.match(/\.rachel$/)) {
                    // replaces line separators to expected '\n'
                    file.text = file.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
                        .replace(/\t/g, "    ");
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
     * Saves the given Project into the .rachel (JSON) file.
     *
     * @param project the Project object with all project data {@type Project}
     * @param filename name of the downloaded file (without extension, .rachel is added) {@type String}
     * @public
     */
    public static save(project: Project, filename: string): void {
        const blob = new Blob([JSON.stringify(project)], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename + '.rachel');
    }
}