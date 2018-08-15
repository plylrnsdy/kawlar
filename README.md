# Seeker

A modular javascript spider in Node.js.

## Feature

- Modular spider:
    - Extandable namespace `seeker` which provide tools;
    - Addible free combination of handler;
    - Difference url-pattern has difference handling mode.

## Useage

Define a handling mode for a url-pattern:

```javascript
import { template, chain, link } from "../seeker";

template(
    // UrlPattern, can be a string or RegExp
    'http{s?}://nodejs.{(?:cn|org)}/api/{[^.]+}.html',
    // Handling mode, a queue of handler
    chain(
        // Handler, a function. More detail can see `handler/*.ts`
        link('request'),
        // A handler with default options
        link('cheerio.parse'),
        // A handler with user options
        link('cheerio.extract',
            // User options
            { args: ['h1', 'text'], output: 'title' }),
        link('to.console', { inputs: ['title'] }),
    ));
```

Input a list of url to `user/tasks.json`:

```javascript
["http://nodejs.cn/api/"]
// => [ 'Node.js v10.8.0 文档', 'assert - 断言#' ]
// => ...
// => [ 'Node.js v10.8.0 文档', 'Zlib#' ]
```

Input a list of cron/url pair to `user/repetitive.json` for repetitive task:

```javascript
[
    // A repetitive task
    [
        "0 * * * * *",      // Cron
        "http://nodejs.cn/" // Url
    ]
    // => [ '首页', '下载', '文档', 'GitHub', '云服务器' ]
]
```

## Install

Download:

    git clone https://github.com/plylrnsdy/seeker.git

Install:

    npm install

## Contribution

Submit the [issues][issues] if you find any bug or have any suggestion.

Or fork the [repo][repository] and submit pull requests.

## About

Author：plylrnsdy

Github：[seeker][repository]


[issues]:https://github.com/plylrnsdy/seeker/issues
[repository]:https://github.com/plylrnsdy/seeker
