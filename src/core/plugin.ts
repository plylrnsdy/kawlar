import * as glob from 'glob';
import { globOptions } from '../seeker';


export function load(globs: string) {

    let plugins = glob.sync(globs, globOptions),
        l = plugins.length;

    while (l--) require(plugins[l]);
}

