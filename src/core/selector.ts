import _ = require('lodash');
import xPath = require('xpath');
import * as cheerio from 'cheerio';
import { DOMParser } from 'xmldom';
import { Response } from 'node-fetch';
import { isString } from 'util';


interface Model<T> {
    [key: string]: T | Model<T>
}
interface Result<T> {
    [key: string]: T | Result<T>
}

export interface Selector {
    css: {
        (selector: string): Promise<string | string[]>
        model(model: Model<string>): Promise<Result<string | string[]>>
    }
    xpath: {
        (path: string): Promise<string | string[]>
        model(model: Model<string>): Promise<Result<string | string[]>>
    }
    re: {
        (regexp: RegExp | string): Promise<string>
        model(model: Model<RegExp | string>): Promise<Result<string>>
    }
}

export default function selectorify(response: Response): Response & Selector {
    let res = response as Response & Selector
    res.css = css;
    res.xpath = xpath;
    res.re = re;
    return res;
}

async function css(selector: string) {
    // @ts-ignore
    let self = this as Response & Selector & { _text: string, $: CheerioStatic };

    if (!self.$) {
        if (!self._text) {
            self._text = await self.text();
        }
        // TODO: encoding, entities
        self.$ = cheerio.load(self._text);
    }
    let { $ } = self;
    // handle: 'selector::method(arg)'
    let [sel, pseudoClass] = selector.split('::');
    let [method, arg] = pseudoClass.split(/\(|\)/);

    let results = _.map($(sel), el => (<any>$(el))[method](arg));
    return results.length
        ? results.length === 1 ? results[0] : results
        : '';
}
css.model = async function cssModel(model: Model<string>): Promise<Result<string | string[]>> {
    // @ts-ignore
    let self = this as Response & Selector;
    let models = [model];
    let sub;

    while (sub = models.pop()) {
        for (let prop in sub) {
            let value = sub[prop];
            isString(value)
                ? (<string | string[]>sub[prop]) = await self.css(value)
                : models.push(value);
        }
    }
    return model;
}
async function xpath(path: string): Promise<string | string[]> {
    // @ts-ignore
    let self = this as Response & Selector & { _text: string, _dom: Document };

    if (!self._text) {
        self._text = await self.text();
    }
    if (!self._dom) {
        self._dom = new DOMParser({ errorHandler: _.noop }).parseFromString(self._text);
    }

    let isAttr = /\/@[^/]$/.test(path);
    let selected = xPath.select(path, self._dom);
    let results = _.map(selected, (selected: any) => isAttr ? selected.value : selected.toString());
    return results.length
        ? results.length === 1 ? results[0] : results
        : '';
}
xpath.model = async function xpathModel(model: Model<string>): Promise<any> {
    // @ts-ignore
    let self = this as Response & Selector;
    let models = [model];
    let sub;

    while (sub = models.pop()) {
        for (let prop in sub) {
            let value = sub[prop];
            isString(value)
                ? (<string | string[]>sub[prop]) = await self.xpath(value)
                : models.push(value);
        }
    }
    return model;
}
async function re(regexp: RegExp | string) {
    // @ts-ignore
    let self = this as Response & Selector & { _text: string };

    if (!self._text) {
        self._text = await self.text();
    }
    let match = self._text.match(regexp);
    return match ? match[0] : '';
}
re.model = async function reModel(model: Model<RegExp | string>): Promise<any> {
    // @ts-ignore
    let self = this as Response & Selector;
    let models = [model];
    let sub;

    while (sub = models.pop()) {
        for (let prop in sub) {
            let value = sub[prop];
            _.isString(value) || _.isRegExp(value)
                ? sub[prop] = await self.re(value)
                : models.push(value);
        }
    }
    return model;
}
