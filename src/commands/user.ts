import * as EFood from '../index';
import * as c from 'chalk';

var session: EFood.Session;

export default function(program, s: EFood.Session) {

    session = s;

    program
       .command('user')
       .alias('u')
       .description('Shows current user info.')
       .action(handler);

}

async function handler() {
   let u = await session.getUser();
   console.log(`Logged in as ${c.cyan(`[${u.id}] ${u.first_name} ${u.last_name} (${u.email})`)}.`);
};
