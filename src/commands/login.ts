import EFoodSession from '../EFoodSession';
import * as inquirer from 'inquirer';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
        .command('login')
        .alias('l')
        .description('Log in with your efood.gr account.')
        .option('-u, --username <user>', 'user identification')
        .option('-p, --password <password>', 'user password')
        .action(handler)
        .consoleHandler = async function() {

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

    session.log(`Logging in as [cyan]${cmd.username}[/cyan] ...`);

    let response = await session.login(cmd.username, cmd.password);

    if (response.success)
        session.log(`[green]Success![/green]`);
    else
        session.log(`[red]Login failed:[/red] ${response.error.err_msg}`);

};
