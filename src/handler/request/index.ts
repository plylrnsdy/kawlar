import * as _ from 'lodash';
import Http from './Http';
import { handlers } from "../../seeker";

const http = new Http();

handlers.request = {
    inputs: ['url'], output: 'response',
    fn: async function ([url]: [string]) {
        try {
            return await http.request(url);
        } catch (error) {
            console.error('Requesting failure: ' + url);
            this.add(url);
            return error;
        }
    },
}
handlers.download = {
    inputs: ['urls', 'paths'],
    fn: async function ([urls, paths]: [string[], string[]]) {
        let url, path;
        while (urls.length) {
            url = urls.pop() as string;
            path = paths.pop() as string;
            try {
                await http.download(url, 'user/' + this.name + '/' + path);
            } catch (error) {
                urls.push(url);
                paths.push(path);
            }
        }
    },
}
