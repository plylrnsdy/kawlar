# Seeker

A spider framework for Node.js.

## Feature

- Set different handler for extracting data from the page's url which match different patterns;
- Set same handler for saving data in pipeline;
- Schedule task fetching in specify time, according to [`cron`](https://github.com/node-schedule/node-schedule#cron-style-scheduling).

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

- options
  - `handlers`: defined how to `handle` url which matches `pattern`
    - `pattern`: can be `RegExp` or [`globs`](https://github.com/isaacs/node-glob)
    - `handle(response, items)`: a function to handle response

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
