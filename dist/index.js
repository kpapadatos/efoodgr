"use strict";
const _package = require('../package');
require('./catchPromisePolyfill');
const program = require('commander');
const EFoodSession_1 = require('./EFoodSession');
var session = new EFoodSession_1.default({ verbose: true, persistentCache: true });
program.usage('<command> [options]');
program.version(_package.version);
program
    .command('login')
    .alias('l')
    .description('Log in with your efood.gr account.')
    .option('-u, --username <user>', 'user identification')
    .option('-p, --password <password>', 'user password')
    .action(cmd => session.login(cmd.username, cmd.password));
program
    .command('menu')
    .description('Gets the menu of the selected store.')
    .action(cmd => session.getMenu());
program
    .command('setstore [storeId]')
    .description('Sets the store.')
    .action(cmd => session.setStore(cmd));
program
    .command('addcart')
    .alias('ac')
    .description('Adds cart entry.')
    .option('-i, --item [itemCode]', 'Item code.')
    .option('-c, --config [config]', 'Item options. <optionNumber:choice1,choiceN::optionNumber2:choice>')
    .option('-q, --quantity [number]', 'Item quantity.')
    .action(cmd => session.addToCart(cmd));
program
    .command('mkorder')
    .description('Places the order.')
    .action(cmd => session.makeOrder());
program
    .command('dropcart')
    .description('Empties the cart.')
    .action(cmd => session.dropCart());
program
    .command('lscart')
    .description('Lists all cart items.')
    .action(cmd => session.getCart(cmd));
program
    .command('item [itemCode]')
    .alias('i')
    .description('Gets menu item info.')
    .action(cmd => session.getItem(cmd));
program
    .command('ls')
    .description('Lists stores for current address.')
    .action(cmd => session.listStores());
program
    .command('logout')
    .alias('lo')
    .description('Removes all local data.')
    .action(cmd => session.logout());
program
    .command('setaddr [addressId]')
    .description('Sets the current address.')
    .action(cmd => session.setAddress(cmd));
program
    .command('lsaddr')
    .description('Lists the current user\'s addresses.')
    .action(cmd => session.getUserAddresses());
program
    .command('user')
    .alias('u')
    .description('Shows current user info.')
    .action(cmd => session.getUser());
program.parse(process.argv);
