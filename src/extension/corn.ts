import * as _ from 'lodash';
import { scheduleJob } from 'node-schedule';
import Spider from '../core/Sipder';


_.assign(Spider.prototype, {
    schedule: function (cron: string, url: string) {
        this.repetitive[url] = [scheduleJob(cron, () => this.urls.enqueue(url)), [cron, url]];
    },
    cancel: function (url: string) {
        let group = this.repetitive[url];
        if (!group) return;
        group[0].cancel();
        delete this.repetitive[url];
    }
} as any);

Spider.deserialize.push(function (data: any) {
    // @ts-ignore
    this.repetitive = {};
    let { repetitive } = data;
    // @ts-ignore
    repetitive && _.each(repetitive, ([corn, url]) => this.schedule(corn, url));
});

Spider.serialize.push(function (json: any) {
    // @ts-ignore
    let keys = Object.keys(this.repetitive),
        l = keys.length,
        entities = [] as [string, string][];
    while (l--) {
        // @ts-ignore
        entities.push(this.repetitive[keys[l]][1]);
    }
    json.repetitive = entities;
});

