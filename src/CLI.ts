import chalk from 'chalk';
import * as program from 'commander';
import { EventEmitter2 } from 'eventemitter2';
import * as inquirer from 'inquirer';
import * as EFood from './index';

import addcart from './commands/addcart';
import login from './commands/login';
import logout from './commands/logout';
import ls from './commands/ls';
import lsaddr from './commands/lsaddr';
import lscart from './commands/lscart';
import menu from './commands/menu';
import mkorder from './commands/mkorder';
import payment from './commands/payment';
import setaddr from './commands/setaddr';
import setstore from './commands/setstore';
import user from './commands/user';
import validate from './commands/validate';

export default class CLI extends EventEmitter2 {
  private static CACHE_FILE = `${process.env.USERPROFILE}/.cache.efoodgr.json`;

  constructor(private args: string[]) {
    super();

    const { red, cyan, white, green } = chalk;
    const { version } = require('../package');

    const session = new EFood.Session();

    program.usage('<command> [options]');

    program.version(version);

    addcart(program, session);
    login(program, session);
    logout(program, session);
    ls(program, session);
    lsaddr(program, session);
    lscart(program, session);
    menu(program, session);
    mkorder(program, session);
    payment(program, session);
    setaddr(program, session);
    setstore(program, session);
    user(program, session);
    validate(program, session);

    program.parse(process.argv);

    const consoleCommandIndex: any = {};

    for (const command of program.commands) {
      if (!command.consoleHandler) {
        continue;
      }

      consoleCommandIndex[command._name] = command;

      if (command._alias) {
        consoleCommandIndex[command._alias] = command;
      }
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

    if (!process.argv[2]) {
      initEfoodConsole();
    }

    function initEfoodConsole() {
      console.log(
        red('\n                  e-food.gr\n') +
        white(`                    ${version} \n\n`) +
        green(
          '          _........_      |\\||-|\\||-/|/|\n' +
          '        .\'     o    \'.     \\\\|\\|//||///\n' +
          '       /   o       o  \\    |\\/\\||//||||\n' +
          '      |o        o     o|   |||\\\\|/\\\\ ||\n' +
          '      /\'-.._o     __.-\'\\   | \'./\\_/.\' |\n' +
          '      \\      \`\`\`\`\`     \\   | .:.  .:. |\n' +
          '      |\`\`............\'\`|   | :  ::  : |\n' +
          '       \\              /    | :  \'\'  : |\n' +
          '        \`.__________.\`      \'.______.\'\n' +
          '\n') +
        white(`  This is an unofficial tool! Tread lightly :)\n`)
      );

      (function listen() {
        const prefix = session.store.user ? `${cyan(session.store.user.first_name)}@` : '';
        inquirer.prompt([
          {
            message: prefix + red('efood') + '> ',
            name: 'cmd',
            validate: (input) => {
              const command = input.match(/^([^ ]*)/)[1];

              if (command in consoleCommandIndex) {
                return true;
              } else {
                return `Unknown command: '${command}'`;
              }
            }
          }
        ]).then((input) => consoleCommandIndex[input.cmd].consoleHandler().then(listen));
      })();
    }
  }
}
