import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
       .command('menu')
       .description('Gets the menu of the selected store.')
       .action(handler);

}

async function handler(cmd) {

   session.log(`Getting menu for [cyan]${session.cache.env.store}[/cyan] ...`);

   let items = await session.getMenu();

   for (let item of items)
       session.log(`[cyan][IT_${item.id}] [${item.price}€] ${item.name}[/cyan]`);

};
