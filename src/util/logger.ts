import * as tracer from 'tracer';


const logger = tracer.colorConsole({
    level: 0,
    format: ['[{{timestamp}} {{title}}] @ {{method}} ({{file}}:{{line}})\n    {{message}}',
        {
            error: '[{{timestamp}} {{title}}] @ {{method}} ({{file}}:{{line}})\n    {{message}}\n    ----------\n{{stack}}'
        }],
    preprocess: (data: any) => data.title = data.title.toUpperCase(),
});

export default logger;
