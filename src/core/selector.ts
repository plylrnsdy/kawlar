import { Response } from 'node-fetch';
import { load, Selector, SelectorList } from 'xselector';


export interface ISelector {
    css(selector: string): Promise<SelectorList>
    xpath(path: string): Promise<SelectorList>
    regexp(regexp: RegExp | string): Promise<string>
    regexps(regexp: RegExp | string): Promise<string[]>
}

const SELECTOR = Symbol();

export default function selectorify(response: Response): Response & ISelector {
    let res = response as Response & ISelector;
    Object.assign(res, {
        css: loadOnce((self: any, selector: string) => self[SELECTOR].css(selector)),
        xpath: loadOnce((self: any, path: string) => self[SELECTOR].xpath(path)),
        regexp: loadOnce((self: any, re: string | RegExp) => self[SELECTOR].regexp(re)),
        regexps: loadOnce((self: any, re: string | RegExp) => self[SELECTOR].regexps(re)),
    });
    return res;
}

function loadOnce(fn: Function) {
    return async function () {
        // @ts-ignore
        let self = this as Response & ISelector & { [SELECTOR]: Selector };
        if (!self[SELECTOR]) {
            self[SELECTOR] = load(await self.text());
        }
        return fn(self, ...arguments);
    }
}
