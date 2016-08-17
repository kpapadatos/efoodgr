import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
       .command('dropcart')
       .description('Empties the cart.')
       .action(handler)
       .consoleHandler = handler;

}

async function handler() {

   await session.dropCart();

   session.log('Cart emptied.');

};
