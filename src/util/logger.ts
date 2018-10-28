import _ = require('lodash');
import * as trailer from 'node-trailer';

interface Logger {
    setLevel(minLevel: string): void
    log(...args: any[]): void
    debug(...args: any[]): void
    info(...args: any[]): void
    warn(...args: any[]): void
    error(...args: any[]): void
    fatal(...args: any[]): void
}

let h5 = trailer.handlers.stack.filterTop(3);
let defaultOptions = trailer.defaultOptions;
(<Function[]>defaultOptions.default.handlers)[4] = h5;
(<Function[]>defaultOptions.debug.handlers)[4] = h5;
(<Function[]>defaultOptions.info.handlers)[4] = h5;
(<Function[]>defaultOptions.warn.handlers)[4] = h5;

const logger = trailer.create();

export default logger as any as Logger;
