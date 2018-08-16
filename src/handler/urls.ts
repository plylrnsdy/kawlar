import { handlers } from "../seeker";
import * as _ from 'lodash';


handlers.urls = {
    resolve: {
        inputs: ['url', 'urls'], output: 'urls',
        fn: ([host, rUrls]: [string, string[]]) => _.map(rUrls, link => host + link),
    },
}
