import * as EFood from '../index';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('lsaddr')
        .description('Lists the current user\'s addresses.')
        .action(handler);

}

async function handler() {

    console.log('Getting addresses...');
    let addresses = await session.getUserAddresses();

    for (let address of addresses)
        console.log(c.cyan(`[${address.id}] ${address.description}`));

};
