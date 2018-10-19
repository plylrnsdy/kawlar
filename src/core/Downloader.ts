import _ = require('lodash');
import fetch from 'node-fetch';
import selectorify from './selector';
import sleep from '../common/sleep';
import Spider from './Spider';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { Request } from 'node-fetch';


export default class Downloader {

    // @ts-ignore
    spider: Spider

    private _running: boolean = false
    private _idle: boolean = true
    private _currentAgent: number = 0

    constructor(private _agents: Array<HttpAgent | HttpsAgent> = []) {
        _agents.push(_agents[0]);
        _agents[0] = undefined as any;
    }

    init() {
        this.spider.on('canFetch', () => {
            this._idle = false;
            this.spider.active && this.start();
        });
    }

    async start() {
        if (this._running) return;
        this._running = true;

        while (true) {
            if (!this.spider.active) break;
            if (this._idle) {
                await sleep(1000);
                continue;
            }

            let uri = this.spider.dequeue();
            if (!uri) {
                this._idle = true;
                continue;
            }

            this.request(uri);
        }
    }

    async request(uri: Request) {
        let handler = this.spider.handlers.search(uri);

        // build request
        _.defaults(uri, handler.headers);
        uri.agent = this.currentAgent(handler.useAgent);
        // request
        let response = await fetch(uri);

        // decorate response
        let res = selectorify(response);
        let items = { $response: res };
        // distribute response
        handler.handle.call(this.spider, res, items);
    }
    private currentAgent(useAgent?: boolean) {
        // Using pseudo random numbers to evenly access agents
        let current = _.random(1, this._agents.length - 1, false);
        return useAgent ? this._agents[current] : undefined;
    }
}
