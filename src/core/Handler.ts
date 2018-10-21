import * as micromatch from 'micromatch';
import Items from './Items';
import { IHandler } from './Spider';
import { isString } from 'util';
import { Request, Response } from 'node-fetch';
import { Selector } from './selector';


interface IRegExpHandler {
    pattern: RegExp
    headers?: Request
    useAgent?: boolean
    handle: (response: Response & Selector, items: Items) => void
    except?: IRegExpHandler[]
}

export default class Handler {

    private _tree: IRegExpHandler[]

    constructor(tree: IHandler[]) {
        let handlers = tree.slice();
        let handler;
        while (handler = handlers.pop()) {
            isString(handler.pattern) && (handler.pattern = micromatch.makeRe(handler.pattern));
            handler.except && handlers.push(...handler.except);
        }

        this._tree = tree as any as IRegExpHandler[];
    }

    search(url: string): IRegExpHandler {
        let match: IRegExpHandler | undefined = undefined;
        let handlers = this._tree;

        find: do {
            for (let handler of handlers)
                if (handler.pattern.test(url)) {
                    match = handler;
                    if (handler.except) handlers = handler.except; else break find;
                }
        } while (match);

        if (!match) throw new Error(`No handler for: ${url}`);

        return match;
    }
}
