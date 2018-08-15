import { template, chain, link } from "../seeker";


template(
    /^https?:\/\/nodejs\.(?:cn|org)\/$/,
    chain(
        link('request'),
        link('cheerio.parse'),
        link('cheerio.extract',
            { args: ['nav a', 'text'], output: 'titles' }),
        link('to.console', { inputs: ['titles'] }),
    ));

template(
    'http{s?}://nodejs.{(?:cn|org)}/api/',
    chain(
        link('request'),
        link('cheerio.parse'),
        link('cheerio.extract',
            { args: ['#column2>ul:first-of-type a', 'attr', 'href'], output: 'urls' }),
        link('urls.resolve'),
        link('to.urlQueue'),
    ));

template(
    'http{s?}://nodejs.{(?:cn|org)}/api/{[^.]+}.html',
    chain(
        link('request'),
        link('cheerio.parse'),
        link('cheerio.extract',
            { args: ['h1', 'text'], output: 'title' }),
        link('to.console', { inputs: ['title'] }),
    ));
