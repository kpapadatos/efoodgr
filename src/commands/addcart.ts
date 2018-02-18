import * as EFood from '../index';
import * as inquirer from 'inquirer';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

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
        .consoleHandler = async function () {

            console.log(`Getting menu items ...`);

            let store = await session.getStore();
            let categories = store.menu.categories;
            let offers = store.offers;

            let itemGroup = 'Menu';

            if (offers.length)
                itemGroup = (await inquirer.prompt([{
                    name: 'itemGroup',
                    message: 'Select an item group',
                    type: 'list',
                    choices: ['Offers', 'Menu']
                }])).itemGroup;


            let choices = [];
            let itemSets: EFood.Product[][] = [];
            let items: EFood.Product[] = [];

            if (itemGroup == 'Menu') {
                let input = (await inquirer.prompt([{
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
                let input = (await inquirer.prompt([{
                    name: 'offer',
                    message: 'Select an offer',
                    type: 'list',
                    choices: offers.map(o => `[${o.price}€] ${o.description}`)
                }]));

                let offer = offers.filter(o => `[${o.price}€] ${o.description}` == input.offer)[0];

                for (let tier of offer.tiers) {
                    tier.items.forEach((i: EFood.Product) => i.offer_line = tier.offer_line);
                    itemSets.push(tier.items as EFood.Product[]);
                }
            }

            for (let items of itemSets) {

                let priceNameTemplate = i => i.price ? `[${i.price}€] ${i.name}` : i.name;
                let choices = items.map(priceNameTemplate);
                let input = await inquirer.prompt([{
                    name: 'selectedItem',
                    message: 'Select an item',
                    type: 'list',
                    choices
                }]);

                let selectedItem = items[choices.indexOf(input.selectedItem)];
                let itemCode = selectedItem.code;
                let offer = selectedItem.offer_line;

                console.log(`Getting options for ${c.cyan(selectedItem.name)} ...`);

                let menuItemResponse = await session.getMenuItemOptions(itemCode);

                let itemOptions = menuItemResponse.data.tiers as EFood.OptionTier[];

                let itemConfig: any = '';
                let price = menuItemResponse.data.price as number;

                if (itemOptions.length) {
                    itemConfig = [];
                    for (let tier of itemOptions) {
                        let choices = tier.options.map(priceNameTemplate);

                        let input = await inquirer.prompt([{
                            name: 'opt',
                            message: tier.name,
                            type: tier.type == 'radio' ? 'list' : 'checkbox',
                            choices
                        }]);

                        if (typeof input.opt == 'string')
                            input.opt = [input.opt];

                        if (input.opt.length)
                            itemConfig.push(
                                input.opt
                                    .map(s => {
                                        let option = tier.options[choices.indexOf(s)]
                                        price += option.price;
                                        return option.code;
                                    })
                            );
                    }

                    itemConfig = itemConfig.join(',');
                }

                let { comment }: { comment: string } = await inquirer.prompt([{
                    name: 'comment',
                    message: 'Comment'
                }]);

                let { quantity }: { quantity: number } = await inquirer.prompt([{
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

        };

}

async function handler(cmd) {
    console.log(`Adding item to cart...`);
    await session.addToCart(cmd);
    console.log(c.green(`Done.`));
};
