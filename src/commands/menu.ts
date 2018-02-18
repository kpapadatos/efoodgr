import * as EFood from '../index';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('menu')
        .description('Gets the menu of the selected store.')
        .action(handler);

}

async function handler(cmd) {

    console.log(`Getting menu for ${c.cyan(session.store.storeId)} ...`);

    let store = await session.getStore();

    let items = store.menu.categories as EFood.MenuCategories[];

    for (let item of items)
        for (let product of item.items)
            console.log(c.cyan(`[${product.code}] [${product.price}€] ${product.name}`));

};
