import _ = require('lodash');
import Queue from '../common/collection/Queue';
import Spider from './Spider';
import { Request } from 'node-fetch';
import { scheduleJob, Job } from 'node-schedule';

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

    enqueue(...items: Request[]) {
        items.forEach(uri => {
            if (this._current--) {
                this._callback(this.dequeue() as Request);
            } else {
                super.enqueue(uri);
            }
        });

        return this;
    }
}

function getHost(uri: Request) {
    return (<RegExpMatchArray>uri.url.match(/^https?:\/\/(?:www\.)?([^/]+)/))[1];
}

export default class Source extends Queue<Request> {

    // @ts-ignore
    spider: Spider

    // throttle request by host
    private _throttles: { [host: string]: RequestThrottle }
    private _jobs: Job[] = []

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
                // TODO: put it out of RequestThrottle's while-loop
                this.spider.emit('canFetch');
            }));
        if (defaultLimit) {
            this._throttles.default = {
                enqueue: item => {
                    super.enqueue(item);
                    console.log(this.list.size())
                    // TODO: debounce
                    this.spider.emit('canFetch');
                }
            } as RequestThrottle;
        }

        array && this.enqueue(...array);
    }

    schedule(cron: string, uri: Request) {
        let job = scheduleJob(cron, () => {
            this._throttles.default.enqueue(uri)
        });

        this._jobs.push(job);
        return this;
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
