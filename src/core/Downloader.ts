import _ = require('lodash');
import fetch from 'node-fetch';
import selectorify from './selector';
import sleep from '../common/sleep';
import Spider from './Spider';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import { Request, Response } from 'node-fetch';
import { Selector } from './selector';


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
        this.spider.on('canFetch', () => this.spider.active && this.start());
    }

    async start() {
        if (this._running) return;
        this._running = true;

        if (!this.spider.isEmpty()) this._idle = false;

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
        if (!handler) throw new Error(`No handler for: ${uri.url}`);

        // build request
        _.defaults(uri, handler.headers);
        uri.agent = this.currentAgent();
        // request
        let response = await fetch(uri);

        // decorate response
        let res = selectorify(response);
        let items = { $response: res };
        // distribute response
        handler.handle.call(this.spider, res, items);
    }
    private currentAgent() {
        // TODO: 使用伪随机数列均匀访问代理?
        let current = this._currentAgent++;
        if (this._currentAgent >= this._agents.length) this._currentAgent = 0;
        return this._agents[current];
    }
}
