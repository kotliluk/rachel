/**
 * Computes width (average on sample of characters) and its height of the given font with given size in pixels.
 *
 * @param fontFamily font to use {@type string}
 * @param fontSize size to use {@type string}
 * @return average width and height of the given font {@type {{fontWidth: number, fontHeight: number}}}
 * @category Utils
 * @public
 */
export function computeFontSizeInPx (fontFamily: string, fontSize: string): {fontWidth: number, fontHeight: number} {
  const text = "0123456789qwertyuiopasdfghjkllzxcvbnmQWERTYUIOOPASDFGHJKLLZXCVBNM!@#$%^&*()_+[];',./"
  const div = document.createElement('div')
  div.setAttribute('style', `font-family: ${fontFamily}; font-size: ${fontSize}; position: absolute; white-space: nowrap;`)
  div.innerText = text
  document.documentElement.appendChild(div)
  const divWidth: number = div.clientWidth
  const divHeight: number = div.clientHeight
  div.remove()
  return { fontWidth: divWidth / text.length, fontHeight: divHeight }
}
