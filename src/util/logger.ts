import * as tracer from 'tracer';

interface Logger {
    setLevel(level: string): void

    log(...args: any[]): void
    trace(...args: any[]): void
    debug(...args: any[]): void
    info(...args: any[]): void
    warn(...args: any[]): void
    error(...args: any[]): void
    fatal(...args: any[]): void
}

const logger = tracer.colorConsole({
    level: 0,
    format: ['[{{timestamp}} {{title}}] {{message}}    @ {{method}} ({{file}}:{{line}})',
        {
            info: '[{{timestamp}} {{title}}] {{message}}',
            error: '[{{timestamp}} {{title}}] @ {{method}} ({{file}}:{{line}})\n    {{message}}\n    ----------\n{{stack}}'
        }],
    dateformat: 'yyyy-mm-dd_hh:MM:ss',
    preprocess: (data: any) => data.title = data.title.toUpperCase(),
}) as any as Logger;

logger.setLevel = tracer.setLevel;

export default logger;
