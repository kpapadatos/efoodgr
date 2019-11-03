import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('logout')
        .alias('lo')
        .description('Removes all local data.')
        .action(handler)
        .consoleHandler = handler;
}

async function handler(addressId: string) {
    console.log(`Deleting all local data...`);
    await session.logout();
    console.log(c.green('Success!'));
}
