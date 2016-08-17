import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('ls')
        .description('Lists stores for current address.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler() {

    session.log(`Getting stores for address [cyan]${session.cache.env.address}[/cyan] ...`);
    let shops = await session.getStores();
    
    for (let shop of shops)
        session.log(`[cyan][${shop.id}] [${shop.rating}*] [${shop.min}€] [${shop.eta}min] ${shop.name}[/cyan]`);

};
