import EFoodSession from '../EFoodSession';
import * as inquirer from 'inquirer';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('setaddr [addressId]')
        .description('Sets the current address.')
        .action(handler)
        .consoleHandler = async function() {

            session.log(`Getting user addresses ...`);

            let addresses = await session.getUserAddresses();
            let choices = [];

            for (let address of addresses)
                choices.push(`[${address.id}] ${address.title}`);

            let input = await inquirer.prompt([{
                name: 'setaddr',
                message: 'Select current address',
                type: 'list',
                choices
            }]);

            let addressId = addresses[choices.indexOf(input.setaddr)].id;

            session.log(`Setting address to [cyan]${addressId}[/cyan] ...`);
            await session.setAddress(addressId);
            session.log(`[green]Success![/green]`);

        };

}

async function handler(addressId) {
    session.log(`Setting user address to [cyan]${addressId}[/cyan] ...`);
    await session.setAddress(addressId);
    session.log(`[green]Success![/green]`);
};
