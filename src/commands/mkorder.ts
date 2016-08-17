import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('mkorder')
        .description('Places the order.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler(cmd) {

    session.log('Placing order...');

    await session.makeOrder({
        onCartUpdated() {
           session.log('Cart updated. Sending final order request...');
        },
        onOrderRequestError(response) {
           session.log(`An error occured while placing the order: [red]${JSON.stringify(response)}[/red]`);
        },
        onOrderPlaced() {
           session.log(`Order placed. Awaiting approval...`);
        },
        onNotApprovedYet() {
           session.log('Not approved yet. Checking again...');
        }
    });

    session.log('[green]Order complete![/green]');

};
