import Downloader from './Downloader';
import Handler from './Handler';
import logger from '../util/logger';
import Source from './Source';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { EventEmitter } from 'events';
import { isArray, isString } from 'util';
import { Request, Response } from 'node-fetch';
import { Selector } from './selector';
import _ = require('lodash');


export interface Items extends Record<string, any> {
    $response: Response & Selector
}

export interface IHandler extends Record<string, any> {
    pattern: RegExp | string
    headers?: Request
    useAgent?: boolean
    // TODO
    retries?: number
    handle: (response: Response & Selector, items: Items) => void
    except?: IHandler[]
}

interface SpiderOptions {
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
        logger.info('Initializing...');

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

    schedule(cron: string, uri: string | Request) {
        isString(uri) && (uri = new Request(uri));
        logger.log('schedule:', uri.url);
        this._source.schedule(cron, uri);
        return this;
    }
    enqueue(...uris: Array<string | Request>) {
        uris = _.map(uris, uri => {
            isString(uri) && (uri = new Request(uri));
            logger.log('enqueue:', uri.url);
            return uri;
        });
        this._source.enqueue(...uris as Request[]);
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
        logger.info('starting...');
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

        logger.log('piping:', items.$response.url);
        for (let line of pipelines) {
            await line(items);
        }
    }
}
