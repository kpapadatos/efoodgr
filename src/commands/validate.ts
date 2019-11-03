import chalk from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '../index';

let session: EFood.Session;
const { green, red } = chalk;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('validate')
        .description('Validates your current cart.')
        .action(handler)
        .consoleHandler = handler;
}

async function handler() {
    console.log(`Validating...`);

    const success = await session.validateOrder();

    if (success) {
        console.log(green(`Success!`));
    } else {
        console.log(red(`Validation failed.`));
    }
}
