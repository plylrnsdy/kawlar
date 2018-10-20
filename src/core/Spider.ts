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


interface Stat {
    start: number
    lastestStart: number
    runtime: number
    finish: number

    enqueued: number
    requested: number
    handled: number
    piped: number

    error: number
}

export interface Items extends Record<string, any> {
    $response: Response & Selector
}

export interface IHandler extends Record<string, any> {
    pattern: RegExp | string
    headers?: Request
    useAgent?: boolean
    // TODO: fail then retries
    retries?: number
    handle: (response: Response & Selector, items: Items) => void
    except?: IHandler[]
}

interface SpiderOptions {
    level?: string
    rateLimit?: [number, number] | { [host: string]: [number, number] }
    agents?: Array<HttpAgent | HttpsAgent>
    handlers: IHandler[]
    pipelines?: Array<(items: Items) => void>
}

const noLimit: [number, number] = [-1, -1];

export default class Spider extends EventEmitter {

    private _active: boolean = false
    private _stat: Stat = {
        start: 0,
        lastestStart: 0,
        runtime: 0,
        finish: 0,

        enqueued: 0,
        requested: 0,
        handled: 0,
        piped: 0,

        error: 0,
    }

    private _source: Source
    private _downloader: Downloader
    private _pipeline: Array<(items: Items) => void>

    constructor(options: SpiderOptions) {
        super();
        logger.setLevel(options.level || 'info');
        logger.info('Initializing...');

        let { rateLimit } = options;
        rateLimit
            ? isArray(rateLimit)
                ? rateLimit = { default: rateLimit }
                : rateLimit.default || (rateLimit.default = noLimit)
            : rateLimit = { default: noLimit };
        this._source = new Source(this, rateLimit);

        this._downloader = new Downloader(this, options.agents, new Handler(options.handlers));

        this._pipeline = options.pipelines || [];

        this.on('schedule', (url: string) => logger.log('schedule:', url));
        this.on('enqueue', (url: string) => { ++this._stat.enqueued; logger.log('enqueue:', url); });
        this.on('request', (url: string) => { ++this._stat.requested; logger.log('request:', url); });
        this.on('handle', (url: string) => { ++this._stat.handled; logger.log('handle:', url); });
        this.on('pipe', (url: string) => { ++this._stat.piped; logger.log('pipe:', url); });
    }

    // debounceEmit = _.debounce((event: string) => this.emit(event), 300);

    schedule(cron: string, uri: string | Request) {
        isString(uri) && (uri = new Request(uri));
        this.emit('schedule', uri.url);
        this._source.schedule(cron, uri);
        return this;
    }
    enqueue(...uris: Array<string | Request>) {
        uris = _.map(uris, uri => {
            isString(uri) && (uri = new Request(uri));
            this.emit('enqueue', uri.url);
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
        this._stat.lastestStart = Date.now();
        this._stat.start || (this._stat.start = this._stat.lastestStart);
        this._downloader.start();
        return this;
    }
    stop() {
        this._active = false;
        this._stat.runtime += Date.now() - this._stat.lastestStart;
        return this;
    }
    finish() {
        this.stop();
        this._stat.finish = Date.now();
        return this;
    }

    async pipe(items: Items) {
        if (!this._pipeline) return;

        this.emit('pipe', items.$response.url);
        for (let line of this._pipeline) {
            await line(items);
        }
    }
}
