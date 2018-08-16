import { handlers } from "../seeker";
import { RequestResponse } from "request";
import * as cheerio from 'cheerio';
import * as _ from 'lodash';


handlers.cheerio = {
    parse: {
        inputs: ['response'], output: '$',
        fn: ([response]: [RequestResponse]) => cheerio.load(response.body),
    },
    extract: {
        inputs: ['$'],
        fn: ([$]: [CheerioStatic], [selector, method, arg]: [string, string, any]) =>
            _.map($(selector) as Cheerio, elem => ($(elem) as any)[method](arg)),
    },
}
