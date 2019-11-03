import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as inquirer from 'inquirer';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {
    session = s;

    program
        .command('login')
        .alias('l')
        .description('Log in with your efood.gr account.')
        .option('-u, --username <user>', 'user identification')
        .option('-p, --password <password>', 'user password')
        .action(handler)
        .consoleHandler = async () => {
            const { username, password } = await inquirer.prompt([
                {
                    message: 'Enter the email address of your account:',
                    name: 'username'
                },
                {
                    message: 'Enter your password:',
                    name: 'password',
                    type: 'password'
                }
            ]);

            await handler({ username, password });
        };
}

async function handler(cmd: any) {
    console.log(`Logging in as ${c.cyan(cmd.username)} ...`);

    const success = await session.login(cmd.username, cmd.password);

    if (success) {
        console.log(c.green(`Success!`));
    } else {
        console.log(c.red(`Login failed.`));
    }
}
