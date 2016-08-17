import EFoodSession from '../EFoodSession';

var session: EFoodSession;

export default function(program, s: EFoodSession) {

    session = s;

    program
       .command('user')
       .alias('u')
       .description('Shows current user info.')
       .action(handler);

}

async function handler() {
   let u = await session.getUser();
   session.log(`Logged in as [cyan][${u.id}] ${u.firstName} ${u.lastName} (${u.email})[/cyan].`);
};
