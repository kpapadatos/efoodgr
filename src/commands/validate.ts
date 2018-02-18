import * as EFood from '../index';
import * as inquirer from 'inquirer';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('validate')
        .description('Validates your current cart.')
        .action(handler)
        .consoleHandler = handler;

}

async function handler(cmd) {

    console.log(`Validating...`);

    let success = await session.validateOrder();

    if (success)
        console.log(c.green(`Success!`));
    else
        console.log(c.red(`Validation failed.`));

};
