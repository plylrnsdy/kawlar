import { handlers } from "../seeker";
import * as _ from 'lodash';


handlers.urls = {
    resolve: {
        inputs: ['url', 'urls'], output: 'urls',
        fn: (host: string, rUrls: string[]) => _.map(rUrls, link => host + link),
    },
}
