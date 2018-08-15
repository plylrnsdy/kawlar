import * as _ from 'lodash';
import { handlers } from "../seeker";
import Spider from '../core/Sipder';


handlers.to = {
    urlQueue: {
        inputs: ['spider', 'urls'],
        fn: (spider: Spider, urls: string[]) =>
            _.each(urls, url => spider.urls.enqueue(url)),
    },
    console: {
        fn: (data: string[]) => console.dir(data),
    },
}
