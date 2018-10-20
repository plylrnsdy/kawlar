import Spider from '../../src/core/Spider';

new Spider({
    handlers: [{
        pattern: '**',
        handle: async response => {
            let title = await response.xpath('//h1') as string;
            console.log(title as string);
        },
    }],
})
    .schedule('0 * * * * *', 'https://httpbin.org/html')
    .start()
