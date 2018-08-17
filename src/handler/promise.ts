import * as _ from 'lodash';
import { handlers } from "../seeker";
import Spider from '../core/Sipder';


handlers.promise = {
    resolve: {
        inputs: ['spider', 'id'],
        fn: ([spider, id]: [Spider, number]) => spider.resolve(id),
    },
}
