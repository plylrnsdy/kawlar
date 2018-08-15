import * as _ from 'lodash';
import urlPattern from './common/string/urlPattern';
import Configuration from './core/Configuration';
import Queue from './common/collection/Queue';


// ========== UserSetup ==========
type handler = {
    [key: string]: handler | {
        inputs?: string[]
        args?: any[]
        fn: Function
        output?: string
    }
}
export const handlers: handler = {};


// ========== UserOptions ==========
export const templates: [RegExp, any][] = [];
export function template(pattern: string | RegExp, pipeline: any) {
    let re = typeof pattern === 'string' ? new RegExp(urlPattern(pattern)) : pattern;
    templates.push([re, pipeline]);
}

function mapResult({ fn, inputs, args = [], output }: any) {

    let $inputs: any[], results;
    return async function (task: any) {
        $inputs = _.map(inputs, input => task[input]);
        results = await fn(...$inputs, ...args);
        output && (task[output] = results);
        return task;
    }
}
export function chain(...links: any[]) {
    let funcs = _.map(links.reverse(), link => mapResult(link));

    if (funcs.length === 1) return funcs[0];

    // composed functions
    return async function (x: any) {
        let result = x, l = funcs.length;
        while (l--) {
            result = await funcs[l](result);
        }
        return result;
    }
}
export function link(name: string, options: { inputs?: string[], args?: any[], output?: string } = {}) {
    let handler = _.defaults(options, _.get(handlers, name));

    // Verify handler's completeness
    let membersCount = Object.keys(handler).length;
    if (membersCount < 4) {
        // console.warn('May not enough arguments to handle: ' + name);
    } else if (membersCount < 2) {
        throw new Error('Not enough arguments to handle: ' + name);
    }
    return handler;
}


export const configuration = new Configuration('user/');


// ========== UserSetting ==========
export const globOptions = { root: 'out/src' };
// load urls
export const urls = configuration.load('tasks', Queue);
configuration.subscribe('tasks', urls);
