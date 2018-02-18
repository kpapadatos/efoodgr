import * as EFood from '../index';
import * as c from 'chalk';

var session: EFood.Session;

export default function(program, s: EFood.Session) {

    session = s;

    program
        .command('logout')
        .alias('lo')
        .description('Removes all local data.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler(addressId) {
    console.log(`Deleting all local data...`);
    await session.logout();
    console.log(c.green('Success!'));
};
