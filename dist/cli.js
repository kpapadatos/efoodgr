"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const _package = require('../package');
require('./catchPromisePolyfill');
// For the love of God
Object.defineProperty(Object.prototype, 'getQuestion', {
    set() {
        // ...
    },
    get() {
        return function () {
            var message = chalk.bold(this.opt.message) + ' ';
            if (this.opt.default != null && this.status !== 'answered')
                message += chalk['dim']('(' + this.opt.default + ') ');
            return message;
        };
    }
});
const program = require('commander');
const EFoodSession_1 = require('./EFoodSession');
const inquirer = require('inquirer');
const chalk = require('chalk');
var session = new EFoodSession_1.default({ verbose: true, persistentCache: true });
program.usage('<command> [options]');
program.version(_package.version);
// for (let file of fs.readdirSync(path.resolve(__dirname, 'commands')))
// require(`./commands/${file}`).default(program, session);
require('./commands/addaddress').default(program, session);
require('./commands/addcart').default(program, session);
require('./commands/dropaddr').default(program, session);
require('./commands/dropcart').default(program, session);
require('./commands/item').default(program, session);
require('./commands/login').default(program, session);
require('./commands/logout').default(program, session);
require('./commands/ls').default(program, session);
require('./commands/lsaddr').default(program, session);
require('./commands/lscart').default(program, session);
require('./commands/menu').default(program, session);
require('./commands/mkorder').default(program, session);
require('./commands/setaddr').default(program, session);
require('./commands/setstore').default(program, session);
require('./commands/user').default(program, session);
program.parse(process.argv);
var consoleCommandIndex = {};
for (let command of program['commands']) {
    if (!command.consoleHandler)
        continue;
    consoleCommandIndex[command._name] = command;
    if (command._alias)
        consoleCommandIndex[command._alias] = command;
}
consoleCommandIndex.debug = { consoleHandler() {
        return __awaiter(this, void 0, void 0, function* () { console.log(session.cache); });
    } };
consoleCommandIndex.exit = { consoleHandler() {
        return __awaiter(this, void 0, void 0, function* () { process.exit(); });
    } };
consoleCommandIndex.help = { consoleHandler() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`

  Commands:

  login|l                 Login with your efood.gr account.
  logout|lo               Removes all local data.
  setaddress|setaddr      Sets the default address.
  ls                      Lists the stores for the current address.
  setstore                Sets the store.
  addcart|ac              Selects, configures and adds an item to the cart.
  lscart                  Lists your cart's contents.
  dropcart                Empties your cart.
  mkorder                 Places the order.

`);
        });
    } };
if (!process.argv[2])
    initEfoodConsole();
function initEfoodConsole() {
    console.log(chalk.bold(chalk.red('\n                  e-FOOD.gr\n')) +
        chalk.white(`                    ${_package.version} \n\n`) +
        chalk.green("          _........_      |\\||-|\\||-/|/|\n" +
            "        .'     o    '.     \\\\|\\|//||///\n" +
            "       /   o       o  \\    |\\/\\||//||||\n" +
            "      |o        o     o|   |||\\\\|/\\\\ ||\n" +
            "      /'-.._o     __.-'\\   | './\\_/.' |\n" +
            "      \\      \`\`\`\`\`     \\   | .:.  .:. |\n" +
            "      |\`\`............'\`|   | :  ::  : |\n" +
            "       \\              /    | :  ''  : |\n" +
            "        \`.__________.\`      '.______.'\n" +
            "\n") +
        chalk.white(`  This is an unofficial tool! Tread lightly :)\n`));
    (function listen() {
        let prefix = session.cache.user.id ? `${chalk.bold(chalk.cyan(session.cache.user.firstName))}@` : '';
        inquirer.prompt([
            {
                name: 'cmd',
                message: prefix + 'efood> ',
                validate: input => {
                    let command = input.match(/^([^ ]*)/)[1];
                    if (command in consoleCommandIndex)
                        return true;
                    else {
                        return `Unknown command: '${command}'`;
                    }
                }
            }
        ]).then(input => consoleCommandIndex[input.cmd].consoleHandler().then(listen));
    })();
}
