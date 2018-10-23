import _ = require('lodash');
import fetch from 'node-fetch';
import Handler from './Handler';
import Items from './Items';
import selectorify from './selector';
import sleep from '../common/sleep';
import Spider from './Spider';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { Request } from 'node-fetch';


export default class Downloader {

    private _running: boolean = false
    private _idle: boolean = true
    private _downloading: number = 0

    get downloading() {
        return this._downloading;
    }

    constructor(
        private _spider: Spider,
        private _agents: Array<HttpAgent | HttpsAgent> = [],
        private _handler: Handler,
        private _pipelines?: Array<(items: Items) => void>) {

        _spider.on('canFetch', () => {
            this._idle = false;
            this._spider.active && this.start();
        });
        _spider.on('complete', () => this._downloading--)

        _agents.push(_agents[0]);
        _agents[0] = undefined as any;
    }

    async start() {
        if (this._running) return;
        this._running = true;

        while (true) {
            if (!this._spider.active) break;
            if (this._idle) {
                await sleep(1000);
                continue;
            }

            let uri = this._spider.dequeue();
            if (!uri) {
                this._idle = true;
                continue;
            }
            this._downloading++;

            this.request(uri);
        }
    }

    async request(uri: Request) {
        let { url } = uri;
        let handler = this._handler.search(url);

        // build request
        if (handler) {
            _.defaults(uri, handler.headers);
            uri.agent = this.currentAgent(handler.useAgent);
        }
        // request
        this._spider.emit('request', url);
        let response = await fetch(uri);

        // decorate response
        let res = selectorify(response);

        if (handler) {
            this._spider.emit('handle', url);
            let items = new Items(res);
            // distribute response
            await handler.handle.call(this._spider, res, items);

            this.pipe(items);
        }
        this._spider.emit('complete', response.url);
    }
    private currentAgent(useAgent?: boolean) {
        // Using pseudo random numbers to evenly access agents
        let current = _.random(1, this._agents.length - 1, false);
        return useAgent ? this._agents[current] : undefined;
    }

    async pipe(items: Items) {
        if (this._pipelines) {
            this._spider.emit('pipe', items.$response.url);
            for (let line of this._pipelines) {
                await line(items);
            }
        }
    }
}
