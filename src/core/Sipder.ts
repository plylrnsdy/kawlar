import stringify from "../common/stringify";
import Queue from "../common/collection/Queue";
import { templates } from "../seeker";
import * as _ from "lodash";

type extension = {
    construct: (data: any) => void
    methods: { [x: string]: any }
    toJson: (json: any) => void
}

export default class Spider {

    static constructors: ((data: any) => void)[] = [];
    static toJsonFuncs: ((data: any) => void)[] = [];

    static extend({ methods, construct, toJson }: extension) {
        Object.assign(Spider.prototype, methods);
        Spider.constructors.push(construct);
        Spider.toJsonFuncs.push(toJson);
    }

    [x: string]: any

    constructor(data: any = {}) {
        _.each(Spider.constructors, d => d.call(this, data));
    }

    toString() {
        let json = {};
        _.each(Spider.toJsonFuncs, d => d.call(this, json));
        stringify(json);
    }
}


Spider.extend({

    construct({ name, urls }: any) {
        this.name = name;
        this.urls = new Queue(urls || []);
    },

    methods: {
        addUrls(...urls: string[]) {
            this.urls.enqueue(...urls);
        },
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
    } as any,

    toJson(json: any) {
        json.name = this.name;
        json.urls = this.urls;
    },
} as any);
