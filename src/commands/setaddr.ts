import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as inquirer from 'inquirer';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('setaddr [addressId]')
        .description('Sets the current address.')
        .action(handler)
        .consoleHandler = async () => {
            console.log(`Getting user addresses ...`);

            const addresses = await session.getUserAddresses();
            const choices = [];

            for (const address of addresses) {
                choices.push(`[${address.id}] ${address.description}`);
            }

            const input = await inquirer.prompt([{
                choices,
                message: 'Select current address',
                name: 'setaddr',
                type: 'list',
            }]);

            const addressId = addresses[choices.indexOf(input.setaddr)].id;

            console.log(`Setting address to ${c.cyan(addressId.toString())} ...`);
            await session.setAddress(addressId);
            console.log(c.green(`Success!`));
        };
}

async function handler(addressId: number) {
    console.log(`Setting user address to ${c.cyan(addressId.toString())} ...`);
    await session.setAddress(addressId);
    console.log(c.green(`Success!`));
}
