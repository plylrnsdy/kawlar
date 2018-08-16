import * as _ from 'lodash';
import urlPattern from './common/string/urlPattern';
import Configuration from './core/Configuration';
import * as plugin from './core/plugin';
import Spider from './core/Sipder';
import * as glob from 'glob';


export const configuration = new Configuration('user/');


// ==================== Spider & Extension ====================
export const spiders = new Map<string, Spider>();

_.each(glob.sync('project/*.json', { root: 'user' }), project => {
    let id = (<RegExpMatchArray>project.match(/(.+).json$/))[1];
    Spider.create(id, configuration.load(id));
});

plugin.load('/extension/{**/index,*}.js');



// ==================== Handler ====================
type handler = {
    [key: string]: handler | {
        inputs?: string[]
        args?: any[]
        fn: Function
        output?: string
    }
}
export const handlers: handler = {};

plugin.load('/handler/{**/index,*}.js');



// ==================== Template ====================
export const templates: [RegExp, any][] = [];

export function template(pattern: string | RegExp, pipeline: any) {
    let re = typeof pattern === 'string' ? new RegExp(urlPattern(pattern)) : pattern;
    templates.push([re, pipeline]);
}
export function chain(...links: any[]) {

    // composed functions
    return async function (task: any) {
        let i = 0, len = links.length,
            $inputs: any[], $output: any;
        while (i < len) {
            let { fn, inputs, args = [], output } = links[i++];
            $inputs = _.map(inputs, input => task[input]);
            $output = await fn($inputs, args);
            if ($output instanceof Error) return;
            output && (task[output] = $output);
        }
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

plugin.load('/template/{**/index,*}.js');
