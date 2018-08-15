import * as fs from 'fs';
import { join } from 'path';
import stringify from '../common/stringify';

const encoding = 'utf8';

export default class Configuration {
    /**
     * @param {string} fsPath the folder of configuration files(*.json).
     * @memberof Configuration
     */
    constructor(private fsPath: string) { }

    private jsonObjects = new Map<string, any>();

    subscribe(path: string, object: any) {
        this.jsonObjects.set(path, object);
    }
    unsubscribe(path: string) {
        return this.jsonObjects.delete(path);
    }

    private parsePath(path: string) {
        return join(this.fsPath, path + '.json');
    }
    load<T>(path: string, Constructor?: new (data: any) => T): T {
        let file = this.parsePath(path),
            data = fs.existsSync(file)
                ? JSON.parse(fs.readFileSync(file, encoding))
                : undefined;
        return Constructor ? new Constructor(data) : data;
    }
    save(path?: string, object?: any) {
        if (path && object) {
            let file = this.parsePath(path),
                string = stringify(object);
            fs.writeFileSync(file, string, encoding);
        }
        else if (!path) {
            this.jsonObjects.forEach((object, path) => this.save(path, object));
        }
    }
}
