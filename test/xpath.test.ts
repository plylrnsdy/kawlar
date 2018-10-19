import * as _ from 'lodash';
import fetch from 'node-fetch';
import xPath = require('xpath');
import { DOMParser } from 'xmldom';


(async function main() {
    // Input: url
    let url = 'http://nodejs.cn/api/';
    // Fetch
    let text = await fetch(url).then(res => res.text());
    // Extract
    let doc = new DOMParser({ errorHandler: _.noop }).parseFromString(text);
    let path = '//*[@id="column2"]/ul[1]//a/@href'
    let isAttr = !!path.match(/\/@[^/]$/);
    let urls = _.chain(xPath.select(path, doc))
        .map((uri: any) => isAttr ? uri.value : uri.nodeValue)
        .map(uri => url + uri)
        .value();
    // Output
    console.dir(urls);
})();
