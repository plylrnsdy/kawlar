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

const logger = trailer.create();

export default logger as any as Logger;
