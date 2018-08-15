import stringify from "../common/stringify";
import Queue from "../common/collection/Queue";
import { templates } from "../seeker";
import * as _ from "lodash";

export default class Spider {

    static deserialize: ((data: any) => void)[] = [];
    static serialize: ((data: any) => void)[] = [];

    [x: string]: any

    constructor(data?: any) {
        let instance = Object.assign(Object.create(Spider.prototype), data) as Spider;
        instance.constructor = Spider;
        instance.urls = new Queue(instance.urls || []);
        _.each(Spider.deserialize, d => d.call(instance, data));
        return instance;
    }

    async fetch() {
        let url = this.urls.dequeue();
        if (!url) return false;

        for (const [re, pl] of templates) {
            if (re.test(url)) {
                await pl({ spider: this, url });
                return true;
            }
        }

        console.error('No handlers for url: ' + url);
        return true;
    }

    toString() {
        let json = { urls: this.urls }
        _.each(Spider.serialize, d => d.call(this, json));
        stringify(json);
    }
}
