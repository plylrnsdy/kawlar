import logger from '../../src/util/logger';
import { SpiderOptions } from '../../src/core/Spider';


export default {
    rateLimit: {
        'httpbin.org': [1, 5]
    },
    handlers: [{
        pattern: '**',
        handle: async function (response) {
            let title = await response.xpath('//h1');
            logger.info(title.text());
            this.enqueue('https://httpbin.org/html');
        },
    }],
    root: __dirname.replace(/out[\/\\]/, '')
} as SpiderOptions
