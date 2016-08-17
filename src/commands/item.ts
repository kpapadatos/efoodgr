import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('item [itemCode]')
        .alias('i')
        .description('Gets menu item info.')
        .action(handler);

}

async function handler(itemCode) {

    session.log(`Getting item [cyan]${itemCode}[/cyan] info...`);

    let itemOptions = await session.getItem(itemCode);


    for (let option of itemOptions) {
        session.log(`[cyan][${option.id}] ${option.title}[/cyan]`);

        for (let choice of option.choices)
            session.log(`    [cyan][${choice.id}] [${choice.price.trim()}€] ${choice.title}[/cyan]`);
    }

};
