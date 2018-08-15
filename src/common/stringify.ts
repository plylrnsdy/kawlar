import * as _ from 'lodash';

const { isArray } = Array;
const toTypeString = Object.prototype.toString;
const arrIteratee = (s: string[], v: any) => {
    if (typeof v !== 'function') s.push(stringify(v));
    return s;
}
const objIteratee = (s: string[], v: any, k: string) => {
    if (typeof v !== 'function') s.push(`"${k}":${stringify(v)}`);
    return s;
}

/**
 * use `toString()`(first to use value's own `toString()`) to recursively stringify the value, but not include function
 * @export
 * @param {*} value
 * @returns {string}
 */
export default function stringify(value: any): string {

    const type = typeof value;

    if (value == null) return value === null ? 'null' : 'undefined';
    if (type === 'string') return '"' + value + '"';
    if (type === 'function') return '';

    if (isArray(value))
        return `[${_.reduce(value, arrIteratee, [] as string[]).join(',')}]`;

    if (_.isObjectLike(value))
        return value.toString === toTypeString
            ? `{${_.reduce(value, objIteratee, [] as string[]).join(',')}}`
            : value.toString();

    return (<Object>value).toString();
}
