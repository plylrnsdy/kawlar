import * as _ from 'lodash';
import { scheduleJob } from 'node-schedule';
import Spider from '../core/Sipder';


Spider.extend({

    construct(data: any) {
        this.repetitive = {};
        let { repetitive } = data;
        repetitive && _.each(repetitive, ([corn, url]) => this.schedule(corn, url));
    },

    methods: {
        schedule(cron: string, url: string) {
            this.repetitive[url] = [scheduleJob(cron, () => this.urls.enqueue(url)), [cron, url]];
        },
        cancelSchedule(url: string) {
            let group = this.repetitive[url];
            if (!group) return;
            group[0].cancel();
        },
        reschedule(url: string) {
            let group = this.repetitive[url];
            if (!group) return;
            group[0].reschedule(true);
        },
        removeSchedule(url: string) {
            this.cancelSchedule(url);
            delete this.repetitive[url];
        },
    } as any,

    toJson(json: any) {
        let keys = Object.keys(this.repetitive),
            l = keys.length,
            entities = [] as [string, string][];
        while (l--) {
            entities.push(this.repetitive[keys[l]][1]);
        }
        json.repetitive = entities;
    }
} as any);
