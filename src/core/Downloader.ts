import _ = require('lodash');
import fetch from 'node-fetch';
import logger from '../util/logger';
import Handler from './Handler';
import selectorify from './selector';
import sleep from '../common/sleep';
import Spider from './Spider';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { Request } from 'node-fetch';


export default class Downloader {

    private _running: boolean = false
    private _idle: boolean = true

    constructor(
        private _spider: Spider,
        private _agents: Array<HttpAgent | HttpsAgent> = [],
        private _handler: Handler) {

        _spider.on('canFetch', () => {
            this._idle = false;
            this._spider.active && this.start();
        });

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

            this.request(uri);
        }
    }

    async request(uri: Request) {
        let { url } = uri;
        let handler = this._handler.search(url);

        // build request
        _.defaults(uri, handler.headers);
        uri.agent = this.currentAgent(handler.useAgent);
        // request
        this._spider.emit('request', url);
        let response = await fetch(uri);

        // decorate response
        let res = selectorify(response);
        let items = { $response: res };
        // distribute response
        this._spider.emit('handle', url);
        handler.handle.call(this._spider, res, items);
    }
    private currentAgent(useAgent?: boolean) {
        // Using pseudo random numbers to evenly access agents
        let current = _.random(1, this._agents.length - 1, false);
        return useAgent ? this._agents[current] : undefined;
    }
}
