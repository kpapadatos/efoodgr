import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('lsaddr')
        .description('Lists the current user\'s addresses.')
        .action(handler);
}

async function handler() {
    console.log('Getting addresses...');
    const addresses = await session.getUserAddresses();

    for (const address of addresses) {
        console.log(c.cyan(`[${address.id}] ${address.description}`));
    }
}
