import * as EFood from '../index';
import * as inquirer from 'inquirer';
import * as c from 'chalk';

var session: EFood.Session;

export default function (program, s: EFood.Session) {

    session = s;

    program
        .command('login')
        .alias('l')
        .description('Log in with your efood.gr account.')
        .option('-u, --username <user>', 'user identification')
        .option('-p, --password <password>', 'user password')
        .action(handler)
        .consoleHandler = async function () {

            let { username, password } = await inquirer.prompt([
                {
                    name: 'username',
                    message: 'Enter the email address of your account:'
                },
                {
                    name: 'password',
                    type: 'password',
                    message: 'Enter your password:'
                }
            ]);

            await handler({ username, password });

        };

}

async function handler(cmd) {

    console.log(`Logging in as ${c.cyan(cmd.username)} ...`);

    let success = await session.login(cmd.username, cmd.password);

    if (success)
        console.log(c.green(`Success!`));
    else
        console.log(c.red(`Login failed.`));

};
