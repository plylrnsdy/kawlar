import * as _ from 'lodash';
import { handlers } from "../seeker";
import Spider from '../core/Sipder';


handlers.to = {
    urlQueue: {
        inputs: ['spider', 'urls'],
        fn: ([spider, urls]: [Spider, string[]]) => spider.add(...urls),
    },
    console: {
        fn: ([data]: [string[]]) => console.dir(data),
    },
}
