import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as inquirer from 'inquirer';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
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
        .consoleHandler = async () => {
            console.log(`Getting menu items ...`);

            const store = await session.getStore();
            const categories = store.menu.categories;
            const offers = store.offers;

            let itemGroup = 'Menu';

            if (offers.length) {
                itemGroup = (await inquirer.prompt([{
                    choices: ['Offers', 'Menu'],
                    message: 'Select an item group',
                    name: 'itemGroup',
                    type: 'list'
                }])).itemGroup;
            }

            const choices = [];
            let itemSets: EFood.IProduct[][] = [];
            const items: EFood.IProduct[] = [];

            if (itemGroup === 'Menu') {
                const input = (await inquirer.prompt([{
                    choices: categories.map((o) => o.name),
                    message: 'Select a category',
                    name: 'category',
                    type: 'list'
                }]));

                const category = categories.filter((cat) => cat.name === input.category)[0];

                for (const product of category.items) {
                    choices.push(`[${product.price}€] ${product.name}`);
                    items.push(product);
                }

                itemSets = [items];
            } else {
                const input = (await inquirer.prompt([{
                    choices: offers.map((o) => `[${o.price}€] ${o.description}`),
                    message: 'Select an offer',
                    name: 'offer',
                    type: 'list'
                }]));

                const offer = offers.filter((o) => `[${o.price}€] ${o.description}` === input.offer)[0];

                for (const tier of offer.tiers) {
                    tier.items.forEach((i: EFood.IProduct) => i.offer_line = tier.offer_line);
                    itemSets.push(tier.items as EFood.IProduct[]);
                }
            }

            for (const itemSet of itemSets) {
                const priceNameTemplate = (i: any) => i.price ? `[${i.price}€] ${i.name}` : i.name;
                const choiceSet = itemSet.map(priceNameTemplate);
                const input = await inquirer.prompt([{
                    choices: choiceSet,
                    message: 'Select an item',
                    name: 'selectedItem',
                    type: 'list'
                }]);

                const selectedItem = itemSet[choiceSet.indexOf(input.selectedItem)];
                const itemCode = selectedItem.code;
                const offer = selectedItem.offer_line;

                console.log(`Getting options for ${c.cyan(selectedItem.name)} ...`);

                const menuItemResponse = await session.getMenuItemOptions(itemCode);

                const itemOptions = menuItemResponse.data.tiers as EFood.IOptionTier[];

                let itemConfig: any = '';
                let price = menuItemResponse.data.price as number;

                if (itemOptions.length) {
                    itemConfig = [];
                    for (const tier of itemOptions) {
                        const availableChoices = tier.options.map(priceNameTemplate);

                        const inp = await inquirer.prompt([{
                            choices: availableChoices,
                            message: tier.name,
                            name: 'opt',
                            type: tier.type === 'radio' ? 'list' : 'checkbox'
                        }]);

                        if (typeof inp.opt === 'string') {
                            inp.opt = [inp.opt];
                        }

                        if (inp.opt.length) {
                            itemConfig.push(
                                inp.opt
                                    .map((chosenItem: any) => {
                                        const option = tier.options[availableChoices.indexOf(chosenItem)];
                                        price += option.price;
                                        return option.code;
                                    })
                            );
                        }
                    }

                    itemConfig = itemConfig.join(',');
                }

                const { comment }: { comment: string } = await inquirer.prompt([{
                    message: 'Comment',
                    name: 'comment'
                }]);

                const { quantity }: { quantity: number } = await inquirer.prompt([{
                    default: 1,
                    message: 'Quantity',
                    name: 'quantity'
                }]);

                console.log(`Adding item to cart...`);

                session.addToCart({
                    comment,
                    config: itemConfig,
                    item: itemCode,
                    offer,
                    price,
                    quantity: quantity || 1
                });
            }

            console.log(c.green(`Done.`));
        };
}

async function handler(cmd: any) {
    console.log(`Adding item to cart...`);
    await session.addToCart(cmd);
    console.log(c.green(`Done.`));
}
