import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as inquirer from 'inquirer';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('setstore [storeId]')
        .description('Sets the store.')
        .action(handler)
        .consoleHandler = async () => {
            console.log(`Getting stores for address ${c.cyan(session.store.addressId.toString())} ...`);

            const addresses = await session.getUserAddresses();

            const address = addresses.find((a) => a.id === session.store.addressId);

            const shops = await session.getStores({
                latitude: address.latitude,
                longitude: address.longitude,
                onlyOpen: true
            });

            const listOptions: string[] = [];

            for (const shop of shops) {
                listOptions.push(`[${shop.average_rating}*] [${shop.minimum_order}€] [${shop.delivery_eta}min] ${shop.title}`);
            }

            await new Promise((resolve) => inquirer.prompt([{
                choices: listOptions,
                message: 'Select a store',
                name: 'setstore',
                type: 'list'
            }]).then(async (input) => {
                const storeId = shops[listOptions.indexOf(input.setstore)].id;

                console.log(`Setting store to ${c.cyan(storeId.toString())} ...`);
                await session.setStore(storeId);
                console.log(c.green(`Success!`));

                resolve();
            }));
        };
}

async function handler(storeId: number) {
    console.log(`Setting store to ${c.cyan(storeId.toString())} ...`);
    await session.setStore(storeId);
    console.log(c.green(`Success!`));
}
