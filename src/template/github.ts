import { template, chain, link } from "../seeker";


// https://github.com/plylrnsdy/seeker/raw/master/README.md
template(
    'https://github.com{(?:/[^/]+){2}}/raw{(?:/[^/]+)+}.md',
    chain(
        link('to.array', { inputs: ['url'], output: 'urls' }),
        link('regexp.match', { inputs: ['url'], args: [/[^/]+$/], output: 'paths' }),
        link('download', { inputs: ['urls', 'paths'] })
    ));
