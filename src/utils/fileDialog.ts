/**
 * Textual file information.
 * @category Utils
 * @public
 */
export interface File {
    /**
     * name of the file
     * @type string
     * @public
     */
    name: string,
    /**
     * textual content of the file
     * @type string?
     * @public
     */
    text: string | null
}

/**
 * FileDialog for loading files to the application.
 * @category Utils
 * @public
 */
export class FileDialog {

    /**
     * Loads asynchronously a textual content from one file selected by the user in the file browser.
     *
     * @param accept comma-separated list of extensions for filter (default are all extensions) {@type string}
     * @return a file in a promise {@type Promise<File>}
     * @public
     */
    public static openFile(accept: string = "*"): Promise<File> {
        return new Promise<File>(resolve => {
            let element = document.createElement('div');
            element.innerHTML = `<input type="file" accept=${accept}>`;
            let fileInput = element.firstChild;
            // @ts-ignore
            fileInput.addEventListener('change', function() {
                // @ts-ignore
                let file = fileInput.files[0];
                let reader = new FileReader();
                reader.onload = function() {
                    // @ts-ignore
                    resolve({name: file.name, text: reader.result});
                };
                reader.readAsText(file);
            });
            // @ts-ignore
            fileInput.click();
        });
    }

    /**
     * Asynchronously loads textual content from multiple files selected by the user in the file browser.
     *
     * @param accept comma-separated list of extensions for filter (default are all extensions) {@type string}
     * @return array of files in a promise {@type Promise<File[]>}
     * @public
     */
    public static openFiles(accept: string = "*"): Promise<File[]> {
        return new Promise<File[]>(resolve => {
            FileDialog.openFilesHelper(resolve, accept);
        });
    }

    /**
     * Loads textual content from multiple files selected by the user in the file browser.
     * Multiple file input handling inspired by xaedes on https://stackoverflow.com/a/13975217.
     *
     * @param resolve - resolving function accepting an array of file information
     * @param accept comma-separated list of extensions for filter
     */
    private static openFilesHelper(resolve: (files: File[]) => void, accept: string): void {
        let element = document.createElement('div');
        element.innerHTML = `<input type="file" accept=${accept} multiple>`;
        // @ts-ignore
        let fileInput: HTMLInputElement = element.firstChild;
        const fileInfo: {name: string, text: string | null}[] = [];
        fileInput.addEventListener('change', function() {
            // @ts-ignore
            const files: FileList = fileInput.files;
            function readFile(index: number) {
                if (index === files.length) {
                    return resolve(fileInfo);
                }
                const file = files[index];
                const reader = new FileReader();
                reader.onload = function(e) {
                    // @ts-ignore
                    fileInfo.push({name: file.name, text: e.target.result});
                    readFile(index+1);
                    console.log('File ' + (index+1) + '/' + files.length + ' loaded');
                }
                reader.readAsText(file);
            }
            readFile(0);
        });
        fileInput.click();
    }
}
