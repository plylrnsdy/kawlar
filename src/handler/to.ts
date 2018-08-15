import * as _ from 'lodash';
import { handlers, urls as Urls } from "../seeker";


handlers.to = {
    urlQueue: {
        inputs: ['urls'],
        fn: (urls: string[]) => _.each(urls, url => Urls.enqueue(url)),
    },
    console: {
        fn: (data: string[]) => console.dir(data),
    },
}
