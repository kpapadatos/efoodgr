import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
       .command('lscart')
       .description('Lists all cart items.')
       .action(handler)
       .consoleHandler = handler;

}

async function handler(cmd) {

   let cart = session.getCart(cmd);

   session.log(`Shop Id: [cyan]${cart.shop_id}[/cyan]`);

   cart.items.forEach(i => session.log(`[cyan]${JSON.stringify(i)}[/cyan]`));

};
