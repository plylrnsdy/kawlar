import * as micromatch from 'micromatch';
import { IHandler, Items } from './Spider';
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

        // @ts-ignore
        this._tree = tree as IRegExpHandler[];
    }

    search(uri: Request): IRegExpHandler {
        let match: IRegExpHandler | undefined = undefined;
        let handlers = this._tree;

        find: do {
            for (let handler of handlers)
                if (handler.pattern.test(uri.url)) {
                    match = handler;
                    if (handler.except) handlers = handler.except; else break find;
                }
        } while (match);

        if (!match) throw new Error(`No handler for: ${uri.url}`);

        return match;
    }
}
