import * as _ from 'lodash';
import { handlers } from "../seeker";
import { writeFileSync } from 'fs';
import { mkdirpSync } from 'fs-extra';


handlers.file = {
    text: {
        inputs: ['path', 'text'],
        fn: (path: string, text: string) => {
            mkdirpSync(path);
            writeFileSync(path, text, 'utf8');
        },
    },
    binary: {
        inputs: ['path', 'buffer'],
        fn: (path: string, buffer: Buffer) => {
            mkdirpSync(path);
            writeFileSync(path, buffer, 'binary');
        },
    },
}
