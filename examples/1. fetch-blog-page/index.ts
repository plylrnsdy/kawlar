import * as fs from 'fs-extra';
import * as path from 'path';
import Spider from '../../src/core/Spider';
import logger from '../../src/util/logger';


new Spider({
    handlers: [{
        pattern: 'https://segmentfault.com/*',
        handle: function (response, items) {
            response
                .xpath('//*[contains(@class,"page-fmt")]/*[position()<last()-2]')
                .then(page => {
                    items.markdown = (page as string[]).join('');
                    this.pipe(items);
                });
        },
    }],
    pipelines: [
        items => {
            if (!items.markdown) return;

            items.file = 
            items.extension = 'md';
        },
        items => {
            if (!items.file) return;

            let root = __dirname.replace('out\\', ''),
                file = path.join(root, (<RegExpMatchArray>items.$response.url.match(/^https?:\/\/(?:www\.)?([^?#]+)/))[1]),
                dir = file.replace(/[^\\]+$/, match => {
                    if (!match.endsWith(items.extension))
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
    .enqueue('https://segmentfault.com/markdown')
    .start()
