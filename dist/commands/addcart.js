"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const inquirer = require('inquirer');
var session;
function default_1(program, s) {
    session = s;
    program
        .command('addcart')
        .alias('ac')
        .description('Adds cart entry.')
        .option('-i, --item [itemCode]', 'Item code.')
        .option('-c, --config [config]', 'Item options. <optionNumber:choice1,choiceN::optionNumber2:choice>')
        .option('-q, --quantity [number]', 'Item quantity.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            session.log(`Getting menu items ...`);
            let items = yield session.getMenu();
            let choices = [];
            for (let item of items)
                choices.push(`[${item.price}€] ${item.name}`);
            let input = yield inquirer.prompt([{
                    name: 'selectitem',
                    message: 'Select an item',
                    type: 'list',
                    choices: choices
                }]);
            let itemId = 'IT_' + items[choices.indexOf(input.selectitem)].id;
            session.log(`Getting options for [cyan]${itemId}[/cyan] ...`);
            let itemChoices = yield session.getItem(itemId);
            let itemConfig;
            if (itemChoices.length) {
                itemConfig = [];
                for (let choice of itemChoices) {
                    let choices = choice.choices.map(c => `[${c.price.trim()}€] ${c.title}`);
                    let input = yield inquirer.prompt([{
                            name: 'opt',
                            message: choice.title,
                            type: 'checkbox',
                            choices: choices
                        }]);
                    if (input.opt.length) {
                        itemConfig.push(choice.id + ':' +
                            input.opt
                                .map(s => choice.choices[choices.indexOf(s)].id)
                                .join(','));
                    }
                }
                itemConfig = itemConfig.join('::');
            }
            let { quantity } = yield inquirer.prompt([{
                    name: 'quantity',
                    message: 'Quantity'
                }]);
            session.log(`Adding item to cart...`);
            yield session.addToCart({
                quantity: quantity,
                item: itemId,
                config: itemConfig
            });
            session.log(`[green]Done.[/green]`);
        });
    };
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        session.log(`Adding item to cart...`);
        yield session.addToCart(cmd);
        session.log(`[green]Done.[/green]`);
    });
}
;
