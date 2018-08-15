import escapeRegExp from "./escapeRegExp";

/**
 * Convert url-pattern to RegExp string.
 * @export
 * @param {string} pattern
 * @returns RegExp string
 * @example
 *      // Match the domain name which not include number
 *      escapePartRegExp('http://www.{[^.0-9]+}.com/')
 *      // => '^http://www\\.[^.0-9]+\\.com/$'
 */
export default function urlPattern(pattern: string): string {
    let strings = pattern.split(/(\{|\})/),
        braceNth = 0,
        regexp = ['^'] as string[];

    for (let str of strings) {
        str === '{'
            ? braceNth++ && regexp.push(str)
        : str === '}'
            ? --braceNth && regexp.push(str)
        : braceNth
            ? regexp.push(str)
            : regexp.push(escapeRegExp(str));
    }
    regexp.push('$');
    return regexp.join('');
}
