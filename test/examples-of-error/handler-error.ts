import _ = require('lodash');
import Spider from '../../src/core/Spider';

new Spider({
    level: 'log',
    handlers: [{
        pattern: 'https://nodejs.org/api/*',
        handle: async function (response, items) {
            items.pack({
                html: {
                    title: (await response.css('title')).text(),
                    // Error: Unexpected character `#`
                    // at Response.xpath (out/src/core/selector.js:22:16)
                    body: (await response.xpath('#column1>div')).html(),
                }
            });
        },
    }],
})
    .enqueue('https://nodejs.org/api/assert.html')
    .start()
