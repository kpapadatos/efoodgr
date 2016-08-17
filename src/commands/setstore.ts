import EFoodSession from '../EFoodSession';
import * as inquirer from 'inquirer';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('setstore [storeId]')
        .description('Sets the store.')
        .action(handler)
        .consoleHandler = async function() {

            session.log(`Getting stores for address [cyan]${session.cache.env.address}[/cyan] ...`);

            let shops = await session.getStores();
            let listOptions = [];

            for (let shop of shops)
                listOptions.push(`[${shop.rating}*] [${shop.min}€] [${shop.eta}min] ${shop.name}`);

            await new Promise(resolve => inquirer.prompt([{
                name: 'setstore',
                message: 'Select a store',
                type: 'list',
                choices: listOptions
            }]).then(async function(input) {

                let storeId = shops[listOptions.indexOf(input.setstore)].id;

                session.log(`Setting store to [cyan]${storeId}[/cyan] ...`);
                await session.setStore(storeId);
                session.log(`[green]Success![/green]`);

                resolve();

            }));

        };

}

async function handler(storeId) {
    session.log(`Setting store to [cyan]${storeId}[/cyan] ...`);
    await session.setStore(storeId);
    session.log(`[green]Success![/green]`);
};
