import fetch from 'node-fetch';
import { load } from 'cheerio';
import * as _ from 'lodash';


(async function main() {
    // Input: url
    let url = 'http://nodejs.cn/api/';
    // Fetch
    let text = await fetch(url).then(res => res.text());
    // Extract
    let selector = '#column2>ul:first-of-type a::attr(href)'
    let $ = load(text);
    let [sel, pseudoClass] = selector.split('::');
    let [method, arg]= pseudoClass.split(/\(|\)/);
    let urls = _.chain($(sel))
        .map(el => (<any>$(el))[method](arg))
        .map(uri => url + uri)
        .value();
    // Output
    console.dir(urls);
})();
