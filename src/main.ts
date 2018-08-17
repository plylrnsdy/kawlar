import * as seeker from "./seeker";


seeker.run();


process.on('SIGINT', () =>
    process.stdout.write('Do you want to exit? (y/n): '));

process.stdin.on('data', (input: Buffer) => {
    if (input.toString()[0].toLowerCase() !== 'y') return;
    seeker.configuration.save();
    process.exit();
});
