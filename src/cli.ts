const _package = require('../package');

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
    }
  }
});

import * as fs from 'fs';
import * as path from 'path';
import * as program from 'commander';
import * as EFood from './index';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';

var session = new EFood.Session({ persistent: true });

program.usage('<command> [options]');

program.version(_package.version);

require('./commands/addcart').default(program, session);
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
require('./commands/payment').default(program, session);
require('./commands/validate').default(program, session);

program.parse(process.argv);

var consoleCommandIndex: any = {};

for (let command of program['commands']) {

  if (!command.consoleHandler)
    continue;

  consoleCommandIndex[command._name] = command;

  if (command._alias)
    consoleCommandIndex[command._alias] = command;

}

consoleCommandIndex.debug = { async consoleHandler() { console.log(session.store); } };
consoleCommandIndex.exit = { async consoleHandler() { process.exit(); } };
consoleCommandIndex.help = {
  async consoleHandler() {
    console.log(`

  Commands:

  login|l                 Login with your efood.gr account.
  logout|lo               Removes all local data.
  setaddress|setaddr      Sets the default address.
  payment                 Sets the payment method.
  ls                      Lists the stores for the current address.
  setstore                Sets the store.
  addcart|ac              Selects, configures and adds an item to the cart.
  lscart                  Lists your cart's contents.
  mkorder                 Places the order.

`);
  }
};

if (!process.argv[2])
  initEfoodConsole();

function initEfoodConsole() {

  console.log(
    chalk.bold(chalk.red('\n                  e-food.gr\n')) +
    chalk.white(`                    ${_package.version} \n\n`) +
    chalk.green(
      "          _........_      |\\||-|\\||-/|/|\n" +
      "        .'     o    '.     \\\\|\\|//||///\n" +
      "       /   o       o  \\    |\\/\\||//||||\n" +
      "      |o        o     o|   |||\\\\|/\\\\ ||\n" +
      "      /'-.._o     __.-'\\   | './\\_/.' |\n" +
      "      \\      \`\`\`\`\`     \\   | .:.  .:. |\n" +
      "      |\`\`............'\`|   | :  ::  : |\n" +
      "       \\              /    | :  ''  : |\n" +
      "        \`.__________.\`      '.______.'\n" +
      "\n") +
    chalk.white(`  This is an unofficial tool! Tread lightly :)\n`)
  );

  (function listen() {
    let prefix = session.store.user ? `${chalk.bold(chalk.cyan(session.store.user.first_name))}@` : '';
    inquirer.prompt([
      {
        name: 'cmd',
        message: prefix + chalk.red('efood') + '> ',
        validate: input => {
          let command = input.match(/^([^ ]*)/)[1];

          if (command in consoleCommandIndex)
            return true;
          else {
            return `Unknown command: '${command}'`;
          }
        }
      }
    ]).then(input => consoleCommandIndex[input.cmd].consoleHandler().then(listen))
  })();

}
