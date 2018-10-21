# Seeker

A spider framework for Node.js.

## Feature

- Set different handler for extracting data from the page's url which match different patterns;
- Set same handler for saving data in pipeline;
- Schedule task fetching in specify time, according to [`cron`](https://github.com/node-schedule/node-schedule#cron-style-scheduling);
- Stop a spider, save the state to `project.json`, and recover from `project.json`.

## Useage

```javascript
new Spider({
    handlers: [{
        pattern: 'https://github.com/*/*',
        handle: async response => {
            let title = await response.xpath('//title/text()');
            console.log(title);
        },
    }],
})
    .enqueue('https://github.com/plylrnsdy/seeker')
    .start();
```

## API

### new Spider(options)

Create a Spider for fetching page.

#### options
- `level`: Show output which level greater or equal to `level`. It can be `log`, `trace`, `debug`, `info`(default), `warn`, `error`, `fatal`.
- `rateLimit`: Limit spider's requesting one *host* *x* times in *y* second, `{ host: [x, y], ... }`.
- `handlers`: A array of `handler`, defined how to `handle` url which matches `pattern`.
    - `handler`:
        - `pattern`: Can be `RegExp` or [`globs`](https://github.com/isaacs/node-glob).
        - `headers`: Request headers.
        - `handle(response, items)`: A function to handle response.
            - `this`: The instance of `Spider`.
                - `enqueue(uri)`
                - `pipe(items)`: Pass `items` to pipeline
            - `response`: See [`node-fetch`](https://github.com/bitinn/node-fetch).
                - `css(selector)`
                - `xpath(path)`
                - `re(regexp)`
                - `cssModel(model)`
                - `xpathModel(model)`
                - `reModel(model)`
            - `items`:
                - `pack(object)`
                - `unpack(props)`
        - `except`: Another `handler` for match `pattern`, be need its own way to handle data.
- `pipelines`: Pass `items` to these functions one by one.

### Spider#enqueue(uri)

- `uri` string | Request: A page's uri, which you want to fetch.

### Spider#schedule(cron, uri)

- [`cron`](https://github.com/node-schedule/node-schedule#cron-style-scheduling) string: Cron-style string.
- `uri` string | Request: A page's uri, which you want to fetch.

### Spider#start()

Start to fetch the `uri` in queue.

### Spider#stop()

Stop, waiting for executing `start()`.

### Spider#finish()

Stop, save state to `project.json` and exit.

## Install

Download:

    git clone https://github.com/plylrnsdy/seeker.git

Install:

    npm install

Build:

    npm run compile

## Contribution

Submit the [issues][issues] if you find any bug or have any suggestion.

Or fork the [repo][repository] and submit pull requests.

## About

Author：plylrnsdy

Github：[seeker][repository]


[issues]:https://github.com/plylrnsdy/seeker/issues
[repository]:https://github.com/plylrnsdy/seeker
