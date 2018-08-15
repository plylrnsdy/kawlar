import * as _ from 'lodash';
import Http from './Http';
import { handlers } from "../../seeker";

const http = new Http();

handlers.request = {
    inputs: ['url'], output: 'response',
    fn: async (url: string) => await http.request(url),
}
handlers.download = {
    inputs: ['urls', 'paths'],
    fn: async (urls: string[], paths: string[]) =>
        _.each(urls, async (url, i) =>
            await http.download(url, paths[i])),
}
