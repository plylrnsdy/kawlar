import * as _ from 'lodash';
import Http from './Http';
import { handlers } from "../../seeker";
import Spider from '../../core/Sipder';

const http = new Http();

handlers.request = {
    inputs: ['spider', 'url'], output: 'response',
    fn: async ([spider, url]: [Spider, string]) => {
        try {
            return await http.request(url);
        } catch (error) {
            console.error('Requesting failure: ' + url);
            spider.urls.enqueue(url);
            return error;
        }
    },
}
handlers.download = {
    inputs: ['urls', 'paths'],
    fn: async ([urls, paths]: [string[], string[]]) => {
        let url, path;
        while (urls.length) {
            url = urls.pop() as string;
            path = paths.pop() as string;
            try {
                await http.download(url, path);
            } catch (error) {
                urls.push(url);
                paths.push(path);
            }
        }
    },
}
