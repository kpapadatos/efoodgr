"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const c = require("chalk");
var session;
function default_1(program, s) {
    session = s;
    program
        .command('addcart')
        .alias('ac')
        .description('Adds cart entry.')
        .option('-i, --item [itemCode]', 'Item code.')
        .option('-c, --config [config]', 'Item options. <materialCode1,materialCode2,materialCodeN>')
        .option('-q, --quantity [number]', 'Item quantity.')
        .option('--comment [comment]', 'A comment for this item.')
        .option('--offer [offer]', 'The offer line Id for this item.')
        .action(handler)
        .consoleHandler = function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Getting menu items ...`);
            let store = yield session.getStore();
            let categories = store.menu.categories;
            let offers = store.offers;
            let itemGroup = 'Menu';
            if (offers.length)
                itemGroup = (yield inquirer.prompt([{
                        name: 'itemGroup',
                        message: 'Select an item group',
                        type: 'list',
                        choices: ['Offers', 'Menu']
                    }])).itemGroup;
            let choices = [];
            let itemSets = [];
            let items = [];
            if (itemGroup == 'Menu') {
                let input = (yield inquirer.prompt([{
                        name: 'category',
                        message: 'Select a category',
                        type: 'list',
                        choices: categories.map(o => o.name)
                    }]));
                let category = categories.filter(c => c.name == input.category)[0];
                for (let product of category.items) {
                    choices.push(`[${product.price}€] ${product.name}`);
                    items.push(product);
                }
                itemSets = [items];
            }
            else {
                let input = (yield inquirer.prompt([{
                        name: 'offer',
                        message: 'Select an offer',
                        type: 'list',
                        choices: offers.map(o => `[${o.price}€] ${o.description}`)
                    }]));
                let offer = offers.filter(o => `[${o.price}€] ${o.description}` == input.offer)[0];
                for (let tier of offer.tiers) {
                    tier.items.forEach((i) => i.offer_line = tier.offer_line);
                    itemSets.push(tier.items);
                }
            }
            for (let items of itemSets) {
                let priceNameTemplate = i => i.price ? `[${i.price}€] ${i.name}` : i.name;
                let choices = items.map(priceNameTemplate);
                let input = yield inquirer.prompt([{
                        name: 'selectedItem',
                        message: 'Select an item',
                        type: 'list',
                        choices
                    }]);
                let selectedItem = items[choices.indexOf(input.selectedItem)];
                let itemCode = selectedItem.code;
                let offer = selectedItem.offer_line;
                console.log(`Getting options for ${c.cyan(selectedItem.name)} ...`);
                let menuItemResponse = yield session.getMenuItemOptions(itemCode);
                let itemOptions = menuItemResponse.data.tiers;
                let itemConfig = '';
                let price = menuItemResponse.data.price;
                if (itemOptions.length) {
                    itemConfig = [];
                    for (let tier of itemOptions) {
                        let choices = tier.options.map(priceNameTemplate);
                        let input = yield inquirer.prompt([{
                                name: 'opt',
                                message: tier.name,
                                type: tier.type == 'radio' ? 'list' : 'checkbox',
                                choices
                            }]);
                        if (typeof input.opt == 'string')
                            input.opt = [input.opt];
                        if (input.opt.length)
                            itemConfig.push(input.opt
                                .map(s => {
                                let option = tier.options[choices.indexOf(s)];
                                price += option.price;
                                return option.code;
                            }));
                    }
                    itemConfig = itemConfig.join(',');
                }
                let { comment } = yield inquirer.prompt([{
                        name: 'comment',
                        message: 'Comment'
                    }]);
                let { quantity } = yield inquirer.prompt([{
                        name: 'quantity',
                        message: 'Quantity',
                        default: 1
                    }]);
                console.log(`Adding item to cart...`);
                session.addToCart({
                    quantity: quantity || 1,
                    item: itemCode,
                    config: itemConfig,
                    offer,
                    price,
                    comment
                });
            }
            console.log(c.green(`Done.`));
        });
    };
}
exports.default = default_1;
function handler(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Adding item to cart...`);
        yield session.addToCart(cmd);
        console.log(c.green(`Done.`));
    });
}
;
