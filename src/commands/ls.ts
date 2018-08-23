import * as EFood from '../index';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('ls')
        .description('Lists stores for current address.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler() {
    if (session.store.addressId === undefined)
        console.log(`No address is set. Run ${c.cyan(`setaddr`)} first.`);
        return;

    console.log(`Getting stores for address ${c.cyan(session.store.addressId)} ...`);
    let addresses = await session.getUserAddresses();

    let address = addresses.filter(a => a.id == session.store.addressId)[0];

    let shops = await session.getStores({
        latitude: address.latitude,
        longitude: address.longitude,
        onlyOpen: true
    });

    for (let shop of shops)
        console.log(c.cyan(`[${shop.id}] [${shop.average_rating}*] [${shop.minimum_order}€] [${shop.delivery_eta}min] ${shop.title}`));

};
