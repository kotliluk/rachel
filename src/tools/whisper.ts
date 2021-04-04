/**
 * Returns start index of the word before given index in the given string.
 *
 * @param str
 * @param index
 */
import {assertParamsCount} from "../error/errorFactory";

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
 * Returns sorted given array of whispers with respect to given last word before cursor.
 * Matched word parts in the whispers are highlighted by CSS span. Not-matched words are made grey.
 */
export function sortWhispers(whispers: string[], wordBeforeCursor: string): string[] {
    // values for sorting whispers
    const startsWithWord: number = 2;
    const containsWord: number = 1;
    // creates help array with whisper likelihoods and highlighted matched parts
    const helpArray: {whisper: string, likelihood: number}[] = whispers.map(whisper => {
        let likelihood = 0;
        const wordStart = whisper.toLowerCase().indexOf(wordBeforeCursor.toLowerCase());
        if (wordStart > -1) {
            likelihood += wordStart === 0 ? startsWithWord : containsWord;
            const wordEnd = wordStart + wordBeforeCursor.length;
            whisper = whisper.slice(0, wordStart) + "<span class='whisper-matched-word'>" +
                whisper.slice(wordStart, wordEnd) + "</span>" + whisper.slice(wordEnd);
        }
        if (likelihood === 0) {
            whisper = "<span class='whisper-rejected-word'>" + whisper + "</span>"
        }
        return {whisper, likelihood};
    });
    if (wordBeforeCursor !== "") {
        helpArray.sort((x, y) => y.likelihood - x.likelihood);
    }
    return helpArray.map(help => help.whisper);
}