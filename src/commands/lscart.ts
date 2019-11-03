import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '..';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('lscart')
        .description('Lists all cart items.')
        .action(handler)
        .consoleHandler = handler;
}

async function handler(cmd: any) {
    console.log('Getting cart contents...\n');

    const store = await session.getStore();
    const cartItems =
        (await Promise.all(
            session.store.cart.products
                .map((p) =>
                    session.getMenuItemOptions(p.product_id)
                        .then((r) => `[${p.total}€] ${r.data.name}`))));

    console.log(`Store: ${c.cyan(store.information.title)}`);

    console.log('\nCart contents');

    for (const cartItem of cartItems) {
        console.log(c.cyan(cartItem));
    }

    console.log();
}
