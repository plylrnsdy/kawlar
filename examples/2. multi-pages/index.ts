import * as fs from 'fs-extra';
import * as path from 'path';
import _ = require('lodash');
import Spider from '../../src/core/Spider';
import logger from '../../src/util/logger';

new Spider({
    level: 'log',
    handlers: [{
        pattern: 'https://nodejs.org/api/',
        handle: async function (response, items) {
            let links = await response.xpath('//*[@id="column2"]/ul[2]//a/@href');
            this.enqueue(..._.map(links, link => response.url + link));
        },
    }, {
        pattern: 'https://nodejs.org/api/*',
        handle: async function (response, items) {
            this.pipe(items.pack({
                html: await response.cssModel({
                    title: 'title::text()',
                    body: '#column1>div::html()'
                })
            }));
        },
    }],
    pipelines: [
        items => {
            if (!items.html) return;

            items.file = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<title>${items.html.title}</title>\n</head>\n<body>\n${items.html.body}\n</body>\n</html>`;
            items.extension = 'html';
        },
        items => {
            if (!items.file) return;

            let root = __dirname.replace('out\\', ''),
                file = path.join(root, (<RegExpMatchArray>items.$response.url.match(/^https?:\/\/(?:www\.)?([^?#]+)/))[1]),
                dir = file.replace(/[^\\]+$/, match => {
                    if (items.extension && !match.endsWith(items.extension))
                        file = `${file}.${items.extension}`;
                    return '';
                });

            try {
                !fs.existsSync(dir) && fs.mkdirpSync(dir);
                fs.writeFileSync(file, items.file);
            } catch (error) {
                logger.error(error);
            }
        },
    ],
})
    .enqueue('https://nodejs.org/api/')
    .start()
