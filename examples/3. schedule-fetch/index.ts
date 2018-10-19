import Spider from '../../src/core/Spider';

new Spider({
    handlers: [{
        pattern: '**',
        handle: function (response, items) {
            console.log('pass')
            response
                .xpath('//h1')
                .then(title => console.log(title as string));
        },
    }],
})
    .schedule('0 * * * * *', 'https://httpbin.org/html')
    .start()
