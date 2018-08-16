import * as glob from 'glob';

const globOptions = { root: 'out/src' };

export function load(globs: string) {

    let plugins = glob.sync(globs, globOptions),
        l = plugins.length;

    while (l--) require(plugins[l]);
}

