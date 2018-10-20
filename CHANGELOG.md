# Change Log

## 0.4.1.6
+ Add `options.level` limit logger's output;
+ Add counting about fetching operations;
+ Add class `Items`.

## 0.4.1.3
+ Add output to terminal;
* Change `response { css.model(), xpath.model(), re.model() }` to `response { cssModel(), xpathModel(), reModel() }`;
* Fix `response.xpath()` getter likes `/@href` will return `Atrr` instead of its value;
* Fix `response.css()` selector's getter likes `::html()` will remove content.

## 0.4.0
* New Design.
    * concept `Source` inspired by [html-scrapper](https://github.com/harish2704/html-scrapper)
    * `response { css(), xpath(), re() }`, `pipeline` inspired by [scrapy](https://github.com/scrapy/scrapy)
    * `response { css.model(), xpath.model(), re.model() }` inspired by [node-scrapy](https://github.com/eeshi/node-scrapy)
* Set different handler for extracting data from the page's url which match different patterns;
* Set same handler for saving data in pipeline;
* Schedule task fetching in specify time, according to `cron`.

---

## 0.1.12
* New CLI.

## 0.1.11
+ Example project of download.

## 0.1.10
* Change thisArg `this` of handler pointing to current spider.

## 0.1.9
+ Spider can be active or deactive;
* New fetching mode:
    * Concurrent fetching;
    + Maximum concurrent connections.

## 0.1.6
* Refactor namespace `seeker`.

## 0.1.5
* Split the test project;
* Use `Spider#addUrls` to add urls to urls queue, instead of using `Spider#urls.enqueue()`.

## 0.1.4
* Change handler arguments;
* Retry for requesting failure.

## 0.1.2
* Better Spider extend functions.

## 0.1.1
+ Every project has its spider.

## 0.1.0
+ Modular spider.
