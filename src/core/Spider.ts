import * as fs from 'fs-extra';
import * as path from 'path';
import _ = require('lodash');
import Downloader from './Downloader';
import Handler from './Handler';
import Items from './Items';
import logger from '../util/logger';
import Source from './Source';
import stringify from '../common/stringify';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { EventEmitter } from 'events';
import { isArray, isString } from 'util';
import { Request, Response } from 'node-fetch';
import { ISelector } from './selector';


interface Stat {
    start: number
    lastestStart: number
    runtime: number
    finish: number

    enqueued: number
    requested: number
    handled: number
    piped: number
    completed: number

    error: number
}

export interface IHandler extends Record<string, any> {
    pattern: RegExp | string
    headers?: Request
    useAgent?: boolean
    // TODO: fail then retries
    retries?: number
    handle: (response: Response & ISelector, items: Items) => void
    except?: IHandler[]
}

export interface SpiderOptions {
    level?: string
    // TODO: de-duplication
    isDuplicate?: (uri: Request) => boolean
    rateLimit?: [number, number] | { [domain: string]: [number, number] }
    agents?: Array<HttpAgent | HttpsAgent>
    handlers?: IHandler[]
    pipelines?: Array<(items: Items) => void>
    root?: string
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
        completed: 0,

        error: 0,
    }
    private _dataFileName: string = 'project.json'

    private _source: Source
    private _downloader: Downloader
    private _root: string

    constructor(options: SpiderOptions = {}) {
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

        this._downloader = new Downloader(this, options.agents, new Handler(options.handlers), options.pipelines);

        this._root = options.root || __dirname;
        let dataPath = path.join(this._root, this._dataFileName);
        if (fs.existsSync(dataPath)) {
            let { stat, source: { jobs, queue } } = fs.readJsonSync(dataPath);
            this._stat = stat;
            for (let [cron, uri] of jobs) {
                this.schedule(cron, uri);
            }
            this.enqueue(...queue);
        }

        this.on('schedule', (url: string) => logger.log('Schedule:', url));
        this.on('enqueue', (url: string) => { ++this._stat.enqueued; logger.log('Enqueue:', url); });
        this.on('request', (url: string) => { ++this._stat.requested; logger.log('Request:', url); });
        this.on('handle', (url: string) => { ++this._stat.handled; logger.log('Handle:', url); });
        this.on('pipe', (url: string) => { ++this._stat.piped; logger.log('Pipe:', url); });
        this.on('complete', (url: string) => { ++this._stat.completed; logger.log('Complete:', url); });

        this.on('start', () => {
            logger.info('Starting...');
            this._stat.lastestStart = Date.now();
            this._stat.start || (this._stat.start = this._stat.lastestStart);
        });
        this.on('stop', () => {
            logger.info('Stoping...');
            this._stat.runtime += Date.now() - this._stat.lastestStart;
        });
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

    get stat() {
        return Object.assign({}, this._stat);
    }
    get active() {
        return this._active;
    }
    start() {
        this.emit('start');
        this._active = true;
        this._downloader.start();
        return this;
    }
    stop() {
        this._active = false;
        this.emit('stop');
        this._save();
        return this;
    }
    async finish() {
        this.stop();
        this._stat.finish = Date.now();
        this.emit('finish');
        setInterval(() => !this._downloader.downloading && process.exit(), 300);
    }
    private _save() {
        let data = this.toString();
        fs.writeFileSync(path.join(this._root, this._dataFileName), data);
    }
    toString() {
        return stringify({
            stat: this._stat,
            source: this._source,
        });
    }
}
