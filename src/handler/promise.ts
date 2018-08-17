import * as _ from 'lodash';
import { handlers } from "../seeker";


handlers.promise = {
    resolve: {
        inputs: ['id'],
        fn: function ([id]: [number]) { this.resolve(id) },
    },
}
