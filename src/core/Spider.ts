import Downloader from './Downloader';
import Source from './Source';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { EventEmitter } from 'events';
import { isArray, isString } from 'util';
import { Request, Response } from 'node-fetch';
import { Selector } from './selector';
import Handler from './Handler';


export interface Items extends Record<string, any> {
    $response: Response & Selector
}

export interface IHandler extends Record<string, any> {
    pattern: RegExp | string
    headers?: Request
    handle: (response: Response & Selector, items: Items) => void
    except?: IHandler[]
}

interface SpiderOptions {
    /**
     * { 域名: [ 请求数上限, 一段时间内 ]}
     */
    rateLimit?: [number, number] | { [host: string]: [number, number] }
    agents?: Array<HttpAgent | HttpsAgent>
    handlers: IHandler[]
    pipelines?: Array<(items: Items) => void>
}

const noLimit: [number, number] = [-1, -1]

export default class Spider extends EventEmitter {

    private _active: boolean = false

    private _source: Source
    private _downloader: Downloader
    handlers: Handler

    constructor(private options: SpiderOptions) {
        super();

        let rateLimit = options.rateLimit;
        rateLimit
            ? isArray(rateLimit) && (rateLimit = { default: rateLimit })
            : rateLimit = { default: noLimit };
        this._source = new Source(rateLimit);
        this._source.spider = this;
        delete options.rateLimit;

        this._downloader = new Downloader(options.agents);
        this._downloader.spider = this;
        this._downloader.init();
        delete options.agents;

        this.handlers = new Handler(options.handlers);
        delete options.handlers;
    }

    enqueue(uri: string | Request) {
        isString(uri) && (uri = new Request(uri));
        this._source.enqueue(uri);
        return this;
    }
    dequeue() {
        return this._source.dequeue();
    }
    isEmpty() {
        return this._source.isEmpty();
    }

    get active() {
        return this._active;
    }
    start() {
        this._active = true;
        this._downloader.start();
        return this;
    }
    stop() {
        this._active = false;
        return this;
    }

    async pipe(items: Items) {
        let { pipelines } = this.options;
        if (!pipelines) return;

        for (let line of pipelines) {
            await line(items);
        }
    }
}
