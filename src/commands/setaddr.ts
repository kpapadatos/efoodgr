import * as EFood from '../index';
import * as inquirer from 'inquirer';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('setaddr [addressId]')
        .description('Sets the current address.')
        .action(handler)
        .consoleHandler = async function () {
            if (session.store.sessionId === undefined)
                console.log(`You need to login to perform this action. Run ${c.cyan(`login`)} first.`)
                return;

            console.log(`Getting user addresses ...`);

            let addresses = await session.getUserAddresses();
            let choices = [];

            for (let address of addresses)
                choices.push(`[${address.id}] ${address.description}`);

            let input = await inquirer.prompt([{
                name: 'setaddr',
                message: 'Select current address',
                type: 'list',
                choices
            }]);

            let addressId = addresses[choices.indexOf(input.setaddr)].id;

            console.log(`Setting address to ${c.cyan(addressId)} ...`);
            await session.setAddress(addressId);
            console.log(c.green(`Success!`));

        };

}

async function handler(addressId) {
    console.log(`Setting user address to ${c.cyan(addressId)} ...`);
    await session.setAddress(addressId);
    console.log(c.green(`Success!`));
};
