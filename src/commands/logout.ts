import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('logout')
        .alias('lo')
        .description('Removes all local data.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler(addressId) {
    session.log(`Deleting all local data...`);
    await session.logout();
    session.log('[green]Success![/green]');
};
