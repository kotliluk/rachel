interface SendData {
  access_token: string
  subject: string
  text: string
}

/**
 * Class for sending emails. Powered by https://postmail.invotes.com/.
 * TypeScript version of JavaScript Copy & Paste Example from PostMail webpage.
 */
export class Mail {

  /**
     * Creates a mailer with given Mail access token.
     *
     * @param accessToken token which specifies Mail receiver of mails
     */
  constructor (readonly accessToken: string) {}

  /**
     * Sends given subject and body of the email to the Mail receiver.
     *
     * @param subject subject of the mail
     * @param body body of the mail
     */
  send (subject: string, body: string): void {
    const data_js: SendData = {
      access_token: this.accessToken,
      subject: subject,
      text: body,
    }

    const request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
      } else if (request.readyState === 4) {
        console.log('failed creating XMLHttpRequest in Mail.send: ' + request.response)
      }
    }

    const params = Mail.toParams(data_js)
    request.open('POST', 'https://postmail.invotes.com/send', true)
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    request.send(params)
  }

  private static toParams (data: SendData): string {
    return encodeURIComponent('access_token') + '=' + encodeURIComponent(data.access_token) + '&'
            + encodeURIComponent('subject') + '=' + encodeURIComponent(data.subject) + '&'
                + encodeURIComponent('text') + '=' + encodeURIComponent(data.text)
  }
}
