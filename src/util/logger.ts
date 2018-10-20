import * as tracer from 'tracer';


const logger = tracer.colorConsole({
    level: 0,
    format: ['[{{timestamp}} {{title}}] {{message}}    @ {{method}} ({{file}}:{{line}})',
        {
            info: '[{{timestamp}} {{title}}] {{message}}',
            error: '[{{timestamp}} {{title}}] @ {{method}} ({{file}}:{{line}})\n    {{message}}\n    ----------\n{{stack}}'
        }],
    dateformat: 'yyyy-mm-dd_hh:MM:ss',
    preprocess: (data: any) => data.title = data.title.toUpperCase(),
});

export default logger;
