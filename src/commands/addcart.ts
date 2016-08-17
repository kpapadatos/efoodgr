import EFoodSession from '../EFoodSession';
import * as inquirer from 'inquirer';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('addcart')
        .alias('ac')
        .description('Adds cart entry.')
        .option('-i, --item [itemCode]', 'Item code.')
        .option('-c, --config [config]', 'Item options. <optionNumber:choice1,choiceN::optionNumber2:choice>')
        .option('-q, --quantity [number]', 'Item quantity.')
        .action(handler)
        .consoleHandler = async function() {

            session.log(`Getting menu items ...`);

            let items = await session.getMenu();
            let choices = [];

            for (let item of items)
                choices.push(`[${item.price}€] ${item.name}`);

            let input = await inquirer.prompt([{
                name: 'selectitem',
                message: 'Select an item',
                type: 'list',
                choices
            }]);

            let itemId = 'IT_' + items[choices.indexOf(input.selectitem)].id;

            session.log(`Getting options for [cyan]${itemId}[/cyan] ...`);

            let itemChoices = await session.getItem(itemId);

            let itemConfig;

            if (itemChoices.length) {
                itemConfig = [];
                for (let choice of itemChoices) {
                    let choices = choice.choices.map(c => `[${c.price.trim()}€] ${c.title}`);
                    let input = await inquirer.prompt([{
                        name: 'opt',
                        message: choice.title,
                        type: 'checkbox',
                        choices
                    }]);
                    if (input.opt.length) {
                        itemConfig.push(
                            choice.id + ':' +
                            input.opt
                                .map(s => choice.choices[choices.indexOf(s)].id)
                                .join(',')
                        );
                    }
                }
                itemConfig = itemConfig.join('::');
            }

            let { quantity } = await inquirer.prompt([{
                name: 'quantity',
                message: 'Quantity'
            }]);

            session.log(`Adding item to cart...`);

            await session.addToCart({
                quantity,
                item: itemId,
                config: itemConfig
            });

            session.log(`[green]Done.[/green]`);

        };

}

async function handler(cmd) {
    session.log(`Adding item to cart...`);
    await session.addToCart(cmd);
    session.log(`[green]Done.[/green]`);
};
