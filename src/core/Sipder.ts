import stringify from "../common/stringify";
import Queue from "../common/collection/Queue";
import { templates, spiders, configuration, actives } from "../seeker";
import * as _ from "lodash";
import sleep from "../common/sleep";

type extension = {
    construct: (data: any) => void
    methods: { [x: string]: any }
    toJson: (json: any) => void
}

export default class Spider {

    // ==================== Base Definition ====================

    [x: string]: any

    constructor(data: any = {}) {
        _.each(Spider.constructors, d => d.call(this, data));
    }

    toString() {
        let json = {};
        _.each(Spider.toJsonFuncs, d => d.call(this, json));
        stringify(json);
    }

    // ==================== Extension ====================

    static constructors: ((data: any) => void)[] = [];
    static toJsonFuncs: ((data: any) => void)[] = [];

    static extend({ methods, construct, toJson }: extension) {
        Object.assign(Spider.prototype, methods);
        Spider.constructors.push(construct);
        Spider.toJsonFuncs.push(toJson);
    }

    // ==================== Manage ====================

    static create(name: string, data: any) {
        let spider = new Spider(data);
        spiders[name] = spider;
        configuration.subscribe(name + '/project', spider);
    }
    static remove(name: string) {
        configuration.unsubscribe(name + '/project');
        delete spiders[name];
    }
}


Spider.extend({

    construct({ name, active, idle, maxConnections, urls }: any) {
        this.name = name;
        this.active = active || false;
        this.idle = idle || true;
        // Maximum concurrent connections
        this.maxConnections = maxConnections || 3;
        this.urls = new Queue(urls);
        this.fetching = new Map<string, Function>();
    },

    methods: {
        add(...urls: string[]) {
            this.urls.enqueue(...urls);
            this.idle = false;
        },
        async start() {
            this.active = true;
            if (actives.indexOf(this.name) < 0) actives.push(this.name);
            if (!this.urls.isEmpty()) this.idle = false;

            run: while (true) {
                if (!this.active) break;
                if (this.idle || this.fetching.size >= this.maxConnections) {
                    await sleep(1000);
                    continue;
                }

                let url = this.urls.dequeue();
                if (!url) {
                    this.idle = true;
                    continue;
                }

                for (const [re, pl] of templates) {
                    if (re.test(url)) {
                        let id = _.uniqueId();
                        this.fetching.set(id, pl({ id, spider: this, url }));
                        continue run;
                    }
                }
                console.error('No handlers for url: ' + url);
            }
        },
        stop() {
            this.active = false;
            actives.splice(actives.indexOf(this.name), 1);
        },
        resolve(id: number) {
            this.fetching.delete(id);
        }
    } as any,

    toJson(json: any) {
        json.name = this.name;
        json.maxConnections = this.maxConnections;
        json.urls = this.urls;
    },
} as any);
