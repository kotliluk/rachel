import { FileDialog } from '../utils/fileDialog'
import { saveAs } from 'file-saver'
import { Expression } from './expression'

/**
 * Promised expression information in {@link ExpressionStoreManager}.load() function.
 * @category Expression
 * @public
 */
export interface ExpressionLoadData {
  /**
     * successfully parsed expressions
     * @type Expression[]
     * @public
     */
  expressions: Expression[]
  /**
     * number of skipped expressions (from successfully loaded files)
     * @type number
     * @public
     */
  skippedExpressions: number
  /**
     * number of successfully loaded files
     * @type number
     * @public
     */
  loadedFiles: number
  /**
     * number of skipped files (not .txt, null loaded...)
     * @type number
     * @public
     */
  skippedFiles: number
}

/**
 * Class for loading and saving expressions.
 * @category Expression
 * @public
 */
export class ExpressionStoreManager {

  /**
     * Loads expressions from multiple textual files selected by the user. Each file can contain multiple expressions,
     * split by '\n###\n'. When different line separator is used (\r, \r\n), it is replaced by \n before return.
     * All tabulators are replaces by 4 spaces.
     *
     * @return information about loaded expressions in a promise {@type Promise<ExpressionLoadData>}
     * @public
     */
  static async load (): Promise<ExpressionLoadData> {
    return await new Promise<ExpressionLoadData>(resolve => {
      FileDialog.openFiles('.txt').then(files => {
        const expressions: Expression[] = []
        let skippedExpressions = 0
        let loadedFiles = 0
        let skippedFiles = 0
        files.forEach(file => {
          if (file.text === null) {
            console.log('Null read from file ' + file.name)
            skippedFiles += 1
          } else if (/\.txt$/.exec(file.name)) {
            // replaces line separators to expected '\n' and tabulators to four spaces
            file.text = file.text.replace(/\r\n/g, '\n')
              .replace(/\r/g, '\n').replace(/\t/g, '    ');
            // prepends newline for first expected splitting of the first expression
            ('\n'.concat(file.text)).split('\n### ').forEach(part => {
              try {
                if (part.trim().length !== 0) {
                  expressions.push(this.splitExpressionNameAndText(part))
                }
              } catch (err) {
                skippedExpressions += 1
              }
            })
            loadedFiles += 1
          } else {
            console.log('Unsupported filetype: ' + file.name)
            skippedFiles += 1
          }
        })
        resolve({ expressions, skippedExpressions, loadedFiles, skippedFiles })
      })
    })
  }

  private static splitExpressionNameAndText (expr: string): Expression {
    const firstNewLineIndex: number = expr.indexOf('\n')
    if (firstNewLineIndex === -1) {
      console.log('Expression does not contain first name line.')
      throw Error()
    }
    const firstRow: string = expr.slice(0, firstNewLineIndex).trim()
    if (!firstRow.endsWith(' ###')) {
      console.log('Expression does not contain name between hashes.')
      throw Error()
    }
    const name: string = firstRow.slice(0, -4)
    const text: string = expr.slice(firstNewLineIndex).trim()
    return { name: name, text: text }
  }

  /**
     * Saves given expressions to a textual file. Each expression starts with "### Expression name ###\n" line.
     *
     * @param expressions array of expressions to be saved {@type Expression[]}
     * @param filename name of the downloaded file (without extension) {@type string}
     * @public
     */
  static save (expressions: Expression[], filename: string): void {
    const textContent: string = expressions.map(e => {
      return '### ' + e.name + ' ###\n\n' + e.text
    }).join('\n\n')
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    saveAs(blob, filename + '.txt')
  }
}
