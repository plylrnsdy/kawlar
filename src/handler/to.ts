import * as _ from 'lodash';
import { handlers } from "../seeker";
import Spider from '../core/Sipder';


handlers.to = {
    urlQueue: {
        inputs: ['urls'],
        fn: function ([urls]: [string[]]) {
            this.add(...urls);
        },
    },
    console: {
        fn: ([data]: [string[]]) => console.dir(data),
    },
}
