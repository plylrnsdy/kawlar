import * as _ from 'lodash';
import * as seeker from "../seeker";
import { scheduleJob, Job } from 'node-schedule';
import stringify from '../common/stringify';

const { urls, configuration } = seeker;

class Cron {

    private repetitive: { [url: string]: [Job, [string, string]] } = {};

    constructor(entities?: [string, string][]) {
        entities && _.each(entities, ([corn, url]) => this.schedule(corn, url));
    }

    schedule(cron: string, url: string) {
        this.repetitive[url] = [scheduleJob(cron, () => urls.enqueue(url)), [cron, url]];
    }
    cancel(url: string) {
        let group = this.repetitive[url];
        if (!group) return;
        group[0].cancel();
        delete this.repetitive[url];
    }

    toString() {
        let keys = Object.keys(this.repetitive),
            l = keys.length,
            array = [] as [string, string][];
        while (l--) {
            array.push(this.repetitive[keys[l]][1]);
        }
        return stringify(array);
    }
}

// load configuration
const cron = configuration.load('repetitive', Cron);
configuration.subscribe('repetitive', cron);

// setup to seeker
_.assign(seeker, { cron });
