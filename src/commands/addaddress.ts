import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('addaddress')
        .alias('addaddr')
        .description('Adds an address to your account.')
        .option('--lat [lat]', 'Address latitude.')
        .option('--lon [lon]', 'Address longitude.')
        .option('--street [street]', 'Street name.')
        .option('--sn [sn]', 'Street number.')
        .option('--zip [zip]', 'Zip code.')
        .option('-f, --floor [floor]', 'Floor to deliver to.')
        .option('-n, --name [name]', 'Name on the doorbell.')
        .action(handler);

}

async function handler(cmd) {

    session.log(`Adding address to your account...`);

    let response = await session.addAddress(cmd);

    if (response.error_code != 'success')
        return session.log(`[red]There was an error adding this address: [/red] ${response.message}`)

    session.log('[green]Success![/green]');

};
