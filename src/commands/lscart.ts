import * as EFood from '..';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('lscart')
        .description('Lists all cart items.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler(cmd) {

    console.log('Getting cart contents...\n');

    let cart = session.store.cart;
    let store = await session.getStore();
    let cartItems = 
        (await Promise.all(
            session.store.cart.products
                .map(p => 
                    session.getMenuItemOptions(p.product_id)
                        .then(r => `[${p.total}€] ${r.data.name}`))));

    console.log(`Store: ${c.cyan(store.information.title)}`);

    console.log('\nCart contents');

    for(let cartItem of cartItems)
        console.log(c.cyan(cartItem));

    console.log();

};
