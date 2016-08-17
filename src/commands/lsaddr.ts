import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('lsaddr')
        .description('Lists the current user\'s addresses.')
        .action(handler);

}

async function handler() {

    session.log('Getting addresses...');
    let addresses = await session.getUserAddresses();

    for (let address of addresses)
        session.log(`[cyan][${address.id}] ${address.title}[/cyan]`);

};
