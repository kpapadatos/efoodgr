import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
       .command('dropaddr [addressId]')
       .description('Removes address from your account.')
       .action(handler);

}

async function handler(addressId) {

   session.log(`Removing address [cyan]${addressId}[/cyan] from your account...`);

   let response = await session.dropAddress(addressId);

   if (response.error_code != 'success')
       return session.log(`[red]Error removing address:[/red] ${response.message}`);

   session.log(`[green]Success![/green]`);

};
