import * as seeker from "./seeker";
import * as plugin from './core/plugin';
import sleep from './common/sleep';


const { urls, templates, configuration } = seeker;

plugin.load('/extension/{**/index,*}.js');
plugin.load('/handler/{**/index,*}.js');
plugin.load('/template/{**/index,*}.js');


async function fetch(url: string) {
    for (const [re, pl] of templates) {
        if (re.test(url)) {
            await pl({ url });
            return;
        }
    }
    console.error('No handlers for url: ' + url);
}

; (async function main() {
    while (true) {
        while (!urls.isEmpty()) {
            await fetch(urls.dequeue() as string);
        }
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
