/**
 * Formats given date to: dd.mm.yyyy hh:mm.
 *
 * @param date date to format {@type Date}
 * @return formatted date {@type string}
 * @public
 */
export function formatDate(date: Date): string {
    return String(date.getDate()).padStart(2, '0') + '.' + String(date.getMonth() + 1).padStart(2, '0') + '.' +
        String(date.getFullYear()) + ' ' +
        String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
}