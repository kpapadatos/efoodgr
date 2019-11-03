import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('menu')
        .description('Gets the menu of the selected store.')
        .action(handler);
}

async function handler(cmd: any) {
    console.log(`Getting menu for ${c.cyan(session.store.storeId.toString())} ...`);

    const store = await session.getStore();

    const items = store.menu.categories as EFood.IMenuCategories[];

    for (const item of items) {
        for (const product of item.items) {
            console.log(c.cyan(`[${product.code}] [${product.price}€] ${product.name}`));
        }
    }
}
