import * as fs from 'fs-extra';
import _ = require('lodash');
import Spider from '../../src/core/Spider';

new Spider({
    level: 'log',
    handlers: [{
        pattern: 'https://nodejs.org/api/',
        handle: async function (response) {
            let links = await response.xpath('//*[@id="column2"]/ul[2]//a/@href');
            // TypeError: Cannot read property '1' of null
            // at getDomain (out/src/core/Source.js:33:58)
            this.enqueue(...links.values());
        },
    }],
})
    .enqueue('https://nodejs.org/api/')
    .start()
