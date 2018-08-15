import * as seeker from "./seeker";
import sleep from './common/sleep';


const { configuration, spiders } = seeker;


; (async function main() {
    while (true) {
        for (let [, s] of spiders)
            while (await s.fetch());
        await sleep(60000);
    }
})();


process.on('SIGINT', () =>
    process.stdout.write('Do you want to exit? (y/n): '));

process.stdin.on('data', (input: Buffer) => {
    if (input.toString()[0].toLowerCase() !== 'y') return;
    configuration.save();
    process.exit();
});
