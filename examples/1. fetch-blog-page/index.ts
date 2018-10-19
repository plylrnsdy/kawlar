import * as fs from 'fs-extra';
import * as path from 'path';
import Spider from '../../src/core/Spider';
import logger from '../../src/util/logger';
// @ts-ignore
import TurndownService = require('turndown');
// @ts-ignore
import turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.gfm);

new Spider({
    handlers: [{
        pattern: 'https://github.com/*/*',
        handle: function (response, items) {
            response
                .xpath('//article')
                .then(page => {
                    items.markdown = page as string;
                    this.pipe(items);
                });
        },
    }],
    pipelines: [
        items => {
            if (!items.markdown) return;

            items.file = turndownService.turndown(items.markdown);
            items.extension = 'md';
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
    .enqueue('https://github.com/plylrnsdy/seeker')
    .start()
