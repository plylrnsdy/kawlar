import * as readline from 'readline';

const completions = '.help .exit'.split(' ')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '$ ',
    // Tab 自动补全
    completer(line: string) {
        const hits = completions.filter((c) => c.startsWith(line))
        // 如果没匹配到则展示全部补全
        return [hits.length ? hits : completions, line]
    },
    // 历史输入
    historySize: 30,
    // 当新输入行与历史输入列表中的某行相同时，那么移除旧有的行
    removeHistoryDuplicates: true
})

const print = console.log.bind(console)
const cmd: { [cmd: string]: Function } = {
    'help': () => print('command list:', completions.join(' ')),
    'exit': () => rl.close(),
}

rl
    .on('line', line =>
        (line in cmd ? cmd[line] : print)(line.trim()))
    // when: ctrl + c
    .on('SIGINT', () =>
        rl.question('Do you want to exit? (y/N): ', answer =>
            answer.match(/^y(es)?$/i) && rl.close()))
    .on('close', () =>
        process.exit(0))
