/**
 * Computes width (average on sample of characters) and its height of the given font with given size in pixels.
 *
 * @param fontFamily
 * @param fontSize
 */
export function computeFontSizeInPx(fontFamily: string, fontSize: string): {fontWidth: number, fontHeight: number} {
    const text: string = "0123456789qwertyuiopasdfghjkllzxcvbnmQWERTYUIOOPASDFGHJKLLZXCVBNM!@#$%^&*()_+[];',./";
    const div = document.createElement("div");
    div.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}; position: absolute; white-space: nowrap;`);
    div.innerText = text;
    document.documentElement.appendChild(div);
    const divWidth: number = div.clientWidth;
    const divHeight: number = div.clientHeight;
    div.remove();
    return { fontWidth: divWidth / text.length, fontHeight: divHeight };
}