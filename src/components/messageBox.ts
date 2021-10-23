import './css/messageBox.css'

// @ts-ignore
const cssConstants: CSSStyleDeclaration = getComputedStyle(document.querySelector(':root'))
const boxMargin = Number(cssConstants.getPropertyValue('--message-box-margin-num'))

/**
 * Class for displaying messages and errors to the user in a pop-up box.
 * @category Components
 * @public
 */
export class MessageBox {

  private static readonly hideTimeout: number = 5000

  private static readonly box: HTMLDivElement = MessageBox.init()
  private static hideIntervalId: NodeJS.Timeout

  private static init (): HTMLDivElement {
    const box = document.createElement('div')
    box.classList.add('message-box')
    box.style.visibility = 'hidden'
    box.onmouseenter = () => {
      MessageBox.clearHideTimeout()
    }
    box.onmouseleave = () => {
      MessageBox.setHideTimeout()
    }

    const paragraph = document.createElement('p')
    box.appendChild(paragraph)

    const button = document.createElement('button')
    button.innerText = '\u2716'
    button.onclick = () => {
      MessageBox.hideBox()
    }
    box.appendChild(button)

    window.addEventListener('resize', () => {
      MessageBox.moveBox()
    })

    document.body.appendChild(box)
    return box
  }

  private static readonly setHideTimeout = () => {
    // clears previous hide interval
    MessageBox.clearHideTimeout()
    MessageBox.hideIntervalId = setTimeout(MessageBox.hideBox, MessageBox.hideTimeout)
  }

  private static readonly clearHideTimeout = () => {
    clearTimeout(MessageBox.hideIntervalId)
  }

  private static readonly hideBox = () => {
    MessageBox.box.style.visibility = 'hidden'
  }

  private static readonly moveBox = () => {
    if (MessageBox.box.style.visibility === 'visible') {
      MessageBox.box.style.width = (document.body.clientWidth - 2 * boxMargin) + 'px'
    }
  }

  private static display (msg: string, error: boolean): void {
    const box = MessageBox.box
    // @ts-ignore - first element is paragraph
    box.firstElementChild.innerText = msg
    box.style.visibility = 'visible'
    box.classList.toggle('message-box-message', !error)
    box.classList.toggle('message-box-error', error)
    MessageBox.moveBox()
    MessageBox.setHideTimeout()
  }

  /**
     * Displays given message in a message box fixed on the page bottom.
     * @param msg message to display {@type string}
     * @public
     */
  static message (msg: string): void {
    MessageBox.display(msg, false)
  }

  /**
     * Displays given error in a message box fixed on the page bottom.
     * @param msg error to display {@type string}
     * @public
     */
  static error (msg: string): void {
    MessageBox.display(msg, true)
  }
}
