# Seeker

A spider framework for Node.js.

## Feature

- Set different handler for extracting data from the page's url which match different patterns;
- Set same handler for saving data in pipeline;
- Schedule task fetching in specify time, according to `cron`.

## Useage

```typescript
new Spider({
    handlers: [{
        pattern: 'https://segmentfault.com/*',
        handle: function (response) {
            response
                .xpath('//*[contains(@class,"page-fmt")]/*[position()<last()-2]')
                .then(page => console.log((page as string[]).join('')));
        },
    }],
})
    .enqueue('https://segmentfault.com/markdown')
    .start()

```

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
