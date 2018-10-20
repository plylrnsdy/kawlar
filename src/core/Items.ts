import { Response } from 'node-fetch';


export default class Items {

    [key: string]: any

    constructor(public $response: Response) { }

    pack(object: any) {
        Object.assign(this, object);
        return this;
    }
    unpack(props: string[]) {
        for (let prop of props) {
            delete this[prop];
        }
        return this
    }
}
