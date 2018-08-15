import * as _ from 'lodash';
import urlPattern from './common/string/urlPattern';
import Configuration from './core/Configuration';
import * as plugin from './core/plugin';
import Spider from './core/Sipder';
import * as glob from 'glob';


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
    let funcs = _.map(links.reverse(), mapResult);

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


// ========== UserSetting ==========
export const globOptions = { root: 'out/src' };


export const configuration = new Configuration('user/');


plugin.load('/extension/{**/index,*}.js');
plugin.load('/handler/{**/index,*}.js');
plugin.load('/template/{**/index,*}.js');


export const spiders = new Map<string, Spider>();
export function create(name: string, data?: any) {
    let spider = new Spider(data);
    spiders.set(name, spider);
    configuration.subscribe('project/' + name, spider);
}
export function remove(name: string) {
    configuration.unsubscribe('project/' + name);
    spiders.delete(name);
}
let projects = glob.sync('user/project/*.json');
_.each(projects, project => {
    let name = (<RegExpMatchArray>project.match(/user\/project\/(.+).json$/))[1];
    create(name, configuration.load('project/' + name));
});
