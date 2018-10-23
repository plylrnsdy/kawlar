import Spider from '../../src/core/Spider';

new Spider({
    handlers: [{
        pattern: '**',
        handle: async response => {
            let title = await response.xpath('//h1');
            console.log(title.text());
        },
    }],
})
    .schedule('0 * * * * *', 'https://httpbin.org/html')
    .start()
