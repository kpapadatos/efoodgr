import c from 'chalk';
import { CommanderStatic } from 'commander';
import * as EFood from '../index';

let session: EFood.Session;

export default function (program: CommanderStatic, s: EFood.Session) {

   session = s;

   program
      .command('user')
      .alias('u')
      .description('Shows current user info.')
      .action(handler);

}

async function handler() {
   const u = await session.getUser();
   console.log(`Logged in as ${c.cyan(`[${u.id}] ${u.first_name} ${u.last_name} (${u.email})`)}.`);
}
