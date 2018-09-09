import { handlers } from "../seeker";
import * as _ from 'lodash';


handlers.regexp = {
    match: {
        fn: ([str]: [string], [regexp]: [RegExp]) => str.match(regexp),
    },
}
