import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('ls')
        .description('Lists stores for current address.')
        .action(handler)
        .consoleHandler = handler;
}

async function handler() {
    console.log(`Getting stores for address ${c.cyan(session.store.addressId.toString())} ...`);
    const addresses = await session.getUserAddresses();

    const address = addresses.filter((a) => a.id === session.store.addressId)[0];

    const shops = await session.getStores({
        latitude: address.latitude,
        longitude: address.longitude,
        onlyOpen: true
    });

    for (const shop of shops) {
        console.log(c.cyan(`[${shop.id}] [${shop.average_rating}*] [${shop.minimum_order}€] [${shop.delivery_eta}min] ${shop.title}`));
    }
}
