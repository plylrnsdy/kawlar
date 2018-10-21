import _ = require('lodash');
import Queue from '../common/collection/Queue';
import Spider from './Spider';
import stringify from '../common/stringify';
import { Request } from 'node-fetch';
import { scheduleJob, Job } from 'node-schedule';

class RequestThrottle extends Queue<Request> {

    private _timer: NodeJS.Timeout
    private _current: number = 0

    constructor(private _limit: number, private _time: number, private _callback: (...uris: Request[]) => void) {
        super();

        this._timer = setInterval(() => {
            this._current = this._limit;
            let uris: Request[] = [];
            while (!this.isEmpty() && this._current--) {
                uris.push(this.dequeue() as Request);
            }

            _callback.apply(null, uris);

        }, _time * 1000);
    }

    enqueue(...items: Request[]) {
        let uris: Request[] = [];
        items.forEach(uri =>
            this._current--
                ? uris.push(this.dequeue() as Request)
                : super.enqueue(uri));

        this._callback.apply(null, uris);
        return this;
    }
}

function getHost(uri: Request) {
    return (<RegExpMatchArray>uri.url.match(/^https?:\/\/(?:www\.)?([^/]+)/))[1];
}

export default class Source extends Queue<Request> {

    // throttle request by host
    private _throttles: { [host: string]: RequestThrottle }
    private _jobs: Array<Job & { _cron: string, _uri: string }> = []

    constructor(private _spider: Spider, rateLimits: { [host: string]: [number, number] }) {
        super();

        let noDefaultLimit;
        if (rateLimits.default[0] === -1) {
            noDefaultLimit = true;
            delete rateLimits.default;
        }
        this._throttles = _.mapValues(rateLimits, ([limit, time]) =>
            new RequestThrottle(limit, time, (...items: Request[]) => {
                super.enqueue(...items);
                this._spider.emit('canFetch');
            }));
        if (noDefaultLimit) {
            this._throttles.default = {
                enqueue: item => {
                    super.enqueue(item);
                    // XXX: debounce ?
                    // this._spider.debounceEmit('canFetch');
                    this._spider.emit('canFetch');
                },
                toArray: () => this.list.toArray(),
            } as RequestThrottle;
        }
    }

    schedule(cron: string, uri: Request) {
        let job = scheduleJob(cron, () =>
            this._throttles.default.enqueue(uri)) as Job & { _cron: string, _uri: string };

        job._cron = cron;
        job._uri = uri.url;

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
        throw new Error('Source can\'t tranform to Array.');
        return [];
    }
    toString() {
        return stringify({
            jobs: _.map(this._jobs, job => [job._cron, job._uri]),
            queue: _.chain(this._throttles)
                .map(item => item.toArray())
                .flatten()
                .map(request => request.url)
                .value()
        });
    }
}
