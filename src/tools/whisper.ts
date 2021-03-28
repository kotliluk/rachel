/**
 * Returns start index of the word before given index in the given string.
 *
 * @param str
 * @param index
 */
export function getStartOfWordBeforeIndex(str: string, index: number): number {
    const prefixText: string = str.slice(0, index);
    let i: number = prefixText.length - 1;
    while (true) {
        // if non-name-character is reached
        if (!prefixText.charAt(i).match(/\w/)) {
            ++i;
            break;
        }
        if (i === 0) {
            break;
        }
        --i;
    }
    return i;
}

/**
 * Sorts given array of whispers according to given last word before cursor.
 *
 * @param whispers
 * @param wordBeforeCursor
 */
export function sortWhispers(whispers: string[], wordBeforeCursor: string): void {
    const firstCharHit: number = 64;
    const containsWord: number = 128;
    const getLikelihood = (whisper: string): number => {
        const a = (whisper.charAt(0).toLowerCase() === wordBeforeCursor.charAt(0).toLowerCase()) ? firstCharHit : 0;
        const b = (whisper.toLowerCase().indexOf(wordBeforeCursor.toLowerCase()) > -1) ? containsWord : 0;
        return a + b;
    }
    if (wordBeforeCursor !== "") {
        whispers.sort((x, y) => getLikelihood(y) - getLikelihood(x));
    }
}