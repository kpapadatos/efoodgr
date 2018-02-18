import * as EFood from '../index';
import * as c from 'chalk';
import * as inquirer from 'inquirer';

var session: EFood.Session;

export default function(program, s: EFood.Session) {

    session = s;

    program
        .command('setstore [storeId]')
        .description('Sets the store.')
        .action(handler)
        .consoleHandler = async function() {

            console.log(`Getting stores for address ${c.cyan(session.store.addressId)} ...`);
            
            let addresses = await session.getUserAddresses();

            let address = addresses.filter(a => a.id == session.store.addressId)[0];
            
            let shops = await session.getStores({
                latitude: address.latitude,
                longitude: address.longitude,
                onlyOpen: true
            });

            let listOptions = [];

            for (let shop of shops)
                listOptions.push(`[${shop.average_rating}*] [${shop.minimum_order}€] [${shop.delivery_eta}min] ${shop.title}`);

            await new Promise(resolve => inquirer.prompt([{
                name: 'setstore',
                message: 'Select a store',
                type: 'list',
                choices: listOptions
            }]).then(async function(input) {

                let storeId = shops[listOptions.indexOf(input.setstore)].id;

                console.log(`Setting store to ${c.cyan(storeId)} ...`);
                await session.setStore(storeId);
                console.log(c.green(`Success!`));

                resolve();

            }));

        };

}

async function handler(storeId) {
    console.log(`Setting store to ${c.cyan(storeId)} ...`);
    await session.setStore(storeId);
    console.log(c.green(`Success!`));
};
