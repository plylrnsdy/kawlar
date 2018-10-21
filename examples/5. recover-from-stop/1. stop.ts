import Spider from '../../src/core/Spider';
import options from './options';


let spider = new Spider(options)
    .enqueue('https://httpbin.org/html')
    .start();

setTimeout(() => spider.finish(), 20 * 1000);
