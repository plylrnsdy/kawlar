import _ = require('lodash');
import Queue from '../common/collection/Queue';
import Spider from './Spider';
import { Request } from 'node-fetch';

class RequestThrottle extends Queue<Request> {

    private _timer: NodeJS.Timeout
    private _current: number = 0

    constructor(private _limit: number, private _time: number, private _callback: (uri: Request) => void) {
        super();

        this._timer = setInterval(() => {
            this._current = _limit;
            while (!this.isEmpty() && this._current--) {
                _callback(this.dequeue() as Request);
            }
        }, _time);
    }
}

function getHost(uri: Request) {
    return (<RegExpMatchArray>uri.url.match(/^https?:\/\/(?:www\.)?([^/]+)/))[1];
}

export default class Source extends Queue<Request> {

    // @ts-ignore
    spider: Spider

    // 域请求对象节流
    private _throttles: { [host: string]: RequestThrottle }

    constructor(rateLimit: { [host: string]: [number, number] }, array?: Request[]) {
        super();

        let defaultLimit;
        if (rateLimit.default[0] === -1) {
            defaultLimit = rateLimit.default;
            delete rateLimit.default;
        }
        this._throttles = _.mapValues(rateLimit, ([limit, time]) =>
            new RequestThrottle(limit, time, item => {
                super.enqueue(item);
                // TODO: 放到 RequestThrottle while 外
                this.spider.emit('canFetch');
            }));
        if (defaultLimit) {
            this._throttles.default = {
                enqueue: item => {
                    super.enqueue(item);
                    this.spider.emit('canFetch');
                }
            } as RequestThrottle;
        }

        array && this.enqueue(...array);
    }

    enqueue(...items: Request[]) {
        items.forEach(uri => {
            let host = getHost(uri);
            let key = host in this._throttles ? host : 'default';
            this._throttles[key].enqueue(uri);
        });

        return this;
    }

    toArray() {
        return _.chain(this._throttles)
            .map(item => item.toArray())
            .push(this.list.toArray())
            .flatten()
            .value();
    }
}
